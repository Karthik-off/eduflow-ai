require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const https = require('https');
const { randomUUID } = require('crypto');
const PaytmChecksum = require('paytmchecksum');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// ─── Supabase Admin Client (service role) ────────────────────────
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Helpers ─────────────────────────────────────────────────────
const PAYTM_HOST =
  process.env.PAYTM_ENVIRONMENT === 'PRODUCTION'
    ? 'securegw.paytm.in'
    : 'securegw-stage.paytm.in';

function generateOrderId() {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EDUF-${ts}-${rand}`;
}

function maskLog(obj) {
  const masked = { ...obj };
  if (masked.CHECKSUMHASH) masked.CHECKSUMHASH = '[REDACTED]';
  if (masked.txnToken) masked.txnToken = '[REDACTED]';
  return masked;
}

function paytmApiRequest(apiPath, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: PAYTM_HOST,
      port: 443,
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ┌──────────────────────────────────────────────────────────────────┐
// │  POST /api/payment/process-gpay                                  │
// │  Receives the Google Pay token and processes it server-side.     │
// │  In TEST mode: simulates success. In PROD: forward to processor  │
// └──────────────────────────────────────────────────────────────────┘
router.post('/process-gpay', async (req, res) => {
  const { token, amount, feeId, studentId } = req.body;

  if (!token || !amount) {
    return res.status(400).json({ success: false, error: 'Missing token or amount' });
  }

  const orderId = generateOrderId();
  console.log(`[GPay] Processing — orderId=${orderId} amount=${amount} feeId=${feeId}`);

  try {
    /*
     * PRODUCTION: Forward token to your payment processor, e.g. Stripe:
     *   const intent = await stripe.paymentIntents.create({
     *     amount: Math.round(amount * 100),
     *     currency: 'inr',
     *     payment_method_data: { type: 'card', card: { token } }
     *   });
     *   const isSuccess = intent.status === 'succeeded';
     */
    const transactionId = `GPAY-${orderId}`;
    const isSuccess = process.env.PAYMENT_ENV !== 'PRODUCTION' ? true : false;

    if (isSuccess) {
      // Update fee in Supabase (non-fatal if fees table doesn't exist yet)
      if (feeId && studentId) {
        const { error: dbErr } = await supabase
          .from('fees')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'Google Pay',
            transaction_id: transactionId,
          })
          .eq('id', feeId);

        if (dbErr) {
          console.warn(`[GPay] DB update warning (non-fatal): ${dbErr.message}`);
        }
      }

      console.log(`[GPay] SUCCESS — transactionId=${transactionId}`);
      return res.json({ success: true, transactionId, orderId });
    }

    return res.status(402).json({ success: false, error: 'Payment declined by processor' });
  } catch (err) {
    console.error('[GPay] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ┌──────────────────────────────────────────────────────────────────┐
// │  POST /api/payment/initiate-paytm                               │
// │  Generates checksum & returns txnToken + checkout URL           │
// └──────────────────────────────────────────────────────────────────┘
router.post('/initiate-paytm', async (req, res) => {
  const { amount, feeId, customerId } = req.body;

  if (!amount || !customerId) {
    return res.status(400).json({ success: false, error: 'Missing amount or customerId' });
  }

  const orderId = generateOrderId();
  const mid = process.env.PAYTM_MERCHANT_ID;
  const secretKey = process.env.PAYTM_SECRET_KEY;

  if (!mid || !secretKey || mid === 'your_paytm_mid') {
    return res.status(503).json({
      success: false,
      error: 'Paytm credentials not configured. Please set PAYTM_MERCHANT_ID and PAYTM_SECRET_KEY in .env',
    });
  }

  const paytmParams = {
    body: {
      requestType: 'Payment',
      mid,
      websiteName: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
      orderId,
      callbackUrl: process.env.PAYMENT_CALLBACK_URL,
      txnAmount: { value: Number(amount).toFixed(2), currency: 'INR' },
      userInfo: { custId: String(customerId) },
    },
  };

  try {
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      secretKey
    );
    paytmParams.head = { signature: checksum };

    const data = await paytmApiRequest(
      `/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`,
      paytmParams
    );

    console.log(`[Paytm] Initiated — orderId=${orderId}`, maskLog(data));

    if (data?.body?.resultInfo?.resultStatus === 'S') {
      return res.json({
        success: true,
        txnToken: data.body.txnToken,
        orderId,
        mid,
        amount: paytmParams.body.txnAmount.value,
        checkoutUrl: `https://${PAYTM_HOST}/theia/api/v1/showPaymentPage?mid=${mid}&orderId=${orderId}`,
      });
    }

    return res.status(502).json({
      success: false,
      error: data?.body?.resultInfo?.resultMsg || 'Failed to initiate Paytm transaction',
    });
  } catch (err) {
    console.error('[Paytm] Initiate error:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ┌──────────────────────────────────────────────────────────────────┐
// │  POST /api/payment/callback  (Paytm Webhook)                    │
// │  Verifies checksum → re-verifies via S2S → updates DB           │
// └──────────────────────────────────────────────────────────────────┘
router.post('/callback', async (req, res) => {
  const paytmResponse = { ...req.body };
  const receivedChecksum = paytmResponse.CHECKSUMHASH;
  delete paytmResponse.CHECKSUMHASH;

  console.log('[Paytm Callback] Received:', maskLog(paytmResponse));

  let isValid = false;
  try {
    isValid = PaytmChecksum.verifySignature(
      paytmResponse,
      process.env.PAYTM_SECRET_KEY,
      receivedChecksum
    );
  } catch (err) {
    console.error('[Paytm Callback] Checksum verify error:', err.message);
    return res.status(403).send('Checksum Verification Failed');
  }

  if (!isValid) {
    console.warn('[Paytm Callback] INVALID CHECKSUM — potential fraud');
    return res.status(403).send('Checksum Mismatch');
  }

  const orderId = paytmResponse.ORDERID;

  // Respond 200 immediately; do async DB work after
  const appBase = process.env.VITE_APP_URL || 'http://localhost:8080';
  const status = paytmResponse.STATUS;

  // Fire-and-forget: S2S re-verification + DB update
  setImmediate(async () => {
    try {
      const verifyParams = {
        body: { mid: process.env.PAYTM_MERCHANT_ID, orderId },
      };
      const verifyChecksum = await PaytmChecksum.generateSignature(
        JSON.stringify(verifyParams.body),
        process.env.PAYTM_SECRET_KEY
      );
      verifyParams.head = { signature: verifyChecksum };

      const statusData = await paytmApiRequest('/v3/order/status', verifyParams);
      const txnStatus = statusData?.body?.resultInfo?.resultStatus;
      const txnId = statusData?.body?.txnId;

      console.log(`[Paytm Callback] Verified — orderId=${orderId} status=${txnStatus}`);

      if (txnStatus === 'TXN_SUCCESS') {
        const { error: dbErr } = await supabase
          .from('fees')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'Paytm',
            transaction_id: txnId || orderId,
          })
          .eq('order_id', orderId);

        if (dbErr) {
          console.error(`[Paytm Callback] DB update failed: ${dbErr.message}`);
        } else {
          console.log(`[Paytm Callback] DB updated — orderId=${orderId}`);
        }
      }
    } catch (err) {
      console.error('[Paytm Callback] Async S2S error:', err.message);
    }
  });

  if (status === 'TXN_SUCCESS') {
    return res.redirect(`${appBase}/fees?payment=success&orderId=${orderId}`);
  }
  return res.redirect(`${appBase}/fees?payment=failed&orderId=${orderId}`);
});

// ┌──────────────────────────────────────────────────────────────────┐
// │  GET /api/payment/verify-status?orderId=xxx                     │
// │  Frontend polling endpoint for PENDING orders (CRON fallback)   │
// └──────────────────────────────────────────────────────────────────┘
router.get('/verify-status', async (req, res) => {
  const { orderId } = req.query;
  if (!orderId) return res.status(400).json({ error: 'orderId is required' });

  try {
    const verifyParams = {
      body: { mid: process.env.PAYTM_MERCHANT_ID, orderId },
    };
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(verifyParams.body),
      process.env.PAYTM_SECRET_KEY
    );
    verifyParams.head = { signature: checksum };

    const data = await paytmApiRequest('/v3/order/status', verifyParams);
    const txnStatus = data?.body?.resultInfo?.resultStatus;

    return res.json({ orderId, status: txnStatus, raw: maskLog(data?.body || {}) });
  } catch (err) {
    console.error('[Verify Status] Error:', err.message);
    return res.status(500).json({ error: 'Verification request failed' });
  }
});

module.exports = router;
