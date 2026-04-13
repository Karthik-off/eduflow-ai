import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/premium-ui/Button';
import { Input } from '@/components/premium-ui/Input';
import { Card, CardContent } from '@/components/premium-ui/Card';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, ArrowRight } from 'lucide-react';

const PremiumLoginPageNew = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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
      navigate('/dashboard');
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative elements */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
            <p className="text-xl text-white/80">Sign in to your EduFlow dashboard</p>
          </div>
          
          {/* Abstract illustration */}
          <div className="relative w-full max-w-md">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white/10 rounded-2xl backdrop-blur-sm animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card variant="elevated" className="p-8">
            <CardContent className="p-0">
              {/* Logo for mobile */}
              <div className="flex lg:hidden items-center justify-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  name="email"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email}
                  variant="modern"
                  required
                />

                {/* Password Input */}
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  name="password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password}
                  variant="modern"
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
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="md"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25-.07-1.11-.35-2.08-.88-2.92-1.57-.41-.35-.88-.61-1.38-.61-1.06 0-1.92.61-2.56 1.61-.41.43-.69.89-.69 1.46 0 1.27.47 2.34 1.53 2.34 1.06 0 1.92-.47 2.56-1.53.41-.43.69-.89.69-1.46 0-1.27-.47-2.34-1.53-2.34-1.06 0-1.92.47-2.56 1.53-.41.43-.69.89-.69 1.46 0 1.27.47 2.34 1.53 2.34 1.06 0 1.92-.47 2.56-1.53.41-.43.69-.89.69-1.46 0-1.27-.47-2.34-1.53-2.34-1.06 0-1.92.47-2.56 1.53-.41.43-.69.89-.69 1.46 0 1.27.47 2.34 1.53 2.34 1.06 0 1.92-.47 2.56-1.53.41-.43.69-.89.69-1.46 0-1.27-.47-2.34-1.53-2.34z"/>
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="md"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#0078D4" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793.261.1.367-1.537.468-1.895.562-.43.225-.636.479-.868.72-1.53-1.34-1.845-2.498-2.475-4.364-2.475-1.631 0-3.059.546-4.067 1.467-2.393-1.897-4.177-1.897h-6.491c-1.228 0-2.317.342-3.07.922-3.07 2.14 0 3.714 1.24 3.714 2.414v1.041c0 1.135-.745 2.208-1.877 2.208-2.414 0-.326-.078-.547-.09-.653v-2.414c0-1.669 1.577-3.014 3.521-3.014 1.924 0 3.48.691 3.48 1.813v5.818h5.202c2.32 0 4.013 1.65 4.013 3.877v-1.041c0-2.227-1.693-3.877-4.013-3.877h-3.014c-1.944 0-3.521 1.283-3.521 2.864v1.041c0 1.581 1.577 2.864 3.521 2.864h1.041c1.228 0 2.317-.342 3.07-.922 3.07-2.14v-1.041c0-1.669-1.577-3.014-3.521-3.014-1.924 0-3.48-.691-3.48-1.813v-5.818c0-2.227 1.693-3.877 4.013-3.877 1.924 0 3.48.691 3.48 1.813v5.818c0 2.227 1.693 3.877 4.013 3.877z"/>
                    </svg>
                    Microsoft
                  </Button>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-500 transition-colors font-medium"
                >
                  Sign up for free
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>&copy; 2024 EduFlow. All rights reserved.</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoginPageNew;
