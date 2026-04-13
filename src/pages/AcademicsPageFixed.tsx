import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  MoreHorizontal,
  BookMarked,
  Users,
  FileText
} from 'lucide-react';

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

const AcademicsPageFixed = () => {
  const { studentProfile } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const navigate = useNavigate();

  // Mock data - maintaining the same data structure as original
  const mockSubjects: Subject[] = [
    {
      id: '1',
      name: 'Mathematics',
      code: 'MATH101',
      credits: 4,
      instructor: 'Dr. Smith',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      progress: 85
    },
    {
      id: '2',
      name: 'Physics',
      code: 'PHYS101',
      credits: 3,
      instructor: 'Prof. Johnson',
      schedule: 'Tue, Thu - 10:30 AM',
      progress: 92
    },
    {
      id: '3',
      name: 'Chemistry',
      code: 'CHEM101',
      credits: 3,
      instructor: 'Dr. Brown',
      schedule: 'Mon, Wed - 2:00 PM',
      progress: 78
    },
    {
      id: '4',
      name: 'Computer Science',
      code: 'CS101',
      credits: 4,
      instructor: 'Mr. Wilson',
      schedule: 'Tue, Thu, Fri - 11:00 AM',
      progress: 95
    },
    {
      id: '5',
      name: 'English',
      code: 'ENG101',
      credits: 2,
      instructor: 'Ms. Davis',
      schedule: 'Mon, Wed - 3:00 PM',
      progress: 88
    },
    {
      id: '6',
      name: 'Biology',
      code: 'BIO101',
      credits: 3,
      instructor: 'Dr. Miller',
      schedule: 'Tue, Thu - 9:00 AM',
      progress: 82
    }
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        // For now, use mock data to maintain existing functionality
        setSubjects(mockSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [studentProfile]);

  const subjectColors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600'
  ];

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (subject.instructor && subject.instructor.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'completed') return matchesSearch && (subject.progress || 0) >= 90;
    if (selectedFilter === 'inprogress') return matchesSearch && (subject.progress || 0) > 0 && (subject.progress || 0) < 90;
    return matchesSearch;
  });

  const stats = {
    total: subjects.length,
    completed: subjects.filter(s => (s.progress || 0) >= 90).length,
    inProgress: subjects.filter(s => (s.progress || 0) > 0 && (s.progress || 0) < 90).length,
    totalCredits: subjects.reduce((sum, s) => sum + s.credits, 0),
    averageProgress: subjects.length > 0 ? Math.round(subjects.reduce((sum, s) => sum + (s.progress || 0), 0) / subjects.length) : 0
  };

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/academics/${subjectId}`);
  };

  return (
    <StudentLayoutWithSearch title="Academics">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Subjects</div>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-blue-600">Active</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-green-600">Excellent</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">In Progress</div>
                <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
                <div className="text-sm text-amber-600">Ongoing</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Credits</div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalCredits}</div>
                <div className="text-sm text-purple-600">This semester</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* AI Assistant Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BookMarked className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">Study Assistant</div>
                <div className="text-white/80">Get help with your subjects and assignments</div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/ai-assistant')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              Get Help
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject, index) => (
            <Card
              key={subject.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subjectColors[index % subjectColors.length]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">{subject.code}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{subject.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{subject.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{subject.schedule}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{subject.credits} credits</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{subject.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${subject.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayoutWithSearch>
  );
};

export default AcademicsPageFixed;
