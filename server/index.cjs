require('dotenv').config();
const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/payment.cjs');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.VITE_APP_URL || 'http://localhost:8080',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Raw body parser for Paytm webhook (urlencoded POST)
app.use('/api/payment/callback', express.urlencoded({ extended: false }));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/payment', paymentRoutes);

// ─── Health check ────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.PAYMENT_ENV || 'TEST' });
});

// ─── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[EduFlow Payment Server] Running on http://localhost:${PORT}`);
  console.log(`[EduFlow Payment Server] Environment: ${process.env.PAYMENT_ENV || 'TEST'}`);
});
