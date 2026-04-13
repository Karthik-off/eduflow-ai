import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardHeader, CardContent } from '@/components/premium-ui/Card';
import { Button } from '@/components/premium-ui/Button';
import { Input } from '@/components/premium-ui/Input';
import { 
  BookOpen,
  ChevronRight,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Target,
  TrendingUp,
  Users,
  Award,
  Download,
  Upload
} from 'lucide-react';
import '@/styles/eduflow-enhanced.css';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  instructor?: string;
  schedule?: string;
  progress?: number;
  [key: string]: any;
}

const AcademicsPage = () => {
  const { studentProfile } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!studentProfile?.current_semester_id) {
        // If no semester assigned, fetch all subjects for demo
        const { data } = await supabase
          .from('subjects')
          .select('id, name, code, credits, instructor, schedule, progress')
          .order('name');
        setSubjects((data as Subject[]) ?? []);
      } else {
        const { data } = await supabase
          .from('subjects')
          .select('id, name, code, credits, instructor, schedule, progress')
          .eq('semester_id', studentProfile.current_semester_id)
          .order('name');
        setSubjects((data as Subject[]) ?? []);
      }
      setLoading(false);
    };

    fetchSubjects();
  }, [studentProfile]);

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !searchQuery || 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'completed' && subject.progress === 100) ||
      (selectedFilter === 'in-progress' && subject.progress && subject.progress < 100) ||
      (selectedFilter === 'not-started' && (!subject.progress || subject.progress === 0));
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: subjects.length,
    completed: subjects.filter(s => s.progress === 100).length,
    inProgress: subjects.filter(s => s.progress && s.progress < 100).length,
    totalCredits: subjects.reduce((sum, s) => sum + s.credits, 0),
    averageProgress: subjects.length > 0 ? Math.round(subjects.reduce((sum, s) => sum + (s.progress || 0), 0) / subjects.length) : 0
  };

  const subjectColors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-violet-500 to-violet-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
    'from-indigo-500 to-indigo-600',
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'in-progress': return 'text-blue-600 dark:text-blue-400';
      case 'not-started': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30';
      case 'in-progress': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'not-started': return 'bg-gray-100 dark:bg-gray-900/30';
      default: return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <UnifiedLayout userRole="student" title="Academics">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Subjects</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Credits</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCredits}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="hover-lift-enhanced">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 w-full"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm font-medium"
                >
                  <option value="all">All Subjects</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="not-started">Not Started</option>
                </select>
                
                <Button className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="hover-lift-enhanced">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSubjects.length === 0 ? (
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                  <GraduationCap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No subjects found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No subjects available for the current semester'
                  }
                </p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Contact Admin
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject, index) => (
              <Card
                key={subject.id}
                className="hover-lift-enhanced cursor-pointer group"
                onClick={() => navigate(`/academics/${subject.id}`)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subjectColors[index % subjectColors.length]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {subject.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{subject.code}</span>
                            <span>•</span>
                            <span>{subject.credits} Credits</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {subject.progress !== undefined && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{subject.progress}%</p>
                          </div>
                        )}
                        <MoreHorizontal className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UnifiedLayout>
  );
};

export default AcademicsPage;
