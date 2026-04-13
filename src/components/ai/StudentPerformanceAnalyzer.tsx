import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen, 
  Calendar,
  DollarSign,
  Brain,
  Video,
  Target,
  Clock,
  BarChart3,
  AlertCircle,
  MessageSquare,
  Download
} from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  rollNumber: string;
  attendancePercentage: number;
  pendingFees: number;
  feeDueDate?: string;
  marks: SubjectMark[];
  cgpa: number;
  semester: string;
}

interface SubjectMark {
  subject: string;
  marks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  credit: number;
}

interface PerformanceInsight {
  type: 'weak_subject' | 'attendance_warning' | 'fee_reminder' | 'exam_risk' | 'class_difficulty';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recommendations: string[];
  actionItems: string[];
  videos?: Array<{
    title: string;
    url: string;
    duration: string;
  }>;
}

interface WhatsAppMessage {
  type: 'attendance' | 'marks' | 'fee' | 'exam_risk';
  message: string;
  priority: 'normal' | 'urgent';
}

const StudentPerformanceAnalyzer = ({ studentData }: { studentData: StudentData }) => {
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [showInsights, setShowInsights] = useState(true);

  const educationalVideos = {
    'Data Structures': [
      { title: 'Data Structures Full Course', url: 'https://youtube.com/watch?v=example1', duration: '4 hours' },
      { title: 'Arrays and Linked Lists Explained', url: 'https://youtube.com/watch?v=example2', duration: '45 min' },
      { title: 'Trees and Graphs Tutorial', url: 'https://youtube.com/watch?v=example3', duration: '1 hour' }
    ],
    'Mathematics': [
      { title: 'Calculus Complete Course', url: 'https://youtube.com/watch?v=math1', duration: '6 hours' },
      { title: 'Linear Algebra Basics', url: 'https://youtube.com/watch?v=math2', duration: '2 hours' },
      { title: 'Statistics for Beginners', url: 'https://youtube.com/watch?v=math3', duration: '3 hours' }
    ],
    'Physics': [
      { title: 'Mechanics Fundamentals', url: 'https://youtube.com/watch?v=phy1', duration: '2.5 hours' },
      { title: 'Thermodynamics Explained', url: 'https://youtube.com/watch?v=phy2', duration: '1.5 hours' },
      { title: 'Wave Motion Tutorial', url: 'https://youtube.com/watch?v=phy3', duration: '1 hour' }
    ]
  };

  useEffect(() => {
    generatePerformanceInsights();
    generateWhatsAppMessages();
  }, [studentData]);

  const generatePerformanceInsights = () => {
    const newInsights: PerformanceInsight[] = [];

    // Check for weak subjects
    const weakSubjects = studentData.marks.filter(mark => mark.percentage < 40);
    if (weakSubjects.length > 0) {
      weakSubjects.forEach(subject => {
        const videos = educationalVideos[subject.subject as keyof typeof educationalVideos] || [];
        newInsights.push({
          type: 'weak_subject',
          severity: subject.percentage < 30 ? 'critical' : 'high',
          title: `Weak Subject Alert: ${subject.subject}`,
          message: `Your performance in ${subject.subject} needs improvement (${subject.percentage}%).`,
          recommendations: [
            `Focus on ${subject.subject} fundamentals`,
            'Practice more problems daily',
            'Seek help from teachers or tutors'
          ],
          actionItems: [
            `Revise chapters where you scored below 35%`,
            'Complete at least 10 practice problems this week',
            'Watch recommended video tutorials'
          ],
          videos: videos.slice(0, 3)
        });
      });
    }

    // Check attendance
    if (studentData.attendancePercentage < 75) {
      newInsights.push({
        type: 'attendance_warning',
        severity: studentData.attendancePercentage < 60 ? 'critical' : 'high',
        title: 'Attendance Warning',
        message: `Your attendance is ${studentData.attendancePercentage}%, below the required 75%.`,
        recommendations: [
          'Attend all upcoming classes without fail',
          'Submit medical certificates for any genuine absences',
          'Focus on maintaining regular attendance'
        ],
        actionItems: [
          'Attend next 5 consecutive classes',
          'Meet with class advisor about attendance concerns',
          'Set daily reminders for class schedules'
        ]
      });
    }

    // Check fee payment
    if (studentData.pendingFees > 0) {
      newInsights.push({
        type: 'fee_reminder',
        severity: studentData.feeDueDate && new Date(studentData.feeDueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'high' : 'medium',
        title: 'Fee Payment Reminder',
        message: `You have pending fees of ₹${studentData.pendingFees.toLocaleString()}.`,
        recommendations: [
          'Pay fees before the deadline to avoid late charges',
          'Check if you are eligible for any scholarships',
          'Contact accounts department for payment plans if needed'
        ],
        actionItems: [
          `Pay before ${studentData.feeDueDate || 'deadline'}`,
          'Save payment receipt for records',
          'Update payment status in system'
        ]
      });
    }

    // Exam risk prediction
    const avgPerformance = studentData.marks.reduce((acc, mark) => acc + mark.percentage, 0) / studentData.marks.length;
    const riskFactors = [];
    
    if (avgPerformance < 50) riskFactors.push('Low academic performance');
    if (studentData.attendancePercentage < 75) riskFactors.push('Poor attendance');
    if (studentData.pendingFees > 0) riskFactors.push('Pending fees may affect eligibility');

    if (riskFactors.length > 0) {
      newInsights.push({
        type: 'exam_risk',
        severity: avgPerformance < 40 || studentData.attendancePercentage < 60 ? 'critical' : 'high',
        title: 'Exam Risk Alert',
        message: 'You may be at risk of failing upcoming exams.',
        recommendations: [
          'Create a structured study schedule',
          'Focus on weak subjects identified above',
          'Attend regular classes and tutorials'
        ],
        actionItems: [
          'Study 3-4 hours daily for next 4 weeks',
          'Complete all pending assignments',
          'Take weekly practice tests',
          'Join study groups for difficult subjects'
        ]
      });
    }

    setInsights(newInsights);
  };

  const generateWhatsAppMessages = () => {
    const messages: WhatsAppMessage[] = [];

    // Attendance message
    if (studentData.attendancePercentage < 75) {
      messages.push({
        type: 'attendance',
        priority: studentData.attendancePercentage < 60 ? 'urgent' : 'normal',
        message: `Hello ${studentData.name}, your attendance is ${studentData.attendancePercentage}%, below the required 75%. Please attend classes regularly to avoid exam eligibility issues.`
      });
    }

    // Low marks messages
    const weakSubjects = studentData.marks.filter(mark => mark.percentage < 40);
    weakSubjects.forEach(subject => {
      messages.push({
        type: 'marks',
        priority: subject.percentage < 30 ? 'urgent' : 'normal',
        message: `Hello ${studentData.name}, your marks in ${subject.subject} are low (${subject.percentage}%). Please check the study suggestions and video tutorials in your dashboard.`
      });
    });

    // Fee reminder
    if (studentData.pendingFees > 0) {
      messages.push({
        type: 'fee',
        priority: studentData.feeDueDate && new Date(studentData.feeDueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? 'urgent' : 'normal',
        message: `Hello ${studentData.name}, your fee payment of ₹${studentData.pendingFees.toLocaleString()} is pending. Last date to pay: ${studentData.feeDueDate || 'as soon as possible'}. Please complete payment soon.`
      });
    }

    // Exam risk message
    const avgPerformance = studentData.marks.reduce((acc, mark) => acc + mark.percentage, 0) / studentData.marks.length;
    if (avgPerformance < 50 || studentData.attendancePercentage < 75) {
      messages.push({
        type: 'exam_risk',
        priority: 'urgent',
        message: `Hello ${studentData.name}, our system noticed you may need extra preparation for upcoming exams. Please check the recovery plan and study suggestions in your dashboard.`
      });
    }

    setWhatsappMessages(messages);
  };

  const getSeverityColor = (severity: PerformanceInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: PerformanceInsight['type']) => {
    switch (type) {
      case 'weak_subject': return <TrendingDown className="w-5 h-5" />;
      case 'attendance_warning': return <Calendar className="w-5 h-5" />;
      case 'fee_reminder': return <DollarSign className="w-5 h-5" />;
      case 'exam_risk': return <AlertTriangle className="w-5 h-5" />;
      case 'class_difficulty': return <BarChart3 className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const sendWhatsAppMessage = (message: WhatsAppMessage) => {
    const phoneNumber = '1234567890'; // Would get from student data
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message.message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            Dashboard Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
          >
            {showInsights ? 'Hide' : 'Show'} Insights
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showInsights && (
          <>
            {/* Performance Insights */}
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <Card key={index} className={`border ${getSeverityColor(insight.severity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        insight.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        insight.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                        insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{insight.message}</p>
                        
                        {insight.videos && insight.videos.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              Recommended Videos
                            </h4>
                            <div className="space-y-1">
                              {insight.videos.map((video, vidIndex) => (
                                <div key={vidIndex} className="flex items-center justify-between p-2 bg-background rounded text-xs">
                                  <span className="font-medium">{video.title}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{video.duration}</span>
                                    <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                                      Watch
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              Recommendations
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
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Action Items
                            </h4>
                            <ul className="space-y-1">
                              {insight.actionItems.map((action, actionIndex) => (
                                <li key={actionIndex} className="text-xs flex items-start gap-1">
                                  <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* WhatsApp Messages */}
            {whatsappMessages.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    WhatsApp Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {whatsappMessages.map((message, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={message.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                            {message.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {message.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{message.message}</p>
                        <Button
                          size="sm"
                          onClick={() => sendWhatsAppMessage(message)}
                          className="text-xs"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Send via WhatsApp
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentPerformanceAnalyzer;
