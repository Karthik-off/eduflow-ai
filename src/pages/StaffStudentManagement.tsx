// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useStudentStore } from '@/stores/studentStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as XLSX from 'xlsx';
import ExcelTemplate from '@/components/common/ExcelTemplate';
import { 
  Users, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Save,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  UserPlus,
  Search,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id?: string;
  user_id?: string;
  roll_number?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  department_id?: string;
  year?: string;
  section_id?: string;
  department_name?: string;
  section_name?: string;
  attendance_percentage?: number;
  avatar_url?: string;
  bio?: string;
  cgpa?: number;
  created_at?: string;
  current_semester_id?: string;
}

interface ExcelStudentData {
  rollNumber: string;
  fullName: string;
  email?: string;
  phone?: string;
  department: string;
  year: string;
}

const StaffStudentManagement = () => {
  const { staffProfile } = useAuthStore();
  const navigate = useNavigate();
  const { students, setStudents, addStudent, updateStudent, deleteStudent, loadStudentsFromStorage } = useStudentStore();
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [uploading, setUploading] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  const departments = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Computer Science' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Information Technology' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Electronics & Communication' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Mechanical Engineering' },
    { id: '00000000-0000-0000-0000-000000000005', name: 'Civil Engineering' }
  ];

  const years = ['1st', '2nd', '3rd', '4th'];

  useEffect(() => {
    loadStudentsFromStorage();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(student => student.department_id === selectedDepartment);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(student => student.year === selectedYear);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedDepartment, selectedYear]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id, user_id, full_name, email, phone, 
          department_id, section_id, attendance_percentage, 
          avatar_url, bio, cgpa, created_at, current_semester_id,
          sections!students_section_id_fkey (name),
          departments!students_department_id_fkey (name)
        `)
        .order('full_name');

      if (error) throw error;

      // Transform data to include display fields
      const transformedStudents = (studentsData || []).map(student => ({
        ...student,
        roll_number: `STU-${student.id?.slice(-6)}`, // Generate roll number from ID
        department_name: student.departments?.name || 'Unknown',
        section_name: student.sections?.name || 'A',
        year: '1st' // Default year since it's not in database
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  
  const handleUpdateStudent = async () => {
    try {
      if (!selectedStudent || !formData.full_name) {
        toast.error('Full name is required');
        return;
      }

      console.log('Updating student:', selectedStudent.id, formData);

      // Check if student exists in database (has real UUID)
      const isDatabaseStudent = selectedStudent.id.includes('-') && selectedStudent.id.length === 36;
      
      if (isDatabaseStudent) {
        // Update in database for real students
        const { data, error } = await supabase
          .from('students')
          .update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            department_id: formData.department_id
          })
          .eq('id', selectedStudent.id)
          .select();

        console.log('Database update result:', { data, error });

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
      }

      // Create updated student object with all required fields
      const updatedStudent = {
        ...selectedStudent,
        roll_number: formData.roll_number || selectedStudent.roll_number,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        department_id: formData.department_id,
        department_name: departments.find(d => d.id === formData.department_id)?.name || selectedStudent.department_name,
        year: formData.year || selectedStudent.year
      };

      // Always update local state (works for both DB and Excel students)
      updateStudent(selectedStudent.id, updatedStudent);
      setFilteredStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === selectedStudent.id ? updatedStudent : student
        )
      );

      toast.success('Student updated successfully');
      setShowEditModal(false);
      setSelectedStudent(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(`Failed to update student: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      // Check if student exists in database (has real UUID)
      const isDatabaseStudent = studentId.includes('-') && studentId.length === 36;
      
      if (isDatabaseStudent) {
        // Delete from database for real students
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentId);

        if (error) throw error;
      }

      // Always remove from local state (works for both DB and Excel students)
      deleteStudent(studentId);
      setFilteredStudents((prevStudents) =>
        prevStudents.filter((student) => student.id !== studentId)
      );

      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setUploading(true);
      
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        toast.error('Excel file is empty');
        return;
      }

      // Normalize column names and map Excel columns to student fields
      const parsedStudents: Partial<Student>[] = jsonData.map((row: any, index: number) => {
        // Normalize column names: lowercase and remove spaces
        const normalizedRow: any = {};
        Object.keys(row).forEach(key => {
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
          normalizedRow[normalizedKey] = row[key];
        });

        // Map normalized columns to student fields with multiple variations
        return {
          id: Date.now().toString() + Math.random().toString(), // Generate unique ID as requested
          roll_number: normalizedRow.rollnumber || normalizedRow.rollno || 
                       normalizedRow.registernumber || normalizedRow.regno || `STU-${index}`,
          full_name: normalizedRow.fullname || normalizedRow.name || 
                     normalizedRow.studentname || '',
          email: normalizedRow.email || normalizedRow.emailid || '',
          phone: normalizedRow.phone || normalizedRow.mobile || 
                 normalizedRow.mobilenumber || '',
          department_id: getDepartmentId(normalizedRow.department || normalizedRow.dept || 'Computer Science'),
          department_name: normalizedRow.department || normalizedRow.dept || 'Computer Science',
          year: normalizedRow.year || normalizedRow.academicyear || '1st',
          section_id: 'section-1',
          section_name: 'A',
          attendance_percentage: 0,
          avatar_url: '',
          bio: '',
          cgpa: 0,
          created_at: new Date().toISOString()
        };
      });

      // Validate required fields
      const invalidStudents = parsedStudents.filter(student => 
        !student.roll_number || !student.full_name
      );

      if (invalidStudents.length === parsedStudents.length) {
        toast.error('Invalid Excel format. Roll Number and Full Name columns are required. Please check column names.');
        return;
      }

      if (invalidStudents.length > 0) {
        toast.warning(`${invalidStudents.length} rows have missing required fields and will be skipped.`);
      }

      // Filter out invalid students
      const validStudents = parsedStudents.filter(student => 
        student.roll_number && student.full_name
      );

      // Update students state immediately
      parsedStudents.forEach(student => {
        addStudent(student);
      });
      setFilteredStudents((prevStudents) => [...prevStudents, ...parsedStudents]);

      // Show success message
      toast.success(`${validStudents.length} students uploaded successfully`);

      // Clear file input
      event.target.value = '';
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process Excel file. Please ensure it\'s a valid Excel format.');
    } finally {
      setUploading(false);
    }
  };

  const validateExcelData = (data: ExcelStudentData[]): string[] => {
    const errors = [];
    const rollNumbers = new Set<string>();

    data.forEach((row, index) => {
      if (!row.rollNumber) {
        errors.push(`Row ${index + 2}: Roll number is required`);
      }
      if (!row.fullName) {
        errors.push(`Row ${index + 2}: Full name is required`);
      }
      if (row.rollNumber && rollNumbers.has(row.rollNumber)) {
        errors.push(`Row ${index + 2}: Duplicate roll number ${row.rollNumber}`);
      }
      rollNumbers.add(row.rollNumber);
    });

    return errors;
  };

  const getDepartmentId = (departmentName: string): string => {
  const dept = departments.find(d => d.name.toLowerCase() === departmentName.toLowerCase());
  if (dept) return dept.id;
  
  // Fallback to Computer Science if department not found
  console.warn(`Department "${departmentName}" not found, using Computer Science`);
  return '00000000-0000-0000-0000-000000000001';
};

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      roll_number: student.roll_number,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      department_id: student.department_id,
      year: student.year
    });
    setShowEditModal(true);
  };

  const openStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const resetForm = () => {
    setFormData({});
    setSelectedStudent(null);
    setShowEditModal(false);
    setShowStudentDetails(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Users className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Staff Portal</p>
              <h2 className="text-sm font-bold font-display text-foreground leading-none">
                {staffProfile?.full_name ?? 'Staff'}
              </h2>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/staff/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="px-4 py-5 max-w-5xl mx-auto space-y-6">
        {/* Filters and Actions */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Student Management
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowTemplate(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Template
                </Button>
                <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? 'Uploading...' : 'Upload Excel'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Only admin can add new students. Staff can edit existing student details.
              </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>
                        {year} Year
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Students ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-foreground text-lg mb-2">No Students Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or add new students</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{student.full_name}</p>
                            <p className="text-sm text-muted-foreground">{student.roll_number}</p>
                            <div className="flex gap-2">
                              <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded">
                                {departments.find(d => d.id === student.department_id)?.name || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded">
                                {student.year} Year
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.email && <p>Email: {student.email}</p>}
                          {student.phone && <p>Phone: {student.phone}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStudentDetails(student)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>

      
      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Roll Number *</label>
                  <Input
                    value={formData.roll_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, roll_number: e.target.value }))}
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name *</label>
                  <Input
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Select value={formData.department_id} onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>
                          {year} Year
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStudent}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Excel Template Modal */}
      {showTemplate && (
        <ExcelTemplate type="students" onClose={() => setShowTemplate(false)} />
      )}

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Student Details
                <Button variant="ghost" size="sm" onClick={() => setShowStudentDetails(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.full_name}</h3>
                  <p className="text-muted-foreground">{selectedStudent.roll_number}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {departments.find(d => d.id === selectedStudent.department_id)?.name || 'Unknown'}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {selectedStudent.year} Year
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedStudent.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <p className="text-sm text-muted-foreground">{selectedStudent.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <p className="text-sm text-muted-foreground">
                    {departments.find(d => d.id === selectedStudent.department_id)?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <p className="text-sm text-muted-foreground">{selectedStudent.year} Year</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">CGPA</label>
                  <p className="text-sm text-muted-foreground">{selectedStudent.cgpa || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Attendance</label>
                  <p className="text-sm text-muted-foreground">{selectedStudent.attendance_percentage || 0}%</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowStudentDetails(false);
                    openEditModal(selectedStudent);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Student
                </Button>
                <Button variant="outline" onClick={() => setShowStudentDetails(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffStudentManagement;
