import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create client with user's token to get their identity
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { sessionId, secret } = await req.json()
    if (!sessionId || !secret) {
      return new Response(JSON.stringify({ error: 'Missing sessionId or secret' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    // 1. Validate session exists, is active, and secret matches
    const { data: session, error: sessErr } = await admin
      .from('attendance_sessions')
      .select('id, section_id, qr_secret, is_active, expires_at')
      .eq('id', sessionId)
      .single()

    if (sessErr || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!session.is_active) {
      return new Response(JSON.stringify({ error: 'Session has ended' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (session.qr_secret !== secret) {
      return new Response(JSON.stringify({ error: 'QR code expired. Wait for the next one.' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Get student profile
    const { data: student } = await admin
      .from('students')
      .select('id, section_id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return new Response(JSON.stringify({ error: 'Student profile not found' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Verify student belongs to the same section
    if (student.section_id !== session.section_id) {
      return new Response(JSON.stringify({ error: 'You are not in this class section' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Check for duplicate
    const { data: existing } = await admin
      .from('attendance_records')
      .select('id')
      .eq('session_id', sessionId)
      .eq('student_id', student.id)
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Already marked present', already: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. Mark attendance
    const { error: insertErr } = await admin
      .from('attendance_records')
      .insert({
        session_id: sessionId,
        student_id: student.id,
        status: 'present',
      })

    if (insertErr) {
      return new Response(JSON.stringify({ error: 'Failed to mark attendance: ' + insertErr.message }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, message: 'Attendance marked successfully!' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
