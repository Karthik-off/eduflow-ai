import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Award, 
  TrendingUp, 
  Download, 
  Eye,
  Filter,
  Search,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';

interface Exam {
  id: string;
  title: string;
  subject: string;
  exam_type: 'midterm' | 'final' | 'quiz' | 'assignment';
  date: string;
  duration: string;
  total_marks: number;
  obtained_marks?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  room?: string;
  instructions?: string;
}

interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  rank?: number;
  feedback?: string;
  created_at: string;
}

const ExamsPage = () => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Use marks table as exam data source
        const { data: marksData } = await supabase
          .from('marks')
          .select('*, subjects(name, code)')
          .eq('student_id', studentProfile?.id || '');

        const exams: Exam[] = (marksData || []).map((m: any) => ({
          id: m.id,
          title: m.exam_type,
          subject: m.subjects?.name || '',
          exam_type: m.exam_type as any,
          date: m.created_at,
          duration: '2 hours',
          total_marks: m.max_marks,
          status: 'completed' as const,
        }));
        const results: ExamResult[] = (marksData || []).map((m: any) => ({
          id: m.id,
          exam_id: m.id,
          student_id: m.student_id,
          marks_obtained: m.marks_obtained,
          total_marks: m.max_marks,
          grade: m.marks_obtained >= m.max_marks * 0.9 ? 'A+' : m.marks_obtained >= m.max_marks * 0.8 ? 'A' : m.marks_obtained >= m.max_marks * 0.7 ? 'B' : 'C',
          percentage: Math.round((m.marks_obtained / m.max_marks) * 100),
        }));

        setExams(exams);
        setExamResults(results);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [studentProfile?.id]);

  // Mock data for demonstration
  const mockExams: Exam[] = [
    {
      id: '1',
      title: 'Data Structures Midterm Examination',
      subject: 'Computer Science',
      exam_type: 'midterm',
      date: '2024-04-15',
      duration: '3 hours',
      total_marks: 100,
      status: 'upcoming',
      room: 'Room 201, Block A',
      instructions: 'Bring your student ID card. No calculators allowed.'
    },
    {
      id: '2',
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      exam_type: 'final',
      date: '2024-04-20',
      duration: '3 hours',
      total_marks: 100,
      obtained_marks: 85,
      status: 'completed',
      room: 'Room 105, Block B'
    },
    {
      id: '3',
      title: 'Physics Quiz - Chapter 5',
      subject: 'Physics',
      exam_type: 'quiz',
      date: '2024-04-10',
      duration: '1 hour',
      total_marks: 50,
      obtained_marks: 42,
      status: 'completed'
    }
  ];

  const mockResults: ExamResult[] = [
    {
      id: '1',
      exam_id: '2',
      student_id: studentProfile?.id || '',
      marks_obtained: 85,
      total_marks: 100,
      percentage: 85,
      grade: 'A',
      rank: 3,
      feedback: 'Good performance. Keep up the hard work!',
      created_at: '2024-04-20'
    },
    {
      id: '2',
      exam_id: '3',
      student_id: studentProfile?.id || '',
      marks_obtained: 42,
      total_marks: 50,
      percentage: 84,
      grade: 'B+',
      created_at: '2024-04-10'
    }
  ];

  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = !searchQuery || 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'upcoming' && exam.status === 'upcoming') ||
      (selectedFilter === 'completed' && exam.status === 'completed') ||
      (selectedFilter === 'ongoing' && exam.status === 'ongoing');
    
    return matchesSearch && matchesFilter;
  });

  const upcomingExams = filteredExams.filter(exam => exam.status === 'upcoming');
  const completedExams = filteredExams.filter(exam => exam.status === 'completed');

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'midterm': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'final': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'quiz': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'assignment': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'ongoing': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade[0]) {
      case 'A': return 'text-green-600 dark:text-green-400';
      case 'B': return 'text-blue-600 dark:text-blue-400';
      case 'C': return 'text-amber-600 dark:text-amber-400';
      case 'D': return 'text-orange-600 dark:text-orange-400';
      case 'F': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const stats = {
    total: mockExams.length,
    completed: mockExams.filter(e => e.status === 'completed').length,
    upcoming: mockExams.filter(e => e.status === 'upcoming').length,
    averageScore: mockResults.length > 0 ? Math.round(mockResults.reduce((sum, r) => sum + r.percentage, 0) / mockResults.length) : 0
  };

  return (
    <UnifiedLayout userRole="student" title="Exams">
      {/* Header with Home Button */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <BackToHomeButton variant="navbar" />
          <h1 className="text-base font-bold font-display text-foreground">Exams</h1>
        </div>
      </header>
      
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Exams</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</p>
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
                    placeholder="Search exams..."
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
                  <option value="all">All Exams</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                </select>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-premium-lg">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'upcoming'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Upcoming Exams
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'completed'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Completed Exams
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {upcomingExams.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Upcoming Exams</h3>
                    <p className="text-gray-600 dark:text-gray-400">You don't have any upcoming exams scheduled.</p>
                  </div>
                ) : (
                  upcomingExams.map((exam) => (
                    <Card key={exam.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getExamTypeColor(exam.exam_type)}`}>
                                {exam.exam_type.toUpperCase()}
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                                {exam.status.toUpperCase()}
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{exam.subject}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{exam.date}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{exam.duration}</span>
                              </div>
                            </div>
                            {exam.room && (
                              <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <Target className="w-4 h-4" />
                                <span>Room: {exam.room}</span>
                              </div>
                            )}
                            {exam.instructions && (
                              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                  <strong>Instructions:</strong> {exam.instructions}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="space-y-4">
                {completedExams.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Completed Exams</h3>
                    <p className="text-gray-600 dark:text-gray-400">You haven't completed any exams yet.</p>
                  </div>
                ) : (
                  completedExams.map((exam) => {
                    const result = mockResults.find(r => r.exam_id === exam.id);
                    return (
                      <Card key={exam.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getExamTypeColor(exam.exam_type)}`}>
                                  {exam.exam_type.toUpperCase()}
                                </div>
                                {result && (
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                                    Grade: {result.grade}
                                  </div>
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="w-4 h-4" />
                                  <span>{exam.subject}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{exam.date}</span>
                                </div>
                              </div>
                              {result && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.marks_obtained}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Marks Obtained</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.total_marks}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Marks</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.percentage}%</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Percentage</p>
                                  </div>
                                </div>
                              )}
                              {result?.feedback && (
                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Feedback:</strong> {result.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default ExamsPage;
