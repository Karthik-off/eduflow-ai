import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, QrCode, CreditCard, User, Bot } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/academics', label: 'Academics', icon: BookOpen },
  { path: '/ai-assistant', label: 'AI', icon: Bot },
  { path: '/attendance', label: 'Scan QR', icon: QrCode },
  { path: '/profile', label: 'Profile', icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.path === '/ai-assistant' ? (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center -mt-4 ${
                  isActive ? 'gradient-primary shadow-elevated' : 'bg-secondary'
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : ''}`} />
                </div>
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
