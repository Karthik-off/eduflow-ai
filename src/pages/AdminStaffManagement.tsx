import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserPlus, Search, Edit, Trash2, Mail, Phone, 
  Calendar, Shield, Filter, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
<<<<<<< HEAD
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
=======
import EditStaffModal from '@/components/admin/EditStaffModal';
>>>>>>> b4a5f06a9d4e8787e0f5dc4967484ab723a361ec

interface StaffRow {
  id: string;
  staff_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  user_id: string;
  department_id: string | null;
  created_at: string;
<<<<<<< HEAD
  status: 'active' | 'inactive';
  subjects?: string[];
  address?: string | null;
  password?: string | null;
=======
  department_name?: string;
>>>>>>> b4a5f06a9d4e8787e0f5dc4967484ab723a361ec
}

const AdminStaffManagement = () => {
  const [staffList, setStaffList] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);

<<<<<<< HEAD
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    staff_code: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    status: 'active'
  });

  const handleAddStaff = () => {
    if (!newStaff.full_name || !newStaff.staff_code) {
      toast.error('Please fill in at least name and staff code');
      return;
    }
    
    const staffMember: StaffMember = {
      id: Math.random().toString(36).substring(7),
      staff_code: newStaff.staff_code || '',
      full_name: newStaff.full_name || '',
      email: newStaff.email || null,
      phone: newStaff.phone || null,
      department: newStaff.department || null,
      created_at: new Date().toISOString().split('T')[0],
      status: (newStaff.status as 'active' | 'inactive') || 'active',
      subjects: []
    };
    
    setStaffList([...staffList, staffMember]);
    setNewStaff({
      staff_code: '',
      full_name: '',
      email: '',
      phone: '',
      department: '',
      status: 'active'
    });
    setShowAddModal(false);
    toast.success('Staff member added successfully');
  };

  const handleUpdateStaff = () => {
    if (!editingStaff || !editingStaff.full_name || !editingStaff.staff_code) {
      toast.error('Name and Staff Code are required');
      return;
    }
    setStaffList(staffList.map(staff => staff.id === editingStaff.id ? editingStaff : staff));
    setEditingStaff(null);
    toast.success('Staff details updated successfully');
  };

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
      subjects: ['Data Structures', 'Algorithms', 'Database Systems'],
      address: '123 Tech Lane, Tech City'
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
    // Simulate loading data & check localStorage
    setTimeout(() => {
      const savedStaff = localStorage.getItem('eduflow_staff_list');
      if (savedStaff) {
        try {
          setStaffList(JSON.parse(savedStaff));
        } catch (e) {
          setStaffList(mockStaff);
        }
      } else {
        setStaffList(mockStaff);
      }
      setLoading(false);
    }, 1000);
  }, []);

  // Sync state to local storage whenever list changes
  useEffect(() => {
    if (!loading && staffList.length > 0) {
      localStorage.setItem('eduflow_staff_list', JSON.stringify(staffList));
    }
  }, [staffList, loading]);

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.staff_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || staff.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
=======
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select('id, staff_code, full_name, email, phone, user_id, department_id, created_at, departments(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Failed to load staff');
    } else {
      setStaffList(
        (data || []).map((s: any) => ({
          ...s,
          department_name: s.departments?.name || 'N/A',
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const filteredStaff = staffList.filter(s => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staff_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'all' || s.department_name === filterDepartment;
    return matchesSearch && matchesDept;
>>>>>>> b4a5f06a9d4e8787e0f5dc4967484ab723a361ec
  });

  const departments = Array.from(new Set(staffList.map(s => s.department_name).filter(Boolean)));

  const handleDeleteStaff = async (staff: StaffRow) => {
    if (!confirm(`Remove ${staff.full_name}?`)) return;
    const { error } = await supabase.functions.invoke('remove-staff', {
      body: { staff_id: staff.id },
    });
    if (error) {
      toast.error('Failed to remove staff');
    } else {
      toast.success('Staff removed');
      fetchStaff();
    }
  };

  const exportStaffData = () => {
    const csv = [
      ['Staff Code', 'Name', 'Email', 'Phone', 'Department', 'Join Date'],
      ...filteredStaff.map(s => [s.staff_code, s.full_name, s.email || '', s.phone || '', s.department_name || '', s.created_at]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'staff_data.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Staff data exported');
  };

  if (loading) {
    return (
      <AdminLayout title="Staff Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
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
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>
<<<<<<< HEAD
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{staffList.length}</p>
=======

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">{staffList.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
>>>>>>> b4a5f06a9d4e8787e0f5dc4967484ab723a361ec
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
                <Filter className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Showing</p>
                  <p className="text-2xl font-bold">{filteredStaff.length}</p>
                </div>
                <Search className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, code, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
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
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-b hover:bg-muted/50">
                      <td className="p-4"><Badge variant="outline">{staff.staff_code}</Badge></td>
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
                      <td className="p-4">{staff.department_name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingStaff(staff)}>
                            <Edit className="w-4 h-4 mr-1" /> Modify
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handleDeleteStaff(staff)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStaff.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No staff found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                placeholder="e.g. John Doe" 
                value={newStaff.full_name || ''} 
                onChange={(e) => setNewStaff({...newStaff, full_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Staff Code</label>
              <Input 
                placeholder="e.g. IT003" 
                value={newStaff.staff_code || ''} 
                onChange={(e) => setNewStaff({...newStaff, staff_code: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                placeholder="e.g. john@eduflow.com" 
                value={newStaff.email || ''} 
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input 
                placeholder="e.g. Computer Science" 
                value={newStaff.department || ''} 
                onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Modal */}
      <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Details</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={editingStaff.full_name} 
                  onChange={(e) => setEditingStaff({...editingStaff, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Staff Code</label>
                <Input 
                  value={editingStaff.staff_code} 
                  onChange={(e) => setEditingStaff({...editingStaff, staff_code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  value={editingStaff.email || ''} 
                  onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={editingStaff.phone || ''} 
                  onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input 
                  value={editingStaff.department || ''} 
                  onChange={(e) => setEditingStaff({...editingStaff, department: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input 
                  value={editingStaff.address || ''} 
                  onChange={(e) => setEditingStaff({...editingStaff, address: e.target.value})}
                />
              </div>
              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium text-destructive">Reset Password</label>
                <Input 
                  type="password"
                  placeholder="Enter new password to reset" 
                  value={editingStaff.password || ''} 
                  onChange={(e) => setEditingStaff({...editingStaff, password: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">Leave blank if you do not want to change the password.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
            <Button onClick={handleUpdateStaff}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
=======
      {/* Edit Modal */}
      <EditStaffModal
        staff={editingStaff}
        open={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        onUpdated={fetchStaff}
      />
>>>>>>> b4a5f06a9d4e8787e0f5dc4967484ab723a361ec
    </AdminLayout>
  );
};

export default AdminStaffManagement;
