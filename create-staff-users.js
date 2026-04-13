// Script to create sample staff users
// Run this with: node create-staff-users.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const sampleStaff = [
  {
    staff_code: 'IT001',
    full_name: 'John Smith',
    email: 'john.smith@eduflow.com',
    phone: '+1234567890',
    password: 'password123'
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

async function createSampleStaff() {
  console.log('Creating sample staff records...');
  
  try {
    // Get the Computer Science department ID
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
        .insert({
          name: 'Computer Science',
          code: 'CS',
          description: 'Computer Science Department'
        })
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

      // 2. Update or create staff record
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .upsert({
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
        .upsert({
          user_id: authData.user.id,
          role: 'staff'
        });

      if (roleError) {
        console.error(`Error assigning role for ${staff.staff_code}:`, roleError);
      }

      console.log(`Successfully created staff: ${staff.staff_code}`);
    }

    console.log('\nSample staff creation completed!');
    console.log('\nLogin credentials:');
    sampleStaff.forEach(staff => {
      console.log(`Staff ID: ${staff.staff_code}, Email: ${staff.email}, Password: ${staff.password}`);
    });
  } catch (error) {
    console.error('Error creating sample staff:', error);
  }
}

createSampleStaff();
