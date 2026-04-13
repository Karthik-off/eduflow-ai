import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StaffRecord {
  staff_code: string;
  full_name: string;
  email: string | null;
}

const StaffDebugPage = () => {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('staff_code, full_name, email')
          .limit(20);
        
        if (error) {
          setError(error.message);
        } else {
          setStaff(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Staff Database Debug</h1>
        
        {loading && (
          <div className="text-center py-8">
            <div className="text-lg">Loading staff data...</div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Staff Records ({staff.length})</h2>
            </div>
            <div className="p-6">
              {staff.length === 0 ? (
                <p className="text-gray-500">No staff records found in the database.</p>
              ) : (
                <div className="space-y-4">
                  {staff.map((staffMember) => (
                    <div key={staffMember.staff_code} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="font-medium text-gray-500">Staff Code:</span>
                          <p className="font-mono text-lg">{staffMember.staff_code}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Full Name:</span>
                          <p className="text-lg">{staffMember.full_name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Email:</span>
                          <p className="text-lg">{staffMember.email || 'No email'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Expected Staff Codes:</h3>
          <p className="text-blue-700">If you're trying to login, use one of the staff codes listed above, or check if staff records exist in the database.</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDebugPage;
