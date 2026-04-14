import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Clock,
  MapPin,
  Filter,
  Download,
  UserCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { toast } from 'sonner';

interface Class {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: string;
  section: string;
  capacity: number;
  enrolled: number;
  room: string;
  schedule: string;
  faculty: string;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
  subjects: string[];
}

const AdminClasses = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useDarkMode();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  // Mock data for demonstration
  const mockClasses: Class[] = [
    {
      id: '1',
      name: 'Data Structures and Algorithms',
      code: 'CS301',
      department: 'Computer Science',
      semester: '3rd',
      section: 'A',
      capacity: 60,
      enrolled: 45,
      room: 'Lab 301',
      schedule: 'Mon/Wed/Fri 9:00-10:30 AM',
      faculty: 'John Smith',
      status: 'active',
      created_at: '2024-01-15',
      subjects: ['Data Structures', 'Algorithms', 'Complexity Analysis']
    },
    {
      id: '2',
      name: 'Web Development',
      code: 'CS302',
      department: 'Computer Science',
      semester: '3rd',
      section: 'B',
      capacity: 60,
      enrolled: 52,
      room: 'Lab 302',
      schedule: 'Tue/Thu 2:00-3:30 PM',
      faculty: 'Sarah Johnson',
      status: 'active',
      created_at: '2024-01-15',
      subjects: ['HTML/CSS', 'JavaScript', 'React', 'Node.js']
    },
    {
      id: '3',
      name: 'Calculus III',
      code: 'MATH201',
      department: 'Mathematics',
      semester: '2nd',
      section: 'A',
      capacity: 50,
      enrolled: 38,
      room: 'Room 101',
      schedule: 'Mon/Wed/Fri 11:00-12:30 PM',
      faculty: 'Michael Brown',
      status: 'active',
      created_at: '2024-01-20',
      subjects: ['Multivariable Calculus', 'Vector Analysis']
    },
    {
      id: '4',
      name: 'Quantum Mechanics',
      code: 'PHY401',
      department: 'Physics',
      semester: '4th',
      section: 'A',
      capacity: 40,
      enrolled: 25,
      room: 'Room 201',
      schedule: 'Tue/Thu 10:00-11:30 AM',
      faculty: 'Emily Davis',
      status: 'inactive',
      created_at: '2024-01-10',
      subjects: ['Quantum Theory', 'Wave Mechanics', 'Atomic Physics']
    },
    {
      id: '5',
      name: 'Database Systems',
      code: 'CS303',
      department: 'Computer Science',
      semester: '3rd',
      section: 'A',
      capacity: 60,
      enrolled: 60,
      room: 'Lab 303',
      schedule: 'Mon/Wed/Fri 2:00-3:30 PM',
      faculty: 'John Smith',
      status: 'completed',
      created_at: '2023-08-15',
      subjects: ['SQL', 'Database Design', 'NoSQL', 'Normalization']
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setClasses(mockClasses);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.faculty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || cls.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = Array.from(new Set(classes.map(cls => cls.department)));

  const handleDeleteClass = (classId: string) => {
    if (confirm('Are you sure you want to remove this class? This action cannot be undone.')) {
      setClasses(classes.filter(cls => cls.id !== classId));
      toast.success('Class removed successfully');
    }
  };

  const handleToggleStatus = (classId: string) => {
    setClasses(classes.map(cls => 
      cls.id === classId 
        ? { ...cls, status: cls.status === 'active' ? 'inactive' : 'active' }
        : cls
    ));
    toast.success('Class status updated successfully');
  };

  const exportClassData = () => {
    const csvContent = [
      ['Class Code', 'Name', 'Department', 'Semester', 'Section', 'Faculty', 'Room', 'Schedule', 'Capacity', 'Enrolled', 'Status'],
      ...filteredClasses.map(cls => [
        cls.code,
        cls.name,
        cls.department,
        cls.semester,
        cls.section,
        cls.faculty,
        cls.room,
        cls.schedule,
        cls.capacity.toString(),
        cls.enrolled.toString(),
        cls.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'classes_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Class data exported successfully');
  };

  const getEnrollmentPercentage = (enrolled: number, capacity: number) => {
    return Math.round((enrolled / capacity) * 100);
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
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
    <AdminLayout title="Classes Management">
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Classes Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage academic classes, sections, and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportClassData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {classes.filter(c => c.status === 'active').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-purple-600">
                  {classes.reduce((sum, c) => sum + c.enrolled, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Capacity</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(classes.reduce((sum, c) => sum + getEnrollmentPercentage(c.enrolled, c.capacity), 0) / classes.length)}%
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-orange-500" />
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
                  placeholder="Search classes by name, code, or faculty..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>Classes ({filteredClasses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">{cls.code}</Badge>
                    </div>
                    <Badge 
                      variant="outline"
                      className={getStatusColor(cls.status)}
                    >
                      {cls.semester} - Section {cls.section}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      <span>{cls.faculty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{cls.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs">{cls.schedule}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Enrollment</span>
                      <span className={`text-sm font-semibold ${getEnrollmentColor(getEnrollmentPercentage(cls.enrolled, cls.capacity))}`}>
                        {cls.enrolled}/{cls.capacity} ({getEnrollmentPercentage(cls.enrolled, cls.capacity)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          getEnrollmentPercentage(cls.enrolled, cls.capacity) >= 90 ? 'bg-red-500' :
                          getEnrollmentPercentage(cls.enrolled, cls.capacity) >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${getEnrollmentPercentage(cls.enrolled, cls.capacity)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="text-sm text-muted-foreground mb-2">Subjects:</div>
                    <div className="flex flex-wrap gap-1">
                      {cls.subjects.slice(0, 2).map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {cls.subjects.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{cls.subjects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingClass(cls)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(cls.id)}
                      className="flex-1"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Toggle
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminClasses;
