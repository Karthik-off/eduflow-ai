import { supabase } from '@/integrations/supabase/client';

export const createStaffAuthUsers = async () => {
  console.log('=== CREATING STAFF AUTH USERS ===');
  
  const staffUsers = [
    {
      staff_code: 'IT001',
      email: 'john.smith@eduflow.com',
      password: 'password123',
      full_name: 'John Smith'
    },
    {
      staff_code: 'IT002', 
      email: 'sarah.johnson@eduflow.com',
      password: 'password123',
      full_name: 'Sarah Johnson'
    },
    {
      staff_code: 'MATH001',
      email: 'michael.brown@eduflow.com', 
      password: 'password123',
      full_name: 'Michael Brown'
    },
    {
      staff_code: 'PHY001',
      email: 'emily.davis@eduflow.com',
      password: 'password123', 
      full_name: 'Emily Davis'
    }
  ];

  const results = [];

  for (const staff of staffUsers) {
    console.log(`Creating auth user for ${staff.staff_code} (${staff.email})`);
    
    try {
      // Check if user already exists by listing users and filtering by email
      const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u: any) => u.email === staff.email);
      
      if (checkError) {
        console.log(`Error checking user ${staff.email}:`, checkError.message);
        results.push({ staff_code: staff.staff_code, status: 'error', message: checkError.message });
        continue;
      }

      if (existingUser) {
        console.log(`User ${staff.email} already exists`);
        
        // Create user role if missing
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert([{ 
            user_id: existingUser.id, 
            role: 'staff',
            created_at: new Date().toISOString(),
          }]);
          
        if (roleError) {
          console.log(`Error creating role for ${staff.email}:`, roleError.message);
          results.push({ staff_code: staff.staff_code, status: 'role_error', message: roleError.message });
        } else {
          console.log(`Role created/updated for ${staff.email}`);
          results.push({ staff_code: staff.staff_code, status: 'role_created', message: 'User existed, role created' });
        }
        
        // Update staff record with user_id
        const { error: updateError } = await supabase
          .from('staff')
          .update({ user_id: existingUser.id })
          .eq('email', staff.email);
          
        if (updateError) {
          console.log(`Error updating staff record for ${staff.email}:`, updateError.message);
        } else {
          console.log(`Staff record updated for ${staff.email}`);
        }
        
        continue;
      }

      // Create new auth user
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: staff.email,
        password: staff.password,
        email_confirm: true,
        user_metadata: {
          full_name: staff.full_name,
          staff_code: staff.staff_code,
          role: 'staff'
        }
      });

      if (createError) {
        console.log(`Error creating user ${staff.email}:`, createError.message);
        results.push({ staff_code: staff.staff_code, status: 'error', message: createError.message });
        continue;
      }

      if (authData.user) {
        console.log(`Created auth user for ${staff.email}, ID: ${authData.user.id}`);
        
        // Create user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ 
            user_id: authData.user.id, 
            role: 'staff',
            created_at: new Date().toISOString(),
          }]);
          
        if (roleError) {
          console.log(`Error creating role for ${staff.email}:`, roleError.message);
          results.push({ staff_code: staff.staff_code, status: 'role_error', message: roleError.message });
        } else {
          console.log(`Role created for ${staff.email}`);
          results.push({ staff_code: staff.staff_code, status: 'success', message: 'User and role created' });
        }
        
        // Update staff record with user_id
        const { error: updateError } = await supabase
          .from('staff')
          .update({ user_id: authData.user.id })
          .eq('email', staff.email);
          
        if (updateError) {
          console.log(`Error updating staff record for ${staff.email}:`, updateError.message);
        } else {
          console.log(`Staff record updated for ${staff.email}`);
        }
      }

    } catch (error) {
      console.log(`Unexpected error for ${staff.email}:`, error);
      results.push({ staff_code: staff.staff_code, status: 'unexpected_error', message: String(error) });
    }
  }

  console.log('=== RESULTS ===');
  console.log(results);
  return results;
};

export const diagnoseStaffAuth = async () => {
  console.log('=== DIAGNOSING STAFF AUTH ===');
  
  try {
    // Get all staff records
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*');
      
    if (staffError) {
      console.log('Error fetching staff:', staffError.message);
      return { error: staffError.message };
    }

    const diagnosis = [];

    for (const staff of staffData || []) {
      const staffDiagnosis = {
        staff_code: staff.staff_code,
        email: staff.email,
        has_auth_user: false,
        has_user_role: false,
        user_id_matches: false,
        issues: []
      };

      // Check if auth user exists by listing users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users?.find((u: any) => u.email === staff.email);
      
      if (!authError && authUser) {
        staffDiagnosis.has_auth_user = true;
        
        // Check if user role exists
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('role', 'staff')
          .single();
          
        if (!roleError && roleData) {
          staffDiagnosis.has_user_role = true;
        } else {
          staffDiagnosis.issues.push('Missing user role assignment');
        }
        
        // Check if user_id matches
        if (staff.user_id === authUser.id) {
          staffDiagnosis.user_id_matches = true;
        } else {
          staffDiagnosis.issues.push('User ID mismatch between staff and auth tables');
        }
      } else {
        staffDiagnosis.issues.push('Missing auth user');
      }

      diagnosis.push(staffDiagnosis);
    }

    console.log('DIAGNOSIS RESULTS:');
    console.table(diagnosis);
    
    return diagnosis;
    
  } catch (error) {
    console.log('Diagnosis error:', error);
    return { error: String(error) };
  }
};

// Make available in window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).createStaffAuthUsers = createStaffAuthUsers;
  (window as any).diagnoseStaffAuth = diagnoseStaffAuth;
  console.log('Staff auth utilities available:');
  console.log('- createStaffAuthUsers() - Creates missing auth users and roles');
  console.log('- diagnoseStaffAuth() - Diagnoses staff authentication setup');
}
