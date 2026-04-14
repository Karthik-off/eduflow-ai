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
import EditStaffModal from '@/components/admin/EditStaffModal';

interface StaffRow {
  id: string;
  staff_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  user_id: string;
  department_id: string | null;
  created_at: string;
  department_name?: string;
}

const AdminStaffManagement = () => {
  const [staffList, setStaffList] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);

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
  });

  const departments = Array.from(new Set(staffList.map(s => s.department_name).filter(Boolean)));

  const handleDeleteStaff = async (staff: StaffRow) => {
    if (!confirm(`Remove ${staff.full_name}?`)) return;
    const { error } = await supabase.functions.invoke('remove-staff', {
      body: { staffId: staff.id },
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

      {/* Edit Modal */}
      <EditStaffModal
        staff={editingStaff}
        open={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        onUpdated={fetchStaff}
      />
    </AdminLayout>
  );
};

export default AdminStaffManagement;
