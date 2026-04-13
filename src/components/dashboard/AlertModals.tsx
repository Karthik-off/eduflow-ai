import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trophy, CreditCard, Bell, Info, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface AlertModalsProps {
  attendancePercentage: number;
  hasNewMarks: boolean;
  pendingFees: number;
  feesDueSoon: boolean;
  studentId?: string;
}

const AlertModals = ({ attendancePercentage, hasNewMarks, pendingFees, feesDueSoon, studentId }: AlertModalsProps) => {
  const [showAttendance, setShowAttendance] = useState(false);
  const [showMarks, setShowMarks] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentNotif, setCurrentNotif] = useState<Notification | null>(null);

  useEffect(() => {
    if (attendancePercentage < 75) {
      setShowAttendance(true);
    } else if (hasNewMarks) {
      setShowMarks(true);
    } else if (feesDueSoon) {
      setShowFees(true);
    }
  }, [attendancePercentage, hasNewMarks, feesDueSoon]);

  // Fetch unread notifications
  useEffect(() => {
    if (!studentId) return;
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', studentId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);
      const notifs = (data ?? []) as Notification[];
      setNotifications(notifs);
      // Show first unread notification if any
      if (notifs.length > 0 && !showAttendance && !showMarks && !showFees) {
        setCurrentNotif(notifs[0]);
      }
    };
    fetchNotifs();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('student-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          setCurrentNotif(newNotif);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [studentId]);

  const dismissNotif = async () => {
    if (currentNotif) {
      await supabase
        .from('notifications')
        .update({ is_read: true } as any)
        .eq('id', currentNotif.id);
      setNotifications(prev => prev.filter(n => n.id !== currentNotif.id));
      // Show next unread
      const remaining = notifications.filter(n => n.id !== currentNotif.id);
      setCurrentNotif(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'fee_added': return <CreditCard className="w-6 h-6 text-warning" />;
      case 'marks_updated': return <Trophy className="w-6 h-6 text-primary" />;
      case 'attendance_updated': return <AlertTriangle className="w-6 h-6 text-destructive" />;
      default: return <Info className="w-6 h-6 text-primary" />;
    }
  };

  const getNotifColor = (type: string) => {
    switch (type) {
      case 'fee_added': return 'bg-warning/10';
      case 'marks_updated': return 'bg-primary/10';
      case 'attendance_updated': return 'bg-destructive/10';
      default: return 'bg-primary/10';
    }
  };

  return (
    <>
      {/* Notification badge */}
      {notifications.length > 0 && !currentNotif && (
        <div className="fixed top-16 right-4 z-50">
          <Button
            size="sm"
            className="gradient-primary text-primary-foreground rounded-full shadow-elevated text-xs gap-1"
            onClick={() => setCurrentNotif(notifications[0])}
          >
            <Bell className="w-3.5 h-3.5" />
            {notifications.length} new
          </Button>
        </div>
      )}

      {/* Red Zone Warning */}
      <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-destructive">Attendance Alert</DialogTitle>
            <DialogDescription>
              Your attendance is at <strong>{attendancePercentage}%</strong>, which is below the required 75%. 
              Please attend classes regularly to avoid debarment.
            </DialogDescription>
          </DialogHeader>
          <Button variant="destructive" onClick={() => setShowAttendance(false)} className="w-full">
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      {/* New Marks */}
      <Dialog open={showMarks} onOpenChange={setShowMarks}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle>New Marks Released</DialogTitle>
            <DialogDescription>
              New marks have been published. Check your academic section for details.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowMarks(false)} className="w-full gradient-primary text-primary-foreground">
            View Marks
          </Button>
        </DialogContent>
      </Dialog>

      {/* Fee Reminder */}
      <Dialog open={showFees} onOpenChange={setShowFees}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-warning" />
            </div>
            <DialogTitle>Payment Reminder</DialogTitle>
            <DialogDescription>
              You have pending fees of <strong>₹{pendingFees.toLocaleString()}</strong> due within 7 days.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowFees(false)} className="w-full gradient-primary text-primary-foreground">
            Pay Now
          </Button>
        </DialogContent>
      </Dialog>

      {/* Staff Notification Alert */}
      <Dialog open={!!currentNotif} onOpenChange={open => { if (!open) dismissNotif(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center space-y-3">
            <div className={`mx-auto w-12 h-12 rounded-full ${getNotifColor(currentNotif?.type || '')} flex items-center justify-center`}>
              {getNotifIcon(currentNotif?.type || '')}
            </div>
            <DialogTitle>{currentNotif?.title}</DialogTitle>
            <DialogDescription>{currentNotif?.message}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={dismissNotif}>
              <CheckCircle className="w-4 h-4 mr-1" /> Dismiss
            </Button>
            {notifications.length > 1 && (
              <Button variant="ghost" className="text-xs text-muted-foreground" onClick={dismissNotif}>
                Next ({notifications.length - 1} more)
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertModals;
