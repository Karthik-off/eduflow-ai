import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  BookOpen,
  Filter,
  Download,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { toast } from 'sonner';

interface Student {
  id: string;
  roll_number: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string;
  year: string;
  section: string;
  semester: string;
  cgpa: number;
  attendance_percentage: number;
  status: 'active' | 'inactive' | 'graduated';
  admission_date: string;
  fees_status: 'paid' | 'pending' | 'overdue';
}

const AdminStudents = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useDarkMode();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'graduated'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Mock data for demonstration
  const mockStudents: Student[] = [
    {
      id: '1',
      roll_number: 'CS2024001',
      full_name: 'Alice Johnson',
      email: 'alice.johnson@eduflow.com',
      phone: '+1234567890',
      department: 'Computer Science',
      year: '3rd',
      section: 'A',
      semester: '5th',
      cgpa: 3.8,
      attendance_percentage: 92,
      status: 'active',
      admission_date: '2022-08-15',
      fees_status: 'paid'
    },
    {
      id: '2',
      roll_number: 'CS2024002',
      full_name: 'Bob Smith',
      email: 'bob.smith@eduflow.com',
      phone: '+1234567891',
      department: 'Computer Science',
      year: '3rd',
      section: 'B',
      semester: '5th',
      cgpa: 3.5,
      attendance_percentage: 85,
      status: 'active',
      admission_date: '2022-08-15',
      fees_status: 'pending'
    },
    {
      id: '3',
      roll_number: 'MATH2023001',
      full_name: 'Carol Williams',
      email: 'carol.williams@eduflow.com',
      phone: '+1234567892',
      department: 'Mathematics',
      year: '2nd',
      section: 'A',
      semester: '3rd',
      cgpa: 3.9,
      attendance_percentage: 95,
      status: 'active',
      admission_date: '2023-08-15',
      fees_status: 'paid'
    },
    {
      id: '4',
      roll_number: 'PHY2022001',
      full_name: 'David Brown',
      email: 'david.brown@eduflow.com',
      phone: '+1234567893',
      department: 'Physics',
      year: '4th',
      section: 'A',
      semester: '7th',
      cgpa: 3.2,
      attendance_percentage: 78,
      status: 'active',
      admission_date: '2021-08-15',
      fees_status: 'overdue'
    },
    {
      id: '5',
      roll_number: 'CS2020001',
      full_name: 'Eva Martinez',
      email: 'eva.martinez@eduflow.com',
      phone: '+1234567894',
      department: 'Computer Science',
      year: 'Graduated',
      section: 'A',
      semester: '8th',
      cgpa: 3.7,
      attendance_percentage: 88,
      status: 'graduated',
      admission_date: '2020-08-15',
      fees_status: 'paid'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    const matchesYear = filterYear === 'all' || student.year === filterYear;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesYear && matchesStatus;
  });

  const departments = Array.from(new Set(students.map(student => student.department)));
  const years = Array.from(new Set(students.map(student => student.year)));

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to remove this student? This action cannot be undone.')) {
      setStudents(students.filter(student => student.id !== studentId));
      toast.success('Student removed successfully');
    }
  };

  const handleToggleStatus = (studentId: string) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status: student.status === 'active' ? 'inactive' : 'active' }
        : student
    ));
    toast.success('Student status updated successfully');
  };

  const exportStudentData = () => {
    const csvContent = [
      ['Roll Number', 'Name', 'Email', 'Phone', 'Department', 'Year', 'Section', 'CGPA', 'Attendance', 'Status', 'Admission Date'],
      ...filteredStudents.map(student => [
        student.roll_number,
        student.full_name,
        student.email || '',
        student.phone || '',
        student.department,
        student.year,
        student.section,
        student.cgpa.toString(),
        `${student.attendance_percentage}%`,
        student.status,
        student.admission_date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Student data exported successfully');
  };

  const getCGPAColor = (cgpa: number) => {
    if (cgpa >= 3.7) return 'text-green-600';
    if (cgpa >= 3.0) return 'text-blue-600';
    if (cgpa >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-blue-600';
    return 'text-red-600';
  };

  const getFeesStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <AdminLayout title="Students Management">
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Students Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage student records and academic information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportStudentData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => s.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg CGPA</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(2)}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fees Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {students.filter(s => s.fees_status === 'pending' || s.fees_status === 'overdue').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search students by name, roll number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Roll No</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Year/Section</th>
                  <th className="text-left p-4">CGPA</th>
                  <th className="text-left p-4">Attendance</th>
                  <th className="text-left p-4">Fees</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Badge variant="outline">{student.roll_number}</Badge>
                    </td>
                    <td className="p-4 font-medium">{student.full_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{student.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">{student.department}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{student.year}</div>
                        <div className="text-muted-foreground">Sec {student.section}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${getCGPAColor(student.cgpa)}`}>
                        {student.cgpa}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getAttendanceColor(student.attendance_percentage)}`}>
                          {student.attendance_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant="outline"
                        className={getFeesStatusColor(student.fees_status)}
                      >
                        {student.fees_status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={student.status === 'active' ? 'default' : 'secondary'}
                        className={student.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  student.status === 'graduated' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-red-100 text-red-800'}
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStudent(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(student.id)}
                        >
                          <BookOpen className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
};

export default AdminStudents;
