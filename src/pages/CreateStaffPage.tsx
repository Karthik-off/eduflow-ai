import { useState } from 'react';
import { createSampleStaff } from '@/utils/createSampleStaff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Database } from 'lucide-react';

const CreateStaffPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCreateStaff = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await createSampleStaff();
      setResult({
        success: response.success,
        message: response.success 
          ? 'Sample staff created successfully! You can now test staff login with these credentials:\n\nIT001 - john.smith@eduflow.com - password123\nIT002 - sarah.johnson@eduflow.com - password123\nMATH001 - michael.brown@eduflow.com - password123\nPHY001 - emily.davis@eduflow.com - password123'
          : `Error: ${response.error || 'Unknown error occurred'}`
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Sample Staff Data</h1>
          <p className="text-gray-600">
            This will create sample staff records for testing the staff login functionality.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Sample Staff Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  This will create 4 sample staff members with the following staff codes:
                  <br /><br />
                  <strong>IT001, IT002, MATH001, PHY001</strong>
                  <br /><br />
                  Each staff member will have an email address and default password "password123".
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleCreateStaff}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Staff...
                  </>
                ) : (
                  'Create Sample Staff'
                )}
              </Button>

              {result && (
                <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription className="whitespace-pre-line">
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing Staff Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>After creating sample staff, you can test staff login:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Go to the main login page</li>
                <li>Select "Staff" role</li>
                <li>Enter staff code (e.g., "IT001")</li>
                <li>Enter password: "password123"</li>
                <li>Click "Sign In"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateStaffPage;
