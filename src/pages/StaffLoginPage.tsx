import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/premium-ui/Button';
import { Input } from '@/components/premium-ui/Input';
import { Card, CardContent, CardHeader } from '@/components/premium-ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, Users, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import '@/styles/eduflow-enhanced.css';

const StaffLoginPage = () => {
  const [staffCode, setStaffCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Lookup email by staff code via edge function
      const { data: lookupData, error: lookupError } = await supabase.functions.invoke('staff-lookup', {
        body: { staff_code: staffCode.trim() },
      });

      if (lookupError || !lookupData?.email) {
        setError(lookupData?.error || 'Staff ID not found. Contact your administrator.');
        setLoading(false);
        return;
      }

      const result = await signIn(lookupData.email, password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        setError('This account is not a staff account.');
        setLoading(false);
      }
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto p-8">
        <Card className="shadow-premium-xl border-0">
          <CardContent className="p-8">
            <div className="text-center space-y-8">
              {/* Logo Section */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    EduFlow
                  </h1>
                  <p className="text-gray-600 text-lg font-medium">Staff Portal</p>
                </div>
              </div>

              {/* Login Form */}
              <div className="space-y-6">
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Login</h2>
                  <p className="text-gray-600 dark:text-gray-400">Use your Staff ID and password to sign in</p>
                </CardHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Staff ID
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. STF001"
                        value={staffCode}
                        onChange={(e) => setStaffCode(e.target.value)}
                        required
                        className="text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="•••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="text-lg pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold shadow-premium-lg hover:shadow-premium-xl transform hover:-translate-y-1 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>

                {/* Links */}
                <div className="text-center space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/login" className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200">
                      Student Login
                    </Link>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you an administrator?{' '}
                    <Link to="/admin/login" className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200">
                      Admin Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StaffLoginPage;
