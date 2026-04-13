import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Target, 
  BookOpen, 
  Award, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Timer,
  FileText,
  Brain,
  Zap,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Flag,
  ArrowRight
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  type: 'midterm' | 'final' | 'quiz' | 'assignment';
  date: string;
  duration: string;
  totalMarks: number;
  status: 'upcoming' | 'in-progress' | 'completed';
  preparationLevel: number;
  topicsCovered: string[];
}

interface StudySession {
  id: string;
  examId: string;
  date: string;
  duration: number;
  topicsStudied: string[];
  practiceQuestions: number;
  confidenceLevel: number;
}

interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  timeLimit: number;
}

const ExamPreparation = () => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState('exams');
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const exams: Exam[] = [
    {
      id: '1',
      title: 'Data Structures Midterm',
      subject: 'Computer Science',
      type: 'midterm',
      date: '2026-03-25',
      duration: '2 hours',
      totalMarks: 100,
      status: 'upcoming',
      preparationLevel: 65,
      topicsCovered: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees']
    },
    {
      id: '2',
      title: 'Calculus Final Exam',
      subject: 'Mathematics',
      type: 'final',
      date: '2026-04-15',
      duration: '3 hours',
      totalMarks: 150,
      status: 'upcoming',
      preparationLevel: 45,
      topicsCovered: ['Limits', 'Derivatives', 'Integrals', 'Applications']
    },
    {
      id: '3',
      title: 'Physics Unit Test',
      subject: 'Physics',
      type: 'quiz',
      date: '2026-03-18',
      duration: '1 hour',
      totalMarks: 50,
      status: 'upcoming',
      preparationLevel: 80,
      topicsCovered: ['Mechanics', 'Thermodynamics', 'Waves']
    },
    {
      id: '4',
      title: 'Chemistry Lab Quiz',
      subject: 'Chemistry',
      type: 'quiz',
      date: '2026-03-10',
      duration: '45 minutes',
      totalMarks: 30,
      status: 'completed',
      preparationLevel: 90,
      topicsCovered: ['Organic Reactions', 'Lab Safety', 'Measurements']
    }
  ];

  const practiceQuestions: PracticeQuestion[] = [
    {
      id: '1',
      question: 'What is the time complexity of binary search in a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary search divides the array in half at each step, resulting in logarithmic time complexity O(log n).',
      difficulty: 'medium',
      topic: 'Algorithms',
      timeLimit: 60
    },
    {
      id: '2',
      question: 'Which data structure uses LIFO principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 1,
      explanation: 'Stack follows Last In First Out (LIFO) principle where the last element added is the first one to be removed.',
      difficulty: 'easy',
      topic: 'Data Structures',
      timeLimit: 45
    },
    {
      id: '3',
      question: 'What is the derivative of sin(x)?',
      options: ['-cos(x)', 'cos(x)', 'tan(x)', '-sin(x)'],
      correctAnswer: 1,
      explanation: 'The derivative of sin(x) with respect to x is cos(x). This is a fundamental derivative in calculus.',
      difficulty: 'easy',
      topic: 'Calculus',
      timeLimit: 60
    }
  ];

  const studyPlan = [
    {
      day: 'Today',
      tasks: [
        { topic: 'Review Arrays and Linked Lists', duration: '45 min', priority: 'high' },
        { topic: 'Practice Binary Search Problems', duration: '30 min', priority: 'medium' },
        { topic: 'Revise Stack Operations', duration: '20 min', priority: 'low' }
      ]
    },
    {
      day: 'Tomorrow',
      tasks: [
        { topic: 'Study Tree Traversals', duration: '60 min', priority: 'high' },
        { topic: 'Practice Queue Problems', duration: '30 min', priority: 'medium' }
      ]
    },
    {
      day: 'Day Before Exam',
      tasks: [
        { topic: 'Full Syllabus Review', duration: '90 min', priority: 'high' },
        { topic: 'Mock Test', duration: '120 min', priority: 'high' },
        { topic: 'Revise Formulas', duration: '30 min', priority: 'medium' }
      ]
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      setIsTimerActive(false);
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  const getExamStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: PracticeQuestion['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPreparationColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleStartPractice = () => {
    const randomQuestion = practiceQuestions[Math.floor(Math.random() * practiceQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeRemaining(randomQuestion.timeLimit);
    setIsTimerActive(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    setIsTimerActive(false);
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setSelectedAnswer(null);
  };

  const handleNextQuestion = () => {
    handleStartPractice();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCountdownDays = (examDate: string) => {
    const exam = new Date(examDate);
    const today = new Date();
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderExamCard = (exam: Exam) => {
    const daysLeft = getCountdownDays(exam.date);
    const isUrgent = daysLeft <= 3 && exam.status === 'upcoming';

    return (
      <Card key={exam.id} className={`hover:shadow-lg transition-shadow cursor-pointer ${isUrgent ? 'border-orange-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-sm leading-tight">{exam.title}</h3>
                {isUrgent && <AlertCircle className="w-4 h-4 text-orange-500" />}
              </div>
              
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {exam.subject}
                </Badge>
                <Badge className={getExamStatusColor(exam.status)}>
                  {exam.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {daysLeft > 0 ? `${daysLeft} days` : 'Today'}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Preparation Level</span>
                  <span className="font-medium">{exam.preparationLevel}%</span>
                </div>
                <Progress value={exam.preparationLevel} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                <div><Clock className="w-3 h-3 inline mr-1" />{exam.duration}</div>
                <div><Target className="w-3 h-3 inline mr-1" />{exam.totalMarks} marks</div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedExam(exam)}
                >
                  <Brain className="w-3 h-3 mr-1" />
                  Prepare
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExamDetail = () => {
    if (!selectedExam) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedExam(null)}>
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{selectedExam.title}</h2>
            <p className="text-sm text-muted-foreground">{selectedExam.subject}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="study-plan">Study Plan</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Exam Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{selectedExam.date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{selectedExam.duration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Marks:</span>
                    <p className="font-medium">{selectedExam.totalMarks}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium capitalize">{selectedExam.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExam.topicsCovered.map((topic) => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Preparation Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Overall Preparation</span>
                    <span className="font-medium">{selectedExam.preparationLevel}%</span>
                  </div>
                  <Progress value={selectedExam.preparationLevel} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    {selectedExam.preparationLevel >= 80 ? 'Excellent preparation!' :
                     selectedExam.preparationLevel >= 60 ? 'Good progress, keep studying!' :
                     selectedExam.preparationLevel >= 40 ? 'Need more preparation' :
                     'Start preparing immediately!'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="study-plan" className="space-y-4">
            {studyPlan.map((day, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {day.day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {day.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.topic}</p>
                        <p className="text-xs text-muted-foreground">{task.duration}</p>
                      </div>
                      <Badge className={
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="practice" className="space-y-4">
            {!currentQuestion ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Practice Questions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test your knowledge with practice questions
                  </p>
                  <Button onClick={handleStartPractice}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="outline">{currentQuestion.topic}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="w-4 h-4" />
                      <span className={`font-mono ${timeRemaining <= 10 ? 'text-red-500' : ''}`}>
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-4">{currentQuestion.question}</h3>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            showResult
                              ? index === currentQuestion.correctAnswer
                                ? 'bg-green-100 border-green-300'
                                : selectedAnswer === index
                                ? 'bg-red-100 border-red-300'
                                : 'bg-muted/30'
                              : selectedAnswer === index
                              ? 'bg-primary/10 border-primary/30'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              showResult
                                ? index === currentQuestion.correctAnswer
                                  ? 'bg-green-500 border-green-500'
                                  : selectedAnswer === index
                                  ? 'bg-red-500 border-red-500'
                                  : 'border-muted-foreground'
                                : selectedAnswer === index
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}>
                              {showResult && index === currentQuestion.correctAnswer && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {showResult && (
                    <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm font-medium mb-1">Explanation:</p>
                      <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!showResult ? (
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                        className="flex-1"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion} className="flex-1">
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Study Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <BookOpen className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Study Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Target className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">85</p>
                    <p className="text-xs text-muted-foreground">Questions Practiced</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">24h</p>
                    <p className="text-xs text-muted-foreground">Total Study Time</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-muted-foreground">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-primary" />
          Exam Preparation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        {!selectedExam ? (
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {exams.map(renderExamCard)}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full">
            {renderExamDetail()}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamPreparation;
