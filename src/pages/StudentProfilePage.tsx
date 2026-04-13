import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Mail, Phone, Hash, BookOpen, Building2, Pencil, Save, Loader2, GraduationCap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BackToHomeButton from '@/components/BackToHomeButton';

const StudentProfilePage = () => {
  const { studentProfile, user, loadUserData } = useAuthStore();
  const { stats: attendanceStats } = useAttendanceData();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [semesterLabel, setSemesterLabel] = useState('');

  useEffect(() => {
    if (studentProfile) {
      setBio((studentProfile as any).bio ?? '');
      setPhone(studentProfile.phone ?? '');
    }
  }, [studentProfile]);

  useEffect(() => {
    const fetchLabels = async () => {
      if (!studentProfile) return;
      const [deptRes, secRes, semRes] = await Promise.all([
        studentProfile.department_id
          ? supabase.from('departments').select('name').eq('id', studentProfile.department_id).single()
          : Promise.resolve({ data: null }),
        studentProfile.section_id
          ? supabase.from('sections').select('name').eq('id', studentProfile.section_id).single()
          : Promise.resolve({ data: null }),
        studentProfile.current_semester_id
          ? supabase.from('semesters').select('label').eq('id', studentProfile.current_semester_id).single()
          : Promise.resolve({ data: null }),
      ]);
      setDepartmentName(deptRes.data?.name ?? 'N/A');
      setSectionName(secRes.data?.name ?? 'N/A');
      setSemesterLabel(semRes.data?.label ?? 'N/A');
    };
    fetchLabels();
  }, [studentProfile]);

  const handleSave = async () => {
    if (!studentProfile) return;
    setSaving(true);

    const { error } = await supabase
      .from('students')
      .update({
        bio: bio.trim() || null,
        phone: phone.trim() || null,
      } as any)
      .eq('id', studentProfile.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
      setEditing(false);
      if (user) await loadUserData(user.id);
    }
    setSaving(false);
  };

  const initials = studentProfile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'S';

  const infoRows = [
    { icon: Hash, label: 'Roll Number', value: studentProfile?.roll_number ?? 'N/A' },
    { icon: Mail, label: 'Email', value: studentProfile?.email ?? 'N/A' },
    { icon: Building2, label: 'Department', value: departmentName },
    { icon: BookOpen, label: 'Section', value: sectionName },
    { icon: GraduationCap, label: 'Semester', value: semesterLabel },
    { icon: User, label: 'CGPA', value: studentProfile?.cgpa?.toString() ?? '0' },
    { icon: TrendingUp, label: 'Attendance', value: `${attendanceStats.percentage}%` },
  ];

  return (
    <UnifiedLayout userRole="student" title="Profile">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <BackToHomeButton variant="navbar" />
          <h1 className="text-base font-bold font-display text-foreground">My Profile</h1>
        </div>
      </header>

      <main className="px-6 py-12 max-w-7xl mx-auto space-y-16">
        {/* Profile Header Section */}
        <section className="space-y-12">
          {/* Avatar + Name Card */}
          <Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-br from-card to-card/80">
            <CardContent className="flex flex-col items-center py-16 gap-8">
              <Avatar className="w-28 h-28 ring-4 ring-primary/20 shadow-xl">
                <AvatarImage src={studentProfile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">{studentProfile?.full_name ?? 'Student'}</h2>
                <p className="text-sm text-muted-foreground font-medium">{studentProfile?.roll_number}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Row 1: Stats Cards (CGPA, Attendance, Credits) */}
        <section className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* CGPA Card */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">CGPA</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentProfile?.cgpa?.toString() ?? '0'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Card */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Attendance</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.percentage}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Credits Card */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Credits</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">--</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Row 2: Compact Information Cards */}
        <section className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Email Card */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 truncate max-w-full">{studentProfile?.email ?? 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400">{phone || 'Not set'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Roll Number Card */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Hash className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Roll No.</p>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{studentProfile?.roll_number ?? 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Department Card */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Department</p>
                  <p className="text-sm font-medium text-pink-600 dark:text-pink-400 truncate max-w-full">{departmentName}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Row 3: Bio & Contact Section */}
        <section className="space-y-12">
          <Card className="shadow-md border-0">
            <CardHeader className="pb-8 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Bio & Contact</CardTitle>
              {!editing && (
                <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:bg-primary/10" onClick={() => setEditing(true)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-10">
              <div className="space-y-4">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bio</label>
                {editing ? (
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Write a short bio about yourself..."
                    className="min-h-[120px] resize-none p-5 text-sm leading-relaxed"
                    maxLength={300}
                  />
                ) : (
                  <div className="text-sm text-foreground bg-secondary/30 rounded-xl p-6 min-h-[100px] leading-relaxed">
                    {bio || <span className="text-muted-foreground italic">No bio added yet. Tap edit to add one.</span>}
                  </div>
                )}
                {editing && (
                  <p className="text-xs text-muted-foreground text-right mt-2">{bio.length}/300</p>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                {editing ? (
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    maxLength={15}
                    className="p-5 text-sm"
                  />
                ) : (
                  <div className="text-sm text-foreground bg-secondary/30 rounded-xl p-6">
                    {phone || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                )}
              </div>

              {editing && (
                <div className="flex gap-4 pt-6">
                  <Button variant="outline" className="flex-1 h-12 text-sm font-medium" onClick={() => { setEditing(false); setBio((studentProfile as any)?.bio ?? ''); setPhone(studentProfile?.phone ?? ''); }}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gap-2 h-12 text-sm font-medium" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </UnifiedLayout>
  );
};

export default StudentProfilePage;
