import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

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

const CreateStaffUsers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const createSampleStaff = async () => {
    setLoading(true);
    setResults([]);
    
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
        const result = await createStaffMember(staff, departmentId);
        setResults(prev => [...prev, result]);
      }

      toast.success('Sample staff creation completed!');
    } catch (error) {
      console.error('Error creating sample staff:', error);
      toast.error('Failed to create sample staff');
    } finally {
      setLoading(false);
    }
  };

  const createStaffMember = async (staff: typeof sampleStaff[0], departmentId: string) => {
    try {
      // 1. Create auth user using admin API
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
        return `Failed to create auth user for ${staff.staff_code}: ${authError.message}`;
      }

      if (!authData.user) {
        return `No user data returned for ${staff.staff_code}`;
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
        return `Failed to create staff record for ${staff.staff_code}: ${staffError.message}`;
      }

      // 3. Assign staff role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: authData.user.id,
          role: 'staff'
        });

      if (roleError) {
        return `Failed to assign role for ${staff.staff_code}: ${roleError.message}`;
      }

      return `Successfully created staff: ${staff.staff_code} (${staff.email})`;
    } catch (error) {
      return `Error creating ${staff.staff_code}: ${error}`;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Sample Staff Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will create sample staff users for testing the login functionality.
          </p>
          
          <Button 
            onClick={createSampleStaff} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Staff Users...' : 'Create Sample Staff Users'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Results:</h3>
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className={`text-sm p-2 rounded ${
                    result.includes('Successfully') 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Login Credentials:</h3>
            <div className="space-y-1 text-sm">
              {sampleStaff.map(staff => (
                <div key={staff.staff_code} className="text-blue-700">
                  Staff ID: {staff.staff_code}, Email: {staff.email}, Password: {staff.password}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStaffUsers;
