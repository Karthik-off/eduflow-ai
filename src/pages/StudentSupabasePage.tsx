import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Users, Trash2, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import BackToHomeButton from '@/components/BackToHomeButton';

interface Student {
  id: string;
  roll_number: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  created_at: string;
  updated_at: string;
}

interface ExcelStudentData {
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const StudentManagementPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing students from Supabase
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to fetch students: ' + error.message);
      } else {
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  // Validate Excel data before upload
  const validateExcelData = (data: ExcelStudentData[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      // Roll number validation
      if (!row.rollNumber || row.rollNumber.trim() === '') {
        errors.push({
          row: index + 1,
          field: 'rollNumber',
          message: 'Roll number is required'
        });
      }

      // Name validation
      if (!row.name || row.name.trim() === '') {
        errors.push({
          row: index + 1,
          field: 'name',
          message: 'Name is required'
        });
      } else if (row.name.length < 2) {
        errors.push({
          row: index + 1,
          field: 'name',
          message: 'Name must be at least 2 characters'
        });
      }

      // Email validation
      if (row.email && row.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push({
            row: index + 1,
            field: 'email',
            message: 'Invalid email format'
          });
        }
      }

      // Phone validation
      if (row.phone && row.phone.trim() !== '') {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(row.phone.replace(/[\s\-\(\)]/g, ''))) {
          errors.push({
            row: index + 1,
            field: 'phone',
            message: 'Invalid phone number format'
          });
        }
      }

      // Department validation
      if (!row.department || row.department.trim() === '') {
        errors.push({
          row: index + 1,
          field: 'department',
          message: 'Department is required'
        });
      }

      // Year validation
      if (!row.year || row.year.trim() === '') {
        errors.push({
          row: index + 1,
          field: 'year',
          message: 'Year is required'
        });
      }
    });

    return errors;
  };

  // Handle Excel file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setUploading(true);
    setValidationErrors([]);

    try {
      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[0];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate Excel format
      if (!jsonData || jsonData.length === 0) {
        toast.error('Excel file is empty or has invalid format');
        return;
      }

      // Check required columns
      const firstRow = jsonData[0];
      const requiredColumns = ['rollNumber', 'name', 'email', 'phone', 'department', 'year'];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));

      if (missingColumns.length > 0) {
        toast.error(`Excel file is missing required columns: ${missingColumns.join(', ')}`);
        return;
      }

      // Map Excel data to student objects
      const studentData: ExcelStudentData[] = jsonData.map((row: any) => ({
        rollNumber: String(row.rollNumber || '').trim(),
        name: String(row.name || '').trim(),
        email: String(row.email || '').trim(),
        phone: String(row.phone || '').trim(),
        department: String(row.department || '').trim(),
        year: String(row.year || '').trim()
      }));

      // Validate data
      setValidating(true);
      const errors = validateExcelData(studentData);
      setValidationErrors(errors);

      if (errors.length > 0) {
        toast.error(`Found ${errors.length} validation errors. Please fix them before uploading.`);
        setValidating(false);
        return;
      }

      // Map to Supabase table structure
      const supabaseData = studentData.map(student => ({
        roll_number: student.rollNumber,
        name: student.name,
        email: student.email || null,
        phone: student.phone || null,
        department: student.department,
        year: student.year
      }));

      // Insert data into Supabase
      const { data, error } = await supabase
        .from('students')
        .insert(supabaseData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        
        // Handle specific error cases
        if (error.code === '23505') {
          // Unique constraint violation
          if (error.message.includes('roll_number')) {
            toast.error('Duplicate roll number found. Please check your data.');
          } else if (error.message.includes('email')) {
            toast.error('Duplicate email found. Please check your data.');
          } else {
            toast.error('Duplicate data found. Please check your data.');
          }
        } else {
          toast.error('Failed to upload students: ' + error.message);
        }
      } else {
        toast.success(`Successfully uploaded ${data?.length || 0} students to database!`);
        
        // Refresh student list
        await fetchStudents();
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      toast.error('Failed to process Excel file. Please check format and try again.');
    } finally {
      setUploading(false);
      setValidating(false);
    }
  };

  // Download sample Excel file
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        rollNumber: 'CS001',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        phone: '+1234567890',
        department: 'Computer Science',
        year: '3rd'
      },
      {
        rollNumber: 'EE002',
        name: 'Jane Smith',
        email: 'jane.smith@university.edu',
        phone: '+0987654321',
        department: 'Electrical Engineering',
        year: '2nd'
      },
      {
        rollNumber: 'ME003',
        name: 'Mike Johnson',
        email: 'mike.johnson@university.edu',
        phone: '+1122334455',
        department: 'Mechanical Engineering',
        year: '4th'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_upload_sample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Sample Excel file downloaded');
  };

  // Delete student
  const handleDeleteStudent = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        toast.error('Failed to delete student: ' + error.message);
      } else {
        toast.success(`Student "${name}" deleted successfully`);
        setStudents(prev => prev.filter(student => student.id !== id));
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Error deleting student');
    }
  };

  // Load students on component mount
  useState(() => {
    fetchStudents();
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackToHomeButton variant="navbar" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Student Management (Supabase)</h1>
              <p className="text-muted-foreground">Upload Excel files to add students to Supabase database</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {students.length} Students
          </Badge>
        </div>

        {/* Upload Section */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Students from Excel to Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading || validating}
                />
                <Button 
                  variant="outline" 
                  disabled={uploading || validating}
                  className="relative z-10"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : validating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Excel File
                    </>
                  )}
                </Button>
              </div>
              <Button 
                variant="outline" 
                onClick={downloadSampleExcel}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Sample
              </Button>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50/30 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-sm mb-3 text-red-900 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Validation Errors ({validationErrors.length})
                </h3>
                <div className="space-y-2 text-sm text-red-800 max-h-40 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-medium">Row {error.row}:</span>
                      <span>{error.field} - {error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-sm mb-3 text-blue-900">Excel Format Requirements</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Required Columns:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code className="bg-blue-100 px-1 rounded">rollNumber</code> → roll_number</li>
                  <li><code className="bg-blue-100 px-1 rounded">name</code> → name</li>
                  <li><code className="bg-blue-100 px-1 rounded">email</code> → email</li>
                  <li><code className="bg-blue-100 px-1 rounded">phone</code> → phone</li>
                  <li><code className="bg-blue-100 px-1 rounded">department</code> → department</li>
                  <li><code className="bg-blue-100 px-1 rounded">year</code> → year</li>
                </ul>
                <p className="text-xs mt-3"><strong>Note:</strong> Data will be stored in Supabase PostgreSQL database</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Students from Supabase Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No students found</h3>
                <p className="text-muted-foreground text-sm">Upload an Excel file to add students to Supabase database.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold text-sm">Roll Number</th>
                      <th className="text-left p-3 font-semibold text-sm">Name</th>
                      <th className="text-left p-3 font-semibold text-sm">Email</th>
                      <th className="text-left p-3 font-semibold text-sm">Phone</th>
                      <th className="text-left p-3 font-semibold text-sm">Department</th>
                      <th className="text-left p-3 font-semibold text-sm">Year</th>
                      <th className="text-left p-3 font-semibold text-sm">Created</th>
                      <th className="text-left p-3 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id} className={`border-b hover:bg-muted/30 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                        <td className="p-3 text-sm font-medium">{student.roll_number}</td>
                        <td className="p-3 text-sm font-medium">{student.name}</td>
                        <td className="p-3 text-sm">{student.email || '—'}</td>
                        <td className="p-3 text-sm">{student.phone || '—'}</td>
                        <td className="p-3 text-sm">{student.department}</td>
                        <td className="p-3 text-sm">{student.year}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentManagementPage;
