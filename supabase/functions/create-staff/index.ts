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

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role using service role client (bypasses RLS)
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'admin')
      .limit(1);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Only admins can create staff accounts' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, password, fullName, staffCode, phone, departmentId } = await req.json();

    if (!email || !password || !fullName || !staffCode) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, fullName, staffCode' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auto-derive department from admin's profile if not provided
    let resolvedDeptId = departmentId || null;
    if (!resolvedDeptId) {
      const { data: adminProfile } = await supabaseAdmin
        .from('admin_profiles')
        .select('department_id')
        .eq('user_id', caller.id)
        .single();
      if (adminProfile?.department_id) {
        resolvedDeptId = adminProfile.department_id;
      }
    }

    // Create auth user using admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'staff' },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Assign staff role
    await supabaseAdmin.from('user_roles').insert({
      user_id: newUser.user.id,
      role: 'staff',
    });

    // Create staff profile with department
    await supabaseAdmin.from('staff').insert({
      user_id: newUser.user.id,
      staff_code: staffCode,
      full_name: fullName,
      email,
      phone: phone || null,
      department_id: resolvedDeptId,
    });

    return new Response(JSON.stringify({
      success: true,
      staff: {
        id: newUser.user.id,
        email,
        fullName,
        staffCode,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
