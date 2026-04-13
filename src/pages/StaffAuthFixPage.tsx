import { useState } from 'react';
import { setupStaffAuthManually, testStaffLogin } from '@/utils/simpleStaffAuthFix';

const StaffAuthFixPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const handleCreateUsers = async () => {
    setIsCreating(true);
    try {
      const result = await setupStaffAuthManually();
      setResults(result);
      console.log('Staff auth setup:', result);
    } catch (error) {
      console.error('Error setting up staff auth:', error);
      setResults({ error: String(error) });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    try {
      const result = await setupStaffAuthManually();
      setDiagnosis(result);
      console.log('Staff auth diagnosis:', result);
    } catch (error) {
      console.error('Error diagnosing staff auth:', error);
      setDiagnosis({ error: String(error) });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleTestLogin = async (staffCode: string) => {
    setIsTesting(true);
    try {
      const result = await testStaffLogin(staffCode, 'password123');
      setTestResults(prev => ({ ...prev, [staffCode]: result }));
      console.log(`Test login for ${staffCode}:`, result);
    } catch (error) {
      console.error('Error testing login:', error);
      setTestResults(prev => ({ ...prev, [staffCode]: { error: String(error) } }));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Staff Authentication Fix</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleDiagnose}
              disabled={isDiagnosing}
              className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDiagnosing ? 'Diagnosing...' : 'Diagnose Staff Auth'}
            </button>
            
            <button
              onClick={handleCreateUsers}
              disabled={isCreating}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-0 md:ml-4"
            >
              {isCreating ? 'Setting Up...' : 'Setup Staff Auth'}
            </button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Test Staff Login</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['IT001', 'IT002', 'MATH001', 'PHY001'].map(staffCode => (
                <button
                  key={staffCode}
                  onClick={() => handleTestLogin(staffCode)}
                  disabled={isTesting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Test {staffCode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Users Results</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        {diagnosis && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Diagnosis Results</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(diagnosis, null, 2)}
            </pre>
          </div>
        )}

        {testResults && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Login Results</h2>
            <div className="space-y-3">
              {Object.entries(testResults).map(([staffCode, result]: [string, any]) => (
                <div key={staffCode} className={`p-3 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="font-medium text-gray-800">{staffCode}</div>
                  <div className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.success ? result.message : result.error}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-2">
            <li>First, click "Diagnose Staff Auth" to see the current state</li>
            <li>If manual setup is required, follow the instructions in the results</li>
            <li>After manual setup, click "Setup Staff Auth" to create role assignments</li>
            <li>Test individual staff login with the test buttons</li>
            <li>Try full login at <a href="/login" className="underline">/login</a> with staff credentials</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Manual Setup Required</h3>
          <p className="text-yellow-700 mb-3">
            If users need to be created manually, follow these steps in Supabase Dashboard:
          </p>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1 text-sm">
            <li>Go to Supabase Dashboard &gt; Authentication &gt; Users</li>
            <li>Click "Add user" for each staff member</li>
            <li>Email: john.smith@eduflow.com, Password: password123</li>
            <li>Set email as confirmed</li>
            <li>Add user metadata: staff_code, full_name, role</li>
            <li>Repeat for all staff members</li>
            <li>Run "Setup Staff Auth" to create role assignments</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default StaffAuthFixPage;
