import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  staff_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  created_at: string;
  status: 'active' | 'inactive';
  subjects?: string[];
}

const AdminStaffManagement = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useDarkMode();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Mock data for demonstration
  const mockStaff: StaffMember[] = [
    {
      id: '1',
      staff_code: 'IT001',
      full_name: 'John Smith',
      email: 'john.smith@eduflow.com',
      phone: '+1234567890',
      department: 'Computer Science',
      created_at: '2024-01-15',
      status: 'active',
      subjects: ['Data Structures', 'Algorithms', 'Database Systems']
    },
    {
      id: '2',
      staff_code: 'IT002',
      full_name: 'Sarah Johnson',
      email: 'sarah.johnson@eduflow.com',
      phone: '+1234567891',
      department: 'Computer Science',
      created_at: '2024-01-20',
      status: 'active',
      subjects: ['Web Development', 'Software Engineering']
    },
    {
      id: '3',
      staff_code: 'MATH001',
      full_name: 'Michael Brown',
      email: 'michael.brown@eduflow.com',
      phone: '+1234567892',
      department: 'Mathematics',
      created_at: '2024-02-01',
      status: 'active',
      subjects: ['Calculus', 'Linear Algebra', 'Statistics']
    },
    {
      id: '4',
      staff_code: 'PHY001',
      full_name: 'Emily Davis',
      email: 'emily.davis@eduflow.com',
      phone: '+1234567893',
      department: 'Physics',
      created_at: '2024-02-10',
      status: 'inactive',
      subjects: ['Mechanics', 'Electromagnetism', 'Quantum Physics']
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStaffList(mockStaff);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.staff_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || staff.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = Array.from(new Set(staffList.map(staff => staff.department).filter(Boolean)));

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaffList(staffList.filter(staff => staff.id !== staffId));
      toast.success('Staff member removed successfully');
    }
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffList(staffList.map(staff => 
      staff.id === staffId 
        ? { ...staff, status: staff.status === 'active' ? 'inactive' : 'active' }
        : staff
    ));
    toast.success('Staff status updated successfully');
  };

  const exportStaffData = () => {
    // CSV export functionality
    const csvContent = [
      ['Staff Code', 'Name', 'Email', 'Phone', 'Department', 'Status', 'Join Date'],
      ...filteredStaff.map(staff => [
        staff.staff_code,
        staff.full_name,
        staff.email || '',
        staff.phone || '',
        staff.department || '',
        staff.status,
        staff.created_at
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Staff data exported successfully');
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
    <AdminLayout title="Staff Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Staff Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage faculty members and their assignments</p>
          </div>
          <div className="flex gap-2">
          <Button variant="outline" onClick={exportStaffData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{staffList.length}</p>
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
                  {staffList.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-red-600">
                  {staffList.filter(s => s.status === 'inactive').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-500" />
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
                  placeholder="Search staff by name, code, or email..."
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
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Staff Code</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Subjects</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Badge variant="outline">{staff.staff_code}</Badge>
                    </td>
                    <td className="p-4 font-medium">{staff.full_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{staff.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{staff.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">{staff.department || 'N/A'}</td>
                    <td className="p-4">
                      <Badge 
                        variant={staff.status === 'active' ? 'default' : 'secondary'}
                        className={staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {staff.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.subjects?.slice(0, 2).map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {staff.subjects && staff.subjects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{staff.subjects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStaff(staff)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(staff.id)}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStaff(staff.id)}
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
    </AdminLayout>
  );
};

export default AdminStaffManagement;
