import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
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
  CheckCircle,
  AlertCircle,
  Target,
  BookOpen,
  Timer
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  exam_type: 'midterm' | 'final' | 'quiz' | 'assignment';
  status: 'upcoming' | 'ongoing' | 'completed';
  total_marks: number;
  obtained_marks?: number;
  grade?: string;
  room?: string;
}

interface ExamResult {
  exam_id: string;
  percentage: number;
  grade: string;
  remarks?: string;
}

const ExamsPageFixed = () => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data - maintaining the same data structure as original
  const mockExams: Exam[] = [
    {
      id: '1',
      title: 'Mathematics Midterm',
      subject: 'Mathematics',
      date: '2024-02-15',
      time: '09:00 AM',
      duration: '2 hours',
      exam_type: 'midterm',
      status: 'upcoming',
      total_marks: 100,
      room: 'Room 101'
    },
    {
      id: '2',
      title: 'Physics Quiz',
      subject: 'Physics',
      date: '2024-02-10',
      time: '10:30 AM',
      duration: '1 hour',
      exam_type: 'quiz',
      status: 'upcoming',
      total_marks: 50,
      room: 'Room 205'
    },
    {
      id: '3',
      title: 'Chemistry Lab Test',
      subject: 'Chemistry',
      date: '2024-02-08',
      time: '02:00 PM',
      duration: '1.5 hours',
      exam_type: 'assignment',
      status: 'completed',
      total_marks: 75,
      obtained_marks: 68,
      grade: 'A',
      room: 'Lab 3'
    },
    {
      id: '4',
      title: 'English Final',
      subject: 'English',
      date: '2024-02-05',
      time: '11:00 AM',
      duration: '3 hours',
      exam_type: 'final',
      status: 'completed',
      total_marks: 100,
      obtained_marks: 85,
      grade: 'A+',
      room: 'Room 102'
    }
  ];

  const mockResults: ExamResult[] = [
    { exam_id: '3', percentage: 91, grade: 'A' },
    { exam_id: '4', percentage: 85, grade: 'A+' }
  ];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        // For now, use mock data to maintain existing functionality
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [studentProfile]);

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'midterm':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'final':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'quiz':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'assignment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ongoing':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600';
      case 'B+':
      case 'B':
        return 'text-blue-600';
      case 'C+':
      case 'C':
        return 'text-amber-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && exam.exam_type === selectedFilter;
  });

  const upcomingExams = filteredExams.filter(exam => exam.status === 'upcoming');
  const completedExams = filteredExams.filter(exam => exam.status === 'completed');

  const stats = {
    total: mockExams.length,
    completed: mockExams.filter(e => e.status === 'completed').length,
    upcoming: mockExams.filter(e => e.status === 'upcoming').length,
    averageScore: mockResults.length > 0 ? Math.round(mockResults.reduce((sum, r) => sum + r.percentage, 0) / mockResults.length) : 0
  };

  return (
    <StudentLayoutWithSearch title="Exams">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Exams</div>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-blue-600">This semester</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-green-600">Done</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Upcoming</div>
                <div className="text-2xl font-bold text-amber-600">{stats.upcoming}</div>
                <div className="text-sm text-amber-600">Scheduled</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Average Score</div>
                <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
                <div className="text-sm text-purple-600">Good</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Exam Preparation Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">Exam Preparation</div>
                <div className="text-white/80">Access study materials and practice tests</div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/academics')}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              Study Now
              <Target className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 border border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Upcoming Exams ({upcomingExams.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'completed'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed Exams ({completedExams.length})
            </button>
          </div>
        </div>

        {/* Exam Lists */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingExams.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Upcoming Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400">You don't have any upcoming exams scheduled.</p>
                </div>
              </Card>
            ) : (
              upcomingExams.map((exam) => (
                <Card key={exam.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
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
                          <Calendar className="w-4 h-4" />
                          <span>{exam.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{exam.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Timer className="w-4 h-4" />
                          <span>{exam.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{exam.subject}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4" />
                          <span>{exam.total_marks} marks</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>{exam.room}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        className="px-4 py-2 rounded-xl"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Syllabus
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedExams.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Completed Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400">You haven't completed any exams yet.</p>
                </div>
              </Card>
            ) : (
              completedExams.map((exam) => {
                const result = mockResults.find(r => r.exam_id === exam.id);
                return (
                  <Card key={exam.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{exam.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{exam.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>{exam.subject}</span>
                          </div>
                        </div>
                        {result && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Score</span>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {exam.obtained_marks}/{exam.total_marks}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${result.percentage}%` }}
                              ></div>
                            </div>
                            <div className="mt-2 text-right">
                              <span className={`text-sm font-medium ${getGradeColor(result.grade)}`}>
                                {result.percentage}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline"
                          className="px-4 py-2 rounded-xl"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Result
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </StudentLayoutWithSearch>
  );
};

export default ExamsPageFixed;
