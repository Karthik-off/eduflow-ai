import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check staff role
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .in('role', ['staff', 'admin'])
      .limit(1);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Only staff/admin can create student accounts' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, password, fullName, rollNumber, phone, sectionId, departmentId, semesterId } = await req.json();

    if (!email || !password || !fullName || !rollNumber || !sectionId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If caller is staff, verify they are class_incharge for this section
    const staffRole = roles[0].role;
    if (staffRole === 'staff') {
      const { data: staffRecord } = await supabaseAdmin
        .from('staff')
        .select('id')
        .eq('user_id', caller.id)
        .single();

      if (!staffRecord) {
        return new Response(JSON.stringify({ error: 'Staff record not found' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: assignment } = await supabaseAdmin
        .from('staff_assignments')
        .select('id')
        .eq('staff_id', staffRecord.id)
        .eq('section_id', sectionId)
        .eq('role_type', 'class_incharge')
        .eq('is_active', true)
        .limit(1);

      if (!assignment || assignment.length === 0) {
        return new Response(JSON.stringify({ error: 'You are not the class incharge for this section' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Auto-derive department_id and semester_id from the section
    let resolvedDeptId = departmentId || null;
    let resolvedSemId = semesterId || null;
    if (!resolvedDeptId || !resolvedSemId) {
      const { data: sectionRow } = await supabaseAdmin
        .from('sections')
        .select('department_id, semester_id')
        .eq('id', sectionId)
        .single();
      if (sectionRow) {
        if (!resolvedDeptId) resolvedDeptId = sectionRow.department_id;
        if (!resolvedSemId) resolvedSemId = sectionRow.semester_id;
      }
    }

    // Create auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'student' },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Assign student role
    await supabaseAdmin.from('user_roles').insert({
      user_id: newUser.user.id,
      role: 'student',
    });

    // Create student profile
    await supabaseAdmin.from('students').insert({
      user_id: newUser.user.id,
      roll_number: rollNumber,
      full_name: fullName,
      email,
      phone: phone || null,
      section_id: sectionId,
      department_id: resolvedDeptId,
      current_semester_id: resolvedSemId,
    });

    return new Response(JSON.stringify({
      success: true,
      student: { id: newUser.user.id, email, fullName, rollNumber },
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
