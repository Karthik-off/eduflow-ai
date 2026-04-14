// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { runStaffAuthDiagnosis } from '@/utils/staffAuthTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Users, Key, AlertCircle } from 'lucide-react';

interface StaffRecord {
  id: string;
  user_id: string;
  staff_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department_id: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

const StaffLoginDebugPage = () => {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load staff records
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .limit(10);

      if (staffError) {
        console.error('Staff error:', staffError);
      } else {
        setStaff(staffData || []);
      }

      // Load user roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'staff')
        .limit(10);

      if (roleError) {
        console.error('Role error:', roleError);
      } else {
        setUserRoles(roleData || []);
      }

      // Load auth users (limited)
      try {
        const { data: authData } = await supabase.auth.admin.listUsers();
        const staffAuthUsers = authData.users
          .filter(user => user.email && staff.some(s => s.user_id === user.id))
          .map(user => ({
            id: user.id,
            email: user.email || '',
            created_at: user.created_at
          }));
        setAuthUsers(staffAuthUsers);
      } catch (authError) {
        console.error('Auth users error:', authError);
        setAuthUsers([]);
      }

    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testStaffLogin = async (staffCode: string, email: string, password: string) => {
    setTesting(true);
    setTestResult(null);

    try {
      console.log('Testing staff login:', { staffCode, email });
      
      // Step 1: Test staff lookup
      const { data: staffLookup, error: lookupError } = await supabase
        .from('staff')
        .select('*')
        .eq('staff_code', staffCode)
        .single();

      // Step 2: Test role lookup
      const { data: roleLookup, error: roleError } = staffLookup?.user_id 
        ? await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', staffLookup.user_id)
            .single()
        : { data: null, error: new Error('No staff user_id') };

      // Step 3: Test authentication
      let authResult = null;
      let authError = null;
      
      if (email) {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        authResult = data;
        authError = error;
        
        // Sign out immediately after test
        if (data.user) {
          await supabase.auth.signOut();
        }
      }

      setTestResult({
        staffLookup: { data: staffLookup, error: lookupError?.message },
        roleLookup: { data: roleLookup, error: roleError?.message },
        authResult: { 
          success: !!authResult?.user, 
          userId: authResult?.user?.id, 
          error: authError?.message 
        }
      });

    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setTesting(false);
    }
  };

  const fixStaffRoles = async () => {
    setLoading(true);
    try {
      for (const staffMember of staff) {
        // Check if role exists
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', staffMember.user_id)
          .eq('role', 'staff')
          .single();

        if (!existingRole) {
          // Create missing role
          await supabase
            .from('user_roles')
            .insert({
              user_id: staffMember.user_id,
              role: 'staff'
            });
          console.log('Created role for staff:', staffMember.staff_code);
        }
      }
      
      await loadData();
    } catch (error) {
      console.error('Fix roles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runComprehensiveDiagnosis = async () => {
    setDiagnosing(true);
    try {
      const results = await runStaffAuthDiagnosis();
      setDiagnosis(results);
    } catch (error) {
      setDiagnosis({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setDiagnosing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Login Debug</h1>
          <p className="text-gray-600">Comprehensive debugging for staff authentication</p>
          <div className="mt-4">
            <Button 
              onClick={runComprehensiveDiagnosis}
              disabled={diagnosing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {diagnosing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Diagnosis...
                </>
              ) : (
                'Run Comprehensive Diagnosis'
              )}
            </Button>
          </div>
        </div>

        {/* Staff Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Staff Records ({staff.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staff.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No staff records found. Create sample staff first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Staff Code</span>
                        <p className="font-mono font-bold">{staffMember.staff_code}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Name</span>
                        <p className="font-semibold">{staffMember.full_name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email</span>
                        <p className="text-sm">{staffMember.email || 'No email'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">User ID</span>
                        <p className="text-xs font-mono truncate">{staffMember.user_id}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => testStaffLogin(
                          staffMember.staff_code,
                          staffMember.email || '',
                          'password123'
                        )}
                        disabled={testing || !staffMember.email}
                      >
                        Test Login
                      </Button>
                      <Badge variant={staffMember.email ? "default" : "destructive"}>
                        {staffMember.email ? 'Has Email' : 'No Email'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Staff User Roles ({userRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userRoles.length === 0 ? (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No staff roles found. This is likely the issue!
                  </AlertDescription>
                </Alert>
                <Button onClick={fixStaffRoles}>
                  Fix Staff Roles
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {userRoles.map((role) => (
                  <div key={role.user_id} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-mono text-sm">{role.user_id}</span>
                    <Badge variant="outline">{role.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auth Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Auth Users ({authUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {authUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-mono text-sm">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.id}</p>
                  </div>
                  <Badge variant="outline">Auth User</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Results */}
        {diagnosis && (
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Diagnosis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Issues Found:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnosis.diagnosis?.map((issue: string, index: number) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnosis.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Detailed Results:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded max-h-64 overflow-auto">
                    {JSON.stringify(diagnosis, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Staff Lookup</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(testResult.staffLookup, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Role Lookup</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(testResult.roleLookup, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Authentication</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(testResult.authResult, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StaffLoginDebugPage;
