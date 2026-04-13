import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CreateAdminUser: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@eduflow.com');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('System Administrator');
  const [results, setResults] = useState<string[]>([]);

  const createAdminUser = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          full_name: fullName
        }
      });

      if (authError) {
        setResults([`Failed to create auth user: ${authError.message}`]);
        toast.error('Failed to create admin user');
        return;
      }

      if (!authData.user) {
        setResults(['No user data returned']);
        toast.error('Failed to create admin user');
        return;
      }

      // 2. Get or create Computer Science department
      let departmentId = null;
      const { data: departments } = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Computer Science')
        .limit(1);
      
      if (departments && departments.length > 0) {
        departmentId = departments[0].id;
      } else {
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

      // 3. Create admin profile
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          department_id: departmentId
        });

      if (profileError) {
        setResults([`Failed to create admin profile: ${profileError.message}`]);
        toast.error('Failed to create admin profile');
        return;
      }

      // 4. Assign admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin'
        });

      if (roleError) {
        setResults([`Failed to assign admin role: ${roleError.message}`]);
        toast.error('Failed to assign admin role');
        return;
      }

      setResults([
        `Successfully created admin user!`,
        `Email: ${email}`,
        `Password: ${password}`,
        `Name: ${fullName}`,
        `User ID: ${authData.user.id}`
      ]);

      toast.success('Admin user created successfully!');
    } catch (error) {
      console.error('Error creating admin user:', error);
      setResults([`Error: ${error}`]);
      toast.error('Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Admin User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@eduflow.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="System Administrator"
            />
          </div>
          
          <Button 
            onClick={createAdminUser} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Admin User...' : 'Create Admin User'}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdminUser;
