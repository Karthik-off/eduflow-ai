import { supabase } from '@/integrations/supabase/client';

export const runStaffAuthDiagnosis = async () => {
  console.log('=== STAFF AUTH DIAGNOSIS ===');
  
  const results = {
    staffRecords: null as any,
    userRoles: null as any,
    authUsers: null as any,
    diagnosis: [] as string[],
    recommendations: [] as string[]
  };

  try {
    // 1. Check staff records
    console.log('1. Checking staff records...');
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .limit(5);
    
    results.staffRecords = { data: staffData, error: staffError };
    
    if (staffError) {
      results.diagnosis.push(`Staff table error: ${staffError.message}`);
    } else if (!staffData || staffData.length === 0) {
      results.diagnosis.push('No staff records found in database');
      results.recommendations.push('Create sample staff records using /debug/create-staff');
    } else {
      results.diagnosis.push(`Found ${staffData.length} staff records`);
      
      // Check if staff have emails
      const staffWithoutEmails = staffData.filter(s => !s.email);
      if (staffWithoutEmails.length > 0) {
        results.diagnosis.push(`${staffWithoutEmails.length} staff records missing email`);
        results.recommendations.push('Staff records need email addresses for authentication');
      }
    }

    // 2. Check user roles
    console.log('2. Checking user roles...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'staff');
    
    results.userRoles = { data: roleData, error: roleError };
    
    if (roleError) {
      results.diagnosis.push(`User roles table error: ${roleError.message}`);
    } else if (!roleData || roleData.length === 0) {
      results.diagnosis.push('No staff user roles found');
      results.recommendations.push('Staff users need role assignments in user_roles table');
    } else {
      results.diagnosis.push(`Found ${roleData.length} staff role assignments`);
    }

    // 3. Check for missing role assignments
    if (staffData && roleData) {
      const staffUserIds = staffData.map(s => s.user_id);
      const roleUserIds = roleData.map(r => r.user_id);
      const missingRoles = staffUserIds.filter(id => !roleUserIds.includes(id));
      
      if (missingRoles.length > 0) {
        results.diagnosis.push(`${missingRoles.length} staff users missing role assignments`);
        results.recommendations.push('Create missing role assignments for staff users');
      }
    }

    // 4. Test specific staff login
    if (staffData && staffData.length > 0) {
      console.log('3. Testing staff authentication...');
      const testStaff = staffData[0]; // Test first staff member
      
      if (testStaff.email) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: testStaff.email,
            password: 'password123'
          });
          
          if (authError) {
            results.diagnosis.push(`Auth failed for ${testStaff.staff_code}: ${authError.message}`);
            if (authError.message.includes('Invalid login credentials')) {
              results.recommendations.push('Check if staff user exists in auth.users with correct password');
            }
          } else if (authData.user) {
            results.diagnosis.push(`Auth successful for ${testStaff.staff_code}`);
            
            // Check role loading
            const { data: userData, error: userError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', authData.user.id)
              .single();
            
            if (userError || !userData) {
              results.diagnosis.push(`Role lookup failed for authenticated user: ${userError?.message}`);
              results.recommendations.push('Ensure user_roles entry exists for authenticated user');
            } else {
              results.diagnosis.push(`Role found for authenticated user: ${userData.role}`);
            }
            
            // Sign out after test
            await supabase.auth.signOut();
          }
        } catch (testError) {
          results.diagnosis.push(`Auth test error: ${testError}`);
        }
      } else {
        results.diagnosis.push(`Cannot test ${testStaff.staff_code} - no email address`);
      }
    }

  } catch (error) {
    results.diagnosis.push(`Diagnosis error: ${error}`);
  }

  console.log('=== DIAGNOSIS RESULTS ===');
  console.log('Issues found:', results.diagnosis);
  console.log('Recommendations:', results.recommendations);
  console.log('Full results:', results);

  return results;
};

// Make available in window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).runStaffAuthDiagnosis = runStaffAuthDiagnosis;
  console.log('runStaffAuthDiagnosis() available in browser console');
}
