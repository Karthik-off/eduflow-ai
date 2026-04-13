import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ChevronRight, 
  GraduationCap, 
  Clock,
  Award,
  Target,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import '@/styles/eduflow-enhanced.css';
import BackToHomeButton from '@/components/BackToHomeButton';

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
  const navigate = useNavigate();

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

  const subjectColors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-violet-500 to-violet-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
    'from-indigo-500 to-indigo-600',
  ];

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

  return (
    <UnifiedLayout userRole="student" title="Academics">
      {/* Header with Home Button */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <BackToHomeButton variant="navbar" />
          <h1 className="text-base font-bold font-display text-foreground">Academics</h1>
        </div>
      </header>
      
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
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

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
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
        <Card className="shadow-premium-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-premium w-full pl-12"
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
                
                <Button variant="outline" className="flex items-center space-x-2">
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
              <Card key={i} className="loading-skeleton-enhanced">
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer group"
                onClick={() => navigate(`/academics/${subject.id}`)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subjectColors[index % subjectColors.length]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <BookOpen className="w-6 h-6 text-white" />
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

                    {/* Subject Info */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                        {subject.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{subject.code}</span>
                          <span>•</span>
                          <span>{subject.credits} Credits</span>
                        </span>
                      </div>
                    </div>

                    {/* Instructor Info */}
                    {subject.instructor && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {subject.instructor.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{subject.instructor}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                        </div>
                      </div>
                    )}

                    {/* Schedule */}
                    {subject.schedule && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{subject.schedule}</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {subject.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Course Progress</span>
                          <span className="font-bold">{subject.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              subject.progress === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                              subject.progress >= 75 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                              subject.progress >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                              'bg-gradient-to-r from-red-400 to-pink-500'
                            }`}
                            style={{ width: `${subject.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
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
