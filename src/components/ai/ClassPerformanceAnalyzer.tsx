import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  Video,
  Target,
  Brain,
  AlertCircle,
  CheckCircle,
  Download,
  Eye
} from 'lucide-react';

interface ClassData {
  subject: string;
  totalStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passPercentage: number;
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'very_hard';
  weakTopics: string[];
  recommendedResources: Array<{
    title: string;
    type: 'video' | 'article' | 'practice';
    url: string;
    duration?: string;
  }>;
}

interface ClassInsight {
  subject: string;
  issue: 'low_performance' | 'high_difficulty' | 'uneven_performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendations: string[];
  resources: Array<{
    title: string;
    type: 'video' | 'article' | 'practice';
    url: string;
    duration?: string;
  }>;
}

const ClassPerformanceAnalyzer = () => {
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [insights, setInsights] = useState<ClassInsight[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const mockClassData: ClassData[] = [
    {
      subject: 'Data Structures',
      totalStudents: 85,
      averageMarks: 42,
      highestMarks: 89,
      lowestMarks: 12,
      passPercentage: 38,
      difficultyLevel: 'hard',
      weakTopics: ['Trees', 'Graphs', 'Dynamic Programming'],
      recommendedResources: [
        { title: 'Data Structures Complete Course', type: 'video', url: 'https://youtube.com/watch?v=ds1', duration: '4 hours' },
        { title: 'Tree Algorithms Explained', type: 'video', url: 'https://youtube.com/watch?v=tree1', duration: '2 hours' },
        { title: 'Dynamic Programming Practice', type: 'practice', url: 'https://leetcode.com/dp', duration: '3 hours' }
      ]
    },
    {
      subject: 'Mathematics',
      totalStudents: 92,
      averageMarks: 58,
      highestMarks: 95,
      lowestMarks: 22,
      passPercentage: 67,
      difficultyLevel: 'medium',
      weakTopics: ['Calculus', 'Linear Algebra'],
      recommendedResources: [
        { title: 'Calculus Fundamentals', type: 'video', url: 'https://youtube.com/watch?v=calc1', duration: '3 hours' },
        { title: 'Math Practice Problems', type: 'practice', url: 'https://mathpractice.com', duration: '2 hours' }
      ]
    },
    {
      subject: 'Physics',
      totalStudents: 78,
      averageMarks: 35,
      highestMarks: 78,
      lowestMarks: 8,
      passPercentage: 32,
      difficultyLevel: 'very_hard',
      weakTopics: ['Quantum Mechanics', 'Thermodynamics', 'Electromagnetism'],
      recommendedResources: [
        { title: 'Physics Complete Course', type: 'video', url: 'https://youtube.com/watch?v=phys1', duration: '8 hours' },
        { title: 'Quantum Mechanics Simplified', type: 'video', url: 'https://youtube.com/watch?v=quantum1', duration: '2.5 hours' }
      ]
    },
    {
      subject: 'Chemistry',
      totalStudents: 88,
      averageMarks: 65,
      highestMarks: 92,
      lowestMarks: 28,
      passPercentage: 74,
      difficultyLevel: 'medium',
      weakTopics: ['Organic Chemistry'],
      recommendedResources: [
        { title: 'Organic Chemistry Basics', type: 'video', url: 'https://youtube.com/watch?v=org1', duration: '3 hours' }
      ]
    }
  ];

  useEffect(() => {
    setClassData(mockClassData);
    analyzeClassPerformance(mockClassData);
  }, []);

  const analyzeClassPerformance = (data: ClassData[]) => {
    const newInsights: ClassInsight[] = [];

    data.forEach(subjectData => {
      // Low performance detection
      if (subjectData.passPercentage < 40) {
        newInsights.push({
          subject: subjectData.subject,
          issue: 'low_performance',
          severity: subjectData.passPercentage < 30 ? 'critical' : 'high',
          message: `${subjectData.subject} has very low pass rate (${subjectData.passPercentage}%). Many students are struggling.`,
          recommendations: [
            `Review teaching methodology for ${subjectData.subject}`,
            'Provide additional tutoring sessions',
            'Create supplementary learning materials',
            'Focus on identified weak topics'
          ],
          resources: subjectData.recommendedResources
        });
      }

      // High difficulty detection
      if (subjectData.averageMarks < 45) {
        newInsights.push({
          subject: subjectData.subject,
          issue: 'high_difficulty',
          severity: subjectData.averageMarks < 35 ? 'critical' : 'high',
          message: `${subjectData.subject} appears to be very difficult for students (avg: ${subjectData.averageMarks}%).`,
          recommendations: [
            'Simplify complex concepts',
            'Use more visual aids and examples',
            'Provide step-by-step problem solving',
            'Offer extra practice sessions'
          ],
          resources: subjectData.recommendedResources
        });
      }

      // Uneven performance detection
      const performanceGap = subjectData.highestMarks - subjectData.lowestMarks;
      if (performanceGap > 60) {
        newInsights.push({
          subject: subjectData.subject,
          issue: 'uneven_performance',
          severity: performanceGap > 75 ? 'high' : 'medium',
          message: `${subjectData.subject} shows very uneven performance (gap: ${performanceGap}%). Some students excel while others struggle.`,
          recommendations: [
            'Identify and support struggling students',
            'Create peer tutoring programs',
            'Provide differentiated instruction',
            'Offer additional help sessions'
          ],
          resources: subjectData.recommendedResources
        });
      }
    });

    setInsights(newInsights);
  };

  const getDifficultyColor = (difficulty: ClassData['difficultyLevel']) => {
    switch (difficulty) {
      case 'very_hard': return 'bg-red-100 text-red-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'easy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: ClassInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewDetails = (subject: string) => {
    setSelectedSubject(subject);
    setShowDetails(true);
  };

  const handleResourceClick = (resource: any) => {
    window.open(resource.url, '_blank');
  };

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      classPerformance: classData,
      insights: insights,
      summary: {
        totalSubjects: classData.length,
        criticalSubjects: insights.filter(i => i.severity === 'critical').length,
        averagePassRate: classData.reduce((acc, data) => acc + data.passPercentage, 0) / classData.length
      }
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            Class Performance Analysis
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generateReport}>
              <Download className="w-4 h-4 mr-1" />
              Report
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {showDetails ? 'Summary' : 'Details'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!showDetails ? (
          // Summary View
          <div className="space-y-3">
            {classData.map((data) => (
              <Card key={data.subject} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm">{data.subject}</h3>
                        <Badge className={getDifficultyColor(data.difficultyLevel)}>
                          {data.difficultyLevel.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Students</p>
                          <p className="text-sm font-medium">{data.totalStudents}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Average</p>
                          <p className="text-sm font-medium">{data.averageMarks}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pass Rate</p>
                          <p className="text-sm font-medium">{data.passPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Range</p>
                          <p className="text-sm font-medium">{data.lowestMarks}-{data.highestMarks}%</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Pass Rate</span>
                          <span>{data.passPercentage}%</span>
                        </div>
                        <Progress value={data.passPercentage} className="h-2" />
                      </div>

                      {data.weakTopics.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Weak Topics:</p>
                          <div className="flex flex-wrap gap-1">
                            {data.weakTopics.map((topic) => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(data.subject)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Detailed View
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {/* Class Insights */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Class Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((insight, index) => (
                    <Card key={index} className={`border ${getSeverityColor(insight.severity)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            insight.severity === 'critical' ? 'bg-red-100 text-red-600' :
                            insight.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">{insight.subject}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{insight.message}</p>
                            
                            <div className="mb-3">
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                Recommendations for Faculty
                              </h4>
                              <ul className="space-y-1">
                                {insight.recommendations.map((rec, recIndex) => (
                                  <li key={recIndex} className="text-xs flex items-start gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {insight.resources.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                  <Video className="w-4 h-4" />
                                  Recommended Resources for Students
                                </h4>
                                <div className="space-y-1">
                                  {insight.resources.map((resource, resIndex) => (
                                    <div key={resIndex} className="flex items-center justify-between p-2 bg-background rounded text-xs">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {resource.type}
                                        </Badge>
                                        <span className="font-medium">{resource.title}</span>
                                        {resource.duration && (
                                          <span className="text-muted-foreground">{resource.duration}</span>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleResourceClick(resource)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        View
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Subject Details */}
              {selectedSubject && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{selectedSubject} - Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const subjectData = classData.find(d => d.subject === selectedSubject);
                      if (!subjectData) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
                              <p className="text-lg font-bold">{subjectData.totalStudents}</p>
                              <p className="text-xs text-muted-foreground">Total Students</p>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <BarChart3 className="w-6 h-6 mx-auto mb-1 text-primary" />
                              <p className="text-lg font-bold">{subjectData.averageMarks}%</p>
                              <p className="text-xs text-muted-foreground">Average Marks</p>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Target className="w-6 h-6 mx-auto mb-1 text-primary" />
                              <p className="text-lg font-bold">{subjectData.passPercentage}%</p>
                              <p className="text-xs text-muted-foreground">Pass Rate</p>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Brain className="w-6 h-6 mx-auto mb-1 text-primary" />
                              <p className="text-lg font-bold capitalize">{subjectData.difficultyLevel.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">Difficulty</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm mb-2">Performance Distribution</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Excellent (75-100%)</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{width: '15%'}}></div>
                                  </div>
                                  <span className="text-sm">15%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Good (60-74%)</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div>
                                  </div>
                                  <span className="text-sm">25%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Average (40-59%)</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '30%'}}></div>
                                  </div>
                                  <span className="text-sm">30%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Poor (0-39%)</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div className="bg-red-500 h-2 rounded-full" style={{width: '30%'}}></div>
                                  </div>
                                  <span className="text-sm">30%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassPerformanceAnalyzer;
