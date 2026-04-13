import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  GraduationCap, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentRole, setCurrentRole] = useState<'student' | 'staff' | 'admin'>('student');
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  // Get the appropriate label and placeholder based on role
  const getInputLabel = () => {
    switch (currentRole) {
      case 'staff':
        return 'Staff ID';
      case 'admin':
      case 'student':
      default:
        return 'Email Address';
    }
  };

  const getInputPlaceholder = () => {
    switch (currentRole) {
      case 'staff':
        return 'Enter your staff ID (e.g., STF001)';
      case 'admin':
      case 'student':
      default:
        return `${currentRole}@institution.edu`;
    }
  };

  const getInputType = () => {
    switch (currentRole) {
      case 'staff':
        return 'text';
      case 'admin':
      case 'student':
      default:
        return 'email';
    }
  };

  const getInputIcon = () => {
    switch (currentRole) {
      case 'staff':
        return User; // Use User icon for Staff ID
      case 'admin':
      case 'student':
      default:
        return Mail; // Use Mail icon for email
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // The signIn function now handles staff ID to email conversion internally
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Navigate based on role
      if (result.role === 'student') {
        navigate('/dashboard');
      } else if (result.role === 'staff') {
        navigate('/staff/dashboard');
      } else if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const getRoleAccentColor = () => {
    switch (currentRole) {
      case 'student':
        return 'from-blue-500 to-violet-500';
      case 'staff':
        return 'from-emerald-500 to-teal-500';
      case 'admin':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-blue-500 to-violet-500';
    }
  };

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'student':
        return User;
      case 'staff':
        return Briefcase;
      case 'admin':
        return Shield;
      default:
        return User;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-blue-950/20 to-violet-950/30 animate-pulse"></div>
      
      {/* Background decoration */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-violet-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-slate-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-500 rounded-3xl shadow-xl backdrop-blur-sm border border-white/10">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-100 mb-2">EduSync</h1>
            <p className="text-slate-300 text-lg">Student Management System</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center space-x-2 bg-slate-800/50 backdrop-blur-md rounded-2xl p-2 border border-slate-700/50">
          {[
            { role: 'student' as const, label: 'Student', icon: User },
            { role: 'staff' as const, label: 'Staff', icon: Briefcase },
            { role: 'admin' as const, label: 'Admin', icon: Shield }
          ].map(({ role, label, icon: Icon }) => (
            <button
              key={role}
              onClick={() => setCurrentRole(role)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                currentRole === role
                  ? 'bg-slate-700/50 text-slate-100 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl shadow-xl border border-slate-700/50 p-8 space-y-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getRoleAccentColor()} rounded-2xl mb-4 shadow-lg`}>
              {(() => {
                const Icon = getRoleIcon();
                return <Icon className="w-8 h-8 text-white" />;
              })()}
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              {currentRole === 'student' ? 'Student' : currentRole === 'staff' ? 'Staff' : 'Admin'} Login
            </h2>
            <p className="text-slate-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4 text-red-200 text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Email/Staff ID Input */}
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">{getInputLabel()}</label>
              <div className="relative">
                {(() => {
                  const Icon = getInputIcon();
                  return <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />;
                })()}
                <input
                  type={getInputType()}
                  placeholder={getInputPlaceholder()}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r ${getRoleAccentColor()} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transform hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Help Text */}
            <p className="text-center text-slate-500 text-sm">
              Your account is created by your institution administrator.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>© 2024 EduSync. All rights reserved.</p>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
