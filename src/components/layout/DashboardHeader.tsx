import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import BackToHomeButton from '@/components/BackToHomeButton';

const DashboardHeader = () => {
  const { studentProfile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const firstName = studentProfile?.full_name?.split(' ')[0] ?? 'Student';

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <BackToHomeButton variant="navbar" />
          <div>
            <p className="text-xs text-muted-foreground">Good morning,</p>
            <h2 className="text-sm font-bold font-display text-foreground">{firstName} 👋</h2>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationPanel />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
