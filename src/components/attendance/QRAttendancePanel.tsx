import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Loader2, StopCircle, Users, Timer } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  sectionId: string;
  staffId: string;
  studentCount: number;
}

const QRAttendancePanel = ({ sectionId, staffId, studentCount }: Props) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrSecret, setQrSecret] = useState('');
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [presentCount, setPresentCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const rotateSecret = useCallback(async (sessId: string) => {
    const newSecret = generateSecret();
    await supabase
      .from('attendance_sessions')
      .update({ qr_secret: newSecret })
      .eq('id', sessId);
    setQrSecret(newSecret);
    setCountdown(10);
  }, []);

  const fetchPresentCount = useCallback(async (sessId: string) => {
    const { count } = await supabase
      .from('attendance_records')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessId);
    setPresentCount(count ?? 0);
  }, []);

  const startSession = async () => {
    setStarting(true);
    try {
      const secret = generateSecret();
      const { data: session, error } = await supabase
        .from('attendance_sessions')
        .insert({
          section_id: sectionId,
          staff_id: staffId,
          is_active: true,
          qr_secret: secret,
          session_date: new Date().toISOString().split('T')[0],
        } as any)
        .select('id')
        .single();

      if (error || !session) throw error;

      setSessionId(session.id);
      setQrSecret(secret);
      setCountdown(10);
      setPresentCount(0);

      intervalRef.current = setInterval(() => rotateSecret(session.id), 10000);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 10 : prev - 1));
      }, 1000);
      const pollInterval = setInterval(() => fetchPresentCount(session.id), 3000);
      (window as any).__qrPollInterval = pollInterval;

      toast.success('QR Attendance session started!');
    } catch (err: any) {
      toast.error('Failed to start session: ' + (err?.message || 'Unknown'));
    }
    setStarting(false);
  };

  const stopSession = async () => {
    if (!sessionId) return;
    setStopping(true);

    const { data: records } = await supabase
      .from('attendance_records')
      .select('student_id')
      .eq('session_id', sessionId);

    const presentStudentIds = new Set((records ?? []).map(r => r.student_id));

    const { data: allStudents } = await supabase
      .from('students')
      .select('id')
      .eq('section_id', sectionId);

    const absentStudents = (allStudents ?? []).filter(s => !presentStudentIds.has(s.id));

    if (absentStudents.length > 0) {
      await supabase.from('attendance_records').insert(
        absentStudents.map(s => ({
          session_id: sessionId,
          student_id: s.id,
          status: 'absent',
        }))
      );
    }

    await supabase
      .from('attendance_sessions')
      .update({ is_active: false, qr_secret: null })
      .eq('id', sessionId);

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if ((window as any).__qrPollInterval) clearInterval((window as any).__qrPollInterval);

    toast.success(`Session ended. ${presentStudentIds.size} present, ${absentStudents.length} absent.`);
    setSessionId(null);
    setQrSecret('');
    setStopping(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if ((window as any).__qrPollInterval) clearInterval((window as any).__qrPollInterval);
    };
  }, []);

  const qrData = sessionId && qrSecret
    ? JSON.stringify({ s: sessionId, k: qrSecret })
    : '';

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <QrCode className="w-4 h-4 text-primary" />
          QR Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!sessionId ? (
          <Button
            className="w-full gradient-primary text-primary-foreground"
            onClick={startSession}
            disabled={starting}
          >
            {starting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <QrCode className="w-4 h-4 mr-1" />}
            Generate QR
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-2xl shadow-elevated">
                <QRCodeSVG value={qrData} size={200} level="M" includeMargin={false} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground tabular-nums">{countdown}s</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {presentCount} / {studentCount} present
              </Badge>
            </div>

            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 10) * 100}%` }}
              />
            </div>

            <p className="text-[10px] text-center text-muted-foreground">
              QR code refreshes every 10 seconds. Students must scan before it changes.
            </p>

            <Button
              variant="destructive"
              className="w-full"
              onClick={stopSession}
              disabled={stopping}
            >
              {stopping ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <StopCircle className="w-4 h-4 mr-1" />}
              End Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRAttendancePanel;
