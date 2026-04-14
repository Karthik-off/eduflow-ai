import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Target
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { toast } from 'sonner';

interface ReportData {
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  attendanceRate: number;
  averageCGPA: number;
  feesCollected: number;
  feesPending: number;
  departments: string[];
  monthlyStats: {
    month: string;
    students: number;
    attendance: number;
  }[];
  departmentStats: {
    name: string;
    students: number;
    staff: number;
    classes: number;
    avgCGPA: number;
  }[];
  topPerformers: {
    name: string;
    rollNumber: string;
    cgpa: number;
    attendance: number;
    department: string;
  }[];
  alerts: {
    type: 'warning' | 'error' | 'info';
    message: string;
    count: number;
  }[];
}

const AdminReports = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useDarkMode();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Mock data for demonstration
  const mockReportData: ReportData = {
    totalStudents: 1245,
    totalStaff: 89,
    totalClasses: 156,
    attendanceRate: 87.5,
    averageCGPA: 3.6,
    feesCollected: 9800000,
    feesPending: 2700000,
    departments: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Engineering'],
    monthlyStats: [
      { month: 'Jan', students: 1200, attendance: 85 },
      { month: 'Feb', students: 1220, attendance: 88 },
      { month: 'Mar', students: 1235, attendance: 87 },
      { month: 'Apr', students: 1240, attendance: 89 },
      { month: 'May', students: 1245, attendance: 90 },
      { month: 'Jun', students: 1245, attendance: 86 }
    ],
    departmentStats: [
      { name: 'Computer Science', students: 450, staff: 25, classes: 60, avgCGPA: 3.8 },
      { name: 'Mathematics', students: 280, staff: 18, classes: 35, avgCGPA: 3.5 },
      { name: 'Physics', students: 220, staff: 15, classes: 28, avgCGPA: 3.4 },
      { name: 'Chemistry', students: 180, staff: 12, classes: 20, avgCGPA: 3.6 },
      { name: 'Engineering', students: 115, staff: 19, classes: 13, avgCGPA: 3.7 }
    ],
    topPerformers: [
      { name: 'Alice Johnson', rollNumber: 'CS2024001', cgpa: 3.95, attendance: 98, department: 'Computer Science' },
      { name: 'Bob Smith', rollNumber: 'MATH2023001', cgpa: 3.92, attendance: 96, department: 'Mathematics' },
      { name: 'Carol Williams', rollNumber: 'PHY2022001', cgpa: 3.89, attendance: 95, department: 'Physics' },
      { name: 'David Brown', rollNumber: 'CHEM2021001', cgpa: 3.87, attendance: 94, department: 'Chemistry' },
      { name: 'Eva Martinez', rollNumber: 'ENG2020001', cgpa: 3.85, attendance: 97, department: 'Engineering' }
    ],
    alerts: [
      { type: 'warning', message: 'Low attendance in Physics department', count: 15 },
      { type: 'error', message: 'Overdue fees pending from 45 students', count: 45 },
      { type: 'info', message: 'New semester enrollment starting next week', count: 0 },
      { type: 'warning', message: '3 faculty members on leave this week', count: 3 }
    ]
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setReportData(mockReportData);
      setLoading(false);
    }, 1500);
  }, []);

  const generateReport = async (type: string) => {
    setGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
      toast.success(`${type} report generated successfully`);
    }, 2000);
  };

  const exportToCSV = (data: any[], filename: string) => {
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Analytics & Reports">
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights and institutional analytics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button 
            variant="outline" 
            onClick={() => generateReport('Comprehensive')}
            disabled={generatingReport}
          >
            <Download className="w-4 h-4 mr-2" />
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{reportData?.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +5.2% from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{reportData?.attendanceRate}%</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -2.1% from last month
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average CGPA</p>
                <p className="text-2xl font-bold">{reportData?.averageCGPA}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +0.1 from last semester
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Alerts
            {reportData?.alerts && reportData.alerts.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {reportData.alerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.alerts?.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h4 className="font-medium">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'secondary' : 'outline'} className="text-xs">
                    {alert.count}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{dept.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {dept.students} students, {dept.staff} faculty
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{dept.avgCGPA} CGPA</div>
                    <div className="text-sm text-muted-foreground">{dept.classes} classes</div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => exportToCSV(reportData?.departmentStats || [], 'department_performance')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Department Data
            </Button>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.topPerformers.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.rollNumber} - {student.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{student.cgpa} CGPA</div>
                    <div className="text-sm text-muted-foreground">{student.attendance}% attendance</div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => exportToCSV(reportData?.topPerformers || [], 'top_performers')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Top Performers
            </Button>
          </CardContent>
        </Card>
      </div>


      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => generateReport('Student Performance')}
            >
              <GraduationCap className="w-6 h-6 mb-2" />
              Student Performance Report
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => generateReport('Attendance Analysis')}
            >
              <Activity className="w-6 h-6 mb-2" />
              Attendance Analysis Report
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
