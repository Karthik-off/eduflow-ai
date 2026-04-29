import { supabase } from '@/integrations/supabase/client';

export const setupStaffAuthManually = async () => {
  console.log('=== MANUAL STAFF AUTH SETUP ===');
  
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

  // First, let's check what auth users already exist
  console.log('Checking existing auth users...');
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.log('Error listing users:', listError.message);
    return { error: listError.message };
  }

  console.log('Existing users:', existingUsers.users.map(u => ({ email: u.email, id: u.id })));

  for (const staff of staffUsers) {
    console.log(`\nProcessing staff: ${staff.staff_code} (${staff.email})`);
    
    try {
      // Check if user already exists
      const existingUser = existingUsers?.users?.find((u: any) => u.email === staff.email);
      
      if (existingUser) {
        console.log(`User ${staff.email} already exists with ID: ${existingUser.id}`);
        
        // Create user role if missing
        const { data: existingRole, error: roleCheckError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', existingUser.id)
          .eq('role', 'staff')
          .single();
          
        if (roleCheckError && roleCheckError.code !== 'PGRST116') {
          console.log(`Error checking role for ${staff.email}:`, roleCheckError.message);
        } else if (!existingRole) {
          console.log(`Creating role for existing user ${staff.email}`);
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ 
              user_id: existingUser.id, 
              role: 'staff',
              created_at: new Date().toISOString(),
            }]);
            
          if (roleError) {
            console.log(`Error creating role for ${staff.email}:`, roleError.message);
            results.push({ staff_code: staff.staff_code, status: 'role_error', message: roleError.message });
          } else {
            console.log(`Role created for ${staff.email}`);
            results.push({ staff_code: staff.staff_code, status: 'role_created', message: 'User existed, role created' });
          }
        } else {
          console.log(`Role already exists for ${staff.email}`);
          results.push({ staff_code: staff.staff_code, status: 'already_configured', message: 'User and role already exist' });
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

      // If user doesn't exist, we need to create it manually
      console.log(`User ${staff.email} does not exist. Manual setup required.`);
      results.push({ 
        staff_code: staff.staff_code, 
        status: 'manual_setup_required', 
        message: `User ${staff.email} needs to be created manually in Supabase Admin`,
        instructions: [
          '1. Go to Supabase Dashboard > Authentication > Users',
          '2. Click "Add user"',
          `3. Email: ${staff.email}`,
          `4. Password: ${staff.password}`,
          '5. Set email as confirmed',
          '6. Add user metadata: staff_code, full_name, role',
          '7. Save user',
          '8. Run this script again to create role assignments'
        ]
      });

    } catch (error) {
      console.log(`Unexpected error for ${staff.email}:`, error);
      results.push({ staff_code: staff.staff_code, status: 'unexpected_error', message: String(error) });
    }
  }

  console.log('\n=== SETUP RESULTS ===');
  console.log(results);
  
  // Provide summary
  const manualSetupRequired = results.filter(r => r.status === 'manual_setup_required');
  const alreadyConfigured = results.filter(r => r.status === 'already_configured');
  const roleCreated = results.filter(r => r.status === 'role_created');
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Manual setup required: ${manualSetupRequired.length}`);
  console.log(`Already configured: ${alreadyConfigured.length}`);
  console.log(`Roles created: ${roleCreated.length}`);
  
  if (manualSetupRequired.length > 0) {
    console.log(`\n=== MANUAL SETUP INSTRUCTIONS ===`);
    manualSetupRequired.forEach(r => {
      console.log(`\n${r.staff_code}:`);
      r.instructions?.forEach((instruction, i) => console.log(`  ${i + 1}. ${instruction}`));
    });
  }

  return results;
};

export const testStaffLogin = async (staffCode: string, password: string) => {
  console.log(`=== TESTING STAFF LOGIN: ${staffCode} ===`);
  
  try {
    // Look up staff by code
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('email, staff_code, full_name')
      .eq('staff_code', staffCode)
      .single();
      
    if (staffError || !staffData) {
      return { error: `Staff code ${staffCode} not found` };
    }
    
    console.log(`Found staff: ${staffData.full_name} (${staffData.email})`);
    
    // Test login with email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: staffData.email,
      password: password
    });
    
    if (authError) {
      return { error: `Login failed: ${authError.message}` };
    }
    
    if (authData.user) {
      // Check role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();
        
      if (roleError || !roleData) {
        await supabase.auth.signOut();
        return { error: 'User role not found' };
      }
      
      await supabase.auth.signOut();
      return { 
        success: true, 
        message: `Login successful for ${staffData.full_name}`,
        role: roleData.role,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: roleData.role
        }
      };
    }
    
  } catch (error) {
    return { error: String(error) };
  }
  
  return { error: 'Unknown error' };
};

// Make available in window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).setupStaffAuthManually = setupStaffAuthManually;
  (window as any).testStaffLogin = testStaffLogin;
  console.log('Simple staff auth utilities available:');
  console.log('- setupStaffAuthManually() - Setup staff authentication');
  console.log('- testStaffLogin(staffCode, password) - Test staff login');
}
