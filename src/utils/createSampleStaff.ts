import { supabase } from '@/integrations/supabase/client';

// Sample staff data
const sampleStaff = [
  {
    staff_code: 'IT001',
    full_name: 'John Smith',
    email: 'john.smith@eduflow.com',
    phone: '+1234567890',
    password: 'password123' // Default password for testing
  },
  {
    staff_code: 'IT002',
    full_name: 'Sarah Johnson',
    email: 'sarah.johnson@eduflow.com',
    phone: '+1234567891',
    password: 'password123'
  },
  {
    staff_code: 'MATH001',
    full_name: 'Michael Brown',
    email: 'michael.brown@eduflow.com',
    phone: '+1234567892',
    password: 'password123'
  },
  {
    staff_code: 'PHY001',
    full_name: 'Emily Davis',
    email: 'emily.davis@eduflow.com',
    phone: '+1234567893',
    password: 'password123'
  }
];

export const createSampleStaff = async () => {
  console.log('Creating sample staff records...');
  
  try {
    // Get the Computer Science department ID (or create a default one)
    let departmentId = null;
    const { data: departments } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Computer Science')
      .limit(1);
    
    if (departments && departments.length > 0) {
      departmentId = departments[0].id;
    } else {
      // Create a default department if none exists
      const { data: newDept } = await supabase
        .from('departments')
        .insert([{
          name: 'Computer Science',
          code: 'CS'
        }])
        .select('id')
        .single();
      
      departmentId = newDept?.id;
    }

    for (const staff of sampleStaff) {
      console.log(`Creating staff: ${staff.staff_code} - ${staff.full_name}`);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: staff.email,
        password: staff.password,
        email_confirm: true,
        user_metadata: {
          role: 'staff',
          staff_code: staff.staff_code,
          full_name: staff.full_name
        }
      });

      if (authError) {
        console.error(`Error creating auth user for ${staff.staff_code}:`, authError);
        continue;
      }

      if (!authData.user) {
        console.error(`No user data returned for ${staff.staff_code}`);
        continue;
      }

      // 2. Create staff record
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .insert({
          user_id: authData.user.id,
          staff_code: staff.staff_code,
          full_name: staff.full_name,
          email: staff.email,
          phone: staff.phone,
          department_id: departmentId
        })
        .select()
        .single();

      if (staffError) {
        console.error(`Error creating staff record for ${staff.staff_code}:`, staffError);
        continue;
      }

      // 3. Assign staff role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'staff'
        });

      if (roleError) {
        console.error(`Error assigning role for ${staff.staff_code}:`, roleError);
      }

      console.log(`Successfully created staff: ${staff.staff_code}`);
    }

    console.log('Sample staff creation completed!');
    return { success: true };
  } catch (error) {
    console.error('Error creating sample staff:', error);
    return { success: false, error };
  }
};

// Function to run this in browser console
if (typeof window !== 'undefined') {
  (window as any).createSampleStaff = createSampleStaff;
  console.log('createSampleStaff function available in window.createSampleStaff()');
}
