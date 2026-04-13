import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Hash, 
  BookOpen, 
  Building2, 
  Pencil, 
  Save, 
  Loader2, 
  GraduationCap,
  Calendar,
  MapPin,
  Award,
  Target,
  TrendingUp,
  Settings,
  Camera,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProfilePageFixed = () => {
  const { studentProfile, user, loadUserData } = useAuthStore();
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [semesterLabel, setSemesterLabel] = useState('');
  const [editing, setEditing] = useState(false);

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

  
  const stats = [
    {
      label: 'CGPA',
      value: studentProfile?.cgpa || '8.5',
      icon: <Award className="w-4 h-4" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Attendance',
      value: '67%',
      icon: <Calendar className="w-4 h-4" />,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Credits',
      value: (studentProfile as any)?.total_credits || '24',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <StudentLayoutWithSearch title="Profile">
      <div className="space-y-12">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={studentProfile?.avatar_url} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl">
                    {studentProfile?.full_name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {studentProfile?.full_name || 'Student Name'}
                </h1>
                <p className="text-white/80 mb-8">
                  {studentProfile?.roll_number || 'Roll Number'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                    {departmentName} Department
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                    Semester {semesterLabel}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                    Section {sectionName}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current</div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Academic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <GraduationCap className="w-6 h-6" />
                  <span>Academic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">Department</label>
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-800 dark:text-white text-lg">{departmentName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">Section</label>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-800 dark:text-white text-lg">{sectionName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">Current Semester</label>
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-800 dark:text-white text-lg">{semesterLabel}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">Admission Year</label>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-800 dark:text-white text-lg">2021</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-8 sm:space-y-10">
            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 text-base"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Account Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 text-base"
                    onClick={() => navigate('/fees')}
                  >
                    <Target className="w-5 h-5 mr-3" />
                    Fee Status
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 text-base"
                    onClick={() => navigate('/academics')}
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    Academic Progress
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-semibold">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-600 dark:text-gray-400">Overall Progress</span>
                    <span className="text-base font-medium text-gray-800 dark:text-white">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-base">
                      <span className="text-gray-600 dark:text-gray-400">Assignments Completed</span>
                      <span className="text-gray-800 dark:text-white font-medium">18/20</span>
                    </div>
                    <div className="flex items-center justify-between text-base">
                      <span className="text-gray-600 dark:text-gray-400">Tests Passed</span>
                      <span className="text-gray-800 dark:text-white font-medium">12/15</span>
                    </div>
                    <div className="flex items-center justify-between text-base">
                      <span className="text-gray-600 dark:text-gray-400">Projects Done</span>
                      <span className="text-gray-800 dark:text-white font-medium">5/6</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </StudentLayoutWithSearch>
  );
};

export default StudentProfilePageFixed;
