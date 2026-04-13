import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernCard } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernInput } from '@/components/ui/modern-input';
import { Eye, EyeOff, User, Lock, GraduationCap } from 'lucide-react';

const ModernLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Simulate login
    setTimeout(() => {
      setLoading(false);
      navigate('/admin/dashboard');
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-pink-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <ModernCard variant="glass" className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to your EduFlow dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <ModernInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              name="email"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.email}
              variant="glass"
              required
            />

            {/* Password Input */}
            <ModernInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              name="password"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password}
              variant="glass"
              required
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <ModernButton
              type="submit"
              className="w-full"
              loading={loading}
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </ModernButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/90 backdrop-blur-sm text-gray-500">Or</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-600">
              Continue with
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ModernButton
                variant="outline"
                className="w-full"
                size="sm"
              >
                Google
              </ModernButton>
              <ModernButton
                variant="outline"
                className="w-full"
                size="sm"
              >
                Microsoft
              </ModernButton>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-500 transition-colors font-medium"
            >
              Sign up
            </a>
          </p>
        </ModernCard>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>&copy; 2024 EduFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ModernLoginPage;
