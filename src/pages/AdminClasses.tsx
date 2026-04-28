import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  GraduationCap,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  department_id?: string;
  semester_id?: string;
}

const AdminClasses = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sections')
        .select(`
          id,
          name,
          department_id,
          semester_id,
          department:departments(name, code),
          semester:semesters(label)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
        setClasses([]);
      } else {
        // Transform data to match Class interface
        const transformedClasses = data?.map((section: any) => ({
          id: section.id,
          name: section.name,
          code: section.department?.code || 'N/A',
          department: section.department?.name || 'Unknown',
          semester: section.semester?.label || 'Unknown',
          section: 'A', // Default section
          capacity: 60, // Default capacity
          enrolled: 0, // Will be calculated
          room: 'TBD',
          schedule: 'TBD',
          faculty: 'TBD',
          status: 'active' as const,
          created_at: section.id, // Using ID as fallback
          subjects: [],
          department_id: section.department_id,
          semester_id: section.semester_id
        })) || [];
        
        // Fetch student counts for each class
        const classesWithCounts = await Promise.all(
          transformedClasses.map(async (cls) => {
            const { count } = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true })
              .eq('section_id', cls.id);
            
            return {
              ...cls,
              enrolled: count || 0
            };
          })
        );

        setClasses(classesWithCounts);
      }
    } catch (error) {
      console.error('Error in fetchClasses:', error);
      toast.error('Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.faculty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || cls.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = Array.from(new Set(classes.map(cls => cls.department)));

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Are you sure you want to remove this class? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('sections')
          .delete()
          .eq('id', classId);
          
        if (error) {
          toast.error('Failed to delete class: ' + error.message);
        } else {
          setClasses(classes.filter(cls => cls.id !== classId));
          toast.success('Class removed successfully');
        }
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
      }
    }
  };

  const handleToggleStatus = async (classId: string) => {
    try {
      const classToUpdate = classes.find(cls => cls.id === classId);
      if (!classToUpdate) return;

      const newStatus = classToUpdate.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('sections')
        .update({ status: newStatus } as any)
        .eq('id', classId);

      if (error) {
        toast.error('Failed to update class status: ' + error.message);
      } else {
        setClasses(classes.map(cls => 
          cls.id === classId 
            ? { ...cls, status: newStatus }
            : cls
        ));
        toast.success('Class status updated successfully');
      }
    } catch (error) {
      console.error('Error toggling class status:', error);
      toast.error('Failed to update class status');
    }
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
              <Card key={cls.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/admin/class/${cls.id}`)}>
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
                </CardContent>
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
      </div>
    </AdminLayout>
  );
};

export default AdminClasses;
