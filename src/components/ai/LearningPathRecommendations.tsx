import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Route, 
  Target, 
  Clock, 
  Star, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Lock,
  TrendingUp,
  Award,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
  Zap
} from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  modules: number;
  enrolledCount: number;
  rating: number;
  category: string;
  prerequisites: string[];
  topics: string[];
  progress: number;
  isEnrolled: boolean;
  isLocked: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
}

const LearningPathRecommendations = () => {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Paths', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'programming', name: 'Programming', icon: <Target className="w-4 h-4" /> },
    { id: 'data-science', name: 'Data Science', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'web-development', name: 'Web Dev', icon: <Zap className="w-4 h-4" /> },
    { id: 'mobile', name: 'Mobile Dev', icon: <Users className="w-4 h-4" /> }
  ];

  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Full Stack Web Development',
      description: 'Complete journey from frontend to backend development with modern technologies.',
      difficulty: 'intermediate',
      duration: '12 weeks',
      modules: 6,
      enrolledCount: 15420,
      rating: 4.8,
      category: 'web-development',
      prerequisites: ['Basic HTML/CSS', 'JavaScript Fundamentals'],
      topics: ['React', 'Node.js', 'Databases', 'APIs', 'Deployment'],
      progress: 35,
      isEnrolled: true,
      isLocked: false
    },
    {
      id: '2',
      title: 'Data Science Fundamentals',
      description: 'Master data analysis, visualization, and machine learning basics.',
      difficulty: 'beginner',
      duration: '8 weeks',
      modules: 5,
      enrolledCount: 12350,
      rating: 4.7,
      category: 'data-science',
      prerequisites: ['Basic Statistics', 'Python Basics'],
      topics: ['Python', 'Statistics', 'Visualization', 'ML Basics'],
      progress: 0,
      isEnrolled: false,
      isLocked: false
    },
    {
      id: '3',
      title: 'Advanced Algorithms',
      description: 'Deep dive into complex algorithms and problem-solving techniques.',
      difficulty: 'advanced',
      duration: '10 weeks',
      modules: 8,
      enrolledCount: 8900,
      rating: 4.9,
      category: 'programming',
      prerequisites: ['Data Structures', 'Basic Algorithms'],
      topics: ['Graph Algorithms', 'Dynamic Programming', 'Greedy Algorithms'],
      progress: 0,
      isEnrolled: false,
      isLocked: true
    },
    {
      id: '4',
      title: 'Mobile App Development',
      description: 'Build native mobile applications for iOS and Android.',
      difficulty: 'intermediate',
      duration: '14 weeks',
      modules: 7,
      enrolledCount: 9870,
      rating: 4.6,
      category: 'mobile',
      prerequisites: ['Object-Oriented Programming', 'Basic UI/UX'],
      topics: ['React Native', 'Flutter', 'App Design', 'Publishing'],
      progress: 0,
      isEnrolled: false,
      isLocked: false
    },
    {
      id: '5',
      title: 'Machine Learning Engineering',
      description: 'Build and deploy machine learning models at scale.',
      difficulty: 'advanced',
      duration: '16 weeks',
      modules: 9,
      enrolledCount: 6780,
      rating: 4.8,
      category: 'data-science',
      prerequisites: ['Python', 'Statistics', 'Basic ML'],
      topics: ['Deep Learning', 'MLOps', 'Model Deployment', 'Scaling'],
      progress: 0,
      isEnrolled: false,
      isLocked: true
    }
  ];

  const modules: Module[] = [
    {
      id: '1',
      title: 'HTML & CSS Fundamentals',
      description: 'Learn the building blocks of web pages',
      duration: '2 weeks',
      lessons: 12,
      difficulty: 'beginner',
      isCompleted: true,
      isLocked: false,
      progress: 100
    },
    {
      id: '2',
      title: 'JavaScript Essentials',
      description: 'Master JavaScript programming basics',
      duration: '3 weeks',
      lessons: 18,
      difficulty: 'beginner',
      isCompleted: true,
      isLocked: false,
      progress: 100
    },
    {
      id: '3',
      title: 'React Fundamentals',
      description: 'Build interactive user interfaces with React',
      duration: '2 weeks',
      lessons: 15,
      difficulty: 'intermediate',
      isCompleted: false,
      isLocked: false,
      progress: 60
    },
    {
      id: '4',
      title: 'Node.js & Express',
      description: 'Create backend services with Node.js',
      duration: '2 weeks',
      lessons: 14,
      difficulty: 'intermediate',
      isCompleted: false,
      isLocked: false,
      progress: 30
    },
    {
      id: '5',
      title: 'Database Design',
      description: 'Design and work with databases',
      duration: '2 weeks',
      lessons: 10,
      difficulty: 'intermediate',
      isCompleted: false,
      isLocked: true,
      progress: 0
    },
    {
      id: '6',
      title: 'Deployment & DevOps',
      description: 'Deploy applications to production',
      duration: '1 week',
      lessons: 8,
      difficulty: 'advanced',
      isCompleted: false,
      isLocked: true,
      progress: 0
    }
  ];

  const filteredPaths = learningPaths.filter(path =>
    selectedCategory === 'all' || path.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: LearningPath['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEnrollPath = (pathId: string) => {
    console.log('Enrolling in path:', pathId);
    // In a real app, this would call an API to enroll the user
  };

  const handleStartModule = (moduleId: string) => {
    console.log('Starting module:', moduleId);
    // In a real app, this would navigate to the module
  };

  const renderPathCard = (path: LearningPath) => (
    <Card key={path.id} className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm leading-tight">{path.title}</h3>
              {path.isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {path.description}
            </p>
            
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className={getDifficultyColor(path.difficulty)}>
                {path.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {path.duration}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <BookOpen className="w-3 h-3 mr-1" />
                {path.modules} modules
              </Badge>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {path.rating}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {path.enrolledCount.toLocaleString()}
              </div>
            </div>

            {path.isEnrolled && path.progress > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{path.progress}%</span>
                </div>
                <Progress value={path.progress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              {path.isEnrolled ? (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedPath(path)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Continue
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={path.isLocked ? "secondary" : "default"}
                  className="flex-1"
                  disabled={path.isLocked}
                  onClick={() => handleEnrollPath(path.id)}
                >
                  {path.isLocked ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Target className="w-3 h-3 mr-1" />
                      Enroll
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPathDetail = () => {
    if (!selectedPath) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPath(null)}
          >
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{selectedPath.title}</h2>
            <p className="text-sm text-muted-foreground">{selectedPath.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getDifficultyColor(selectedPath.difficulty)}>
            {selectedPath.difficulty}
          </Badge>
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {selectedPath.duration}
          </Badge>
          <Badge variant="outline">
            <Star className="w-3 h-3 mr-1" />
            {selectedPath.rating}
          </Badge>
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            {selectedPath.enrolledCount.toLocaleString()} enrolled
          </Badge>
        </div>

        {selectedPath.progress > 0 && (
          <Card className="bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Your Progress</span>
                <span className="text-sm">{selectedPath.progress}%</span>
              </div>
              <Progress value={selectedPath.progress} className="h-3" />
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="font-semibold mb-3">Course Modules</h3>
          <div className="space-y-3">
            {modules.map((module, index) => (
              <Card key={module.id} className={`${module.isLocked ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      module.isCompleted ? 'bg-green-100 text-green-600' :
                      module.progress > 0 ? 'bg-blue-100 text-blue-600' :
                      module.isLocked ? 'bg-gray-100 text-gray-400' : 'bg-muted'
                    }`}>
                      {module.isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : module.isLocked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{module.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{module.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span><Clock className="w-3 h-3 inline mr-1" />{module.duration}</span>
                        <span><BookOpen className="w-3 h-3 inline mr-1" />{module.lessons} lessons</span>
                        <Badge className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty}
                        </Badge>
                      </div>

                      {module.progress > 0 && !module.isCompleted && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant={module.isLocked ? "secondary" : "default"}
                      disabled={module.isLocked}
                      onClick={() => handleStartModule(module.id)}
                    >
                      {module.isCompleted ? (
                        'Review'
                      ) : module.isLocked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          {module.progress > 0 ? 'Continue' : 'Start'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Route className="w-5 h-5 text-primary" />
          Learning Paths
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        {!selectedPath ? (
          <div className="h-full flex flex-col">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    {category.icon}
                    <span className="hidden sm:inline ml-1">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {filteredPaths.map(renderPathCard)}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="h-full">
            {renderPathDetail()}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningPathRecommendations;
