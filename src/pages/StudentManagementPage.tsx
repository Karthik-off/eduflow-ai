// @ts-nocheck
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Users, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Student {
  id?: number;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
}

interface ExcelStudentData {
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
}

const StudentManagementPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing students from database
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
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
        rollNumber: row.rollNumber || '',
        name: row.name || '',
        email: row.email || '',
        phone: row.phone || '',
        department: row.department || '',
        year: row.year || ''
      }));

      // Send data to backend API
      const response = await fetch('http://localhost:8080/api/students/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully uploaded ${result.count || studentData.length} students to database!`);
        
        // Refresh student list
        await fetchStudents();
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to upload students');
      }
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      toast.error('Failed to process Excel file. Please check format and try again.');
    } finally {
      setUploading(false);
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
  const handleDeleteStudent = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/students/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Student deleted successfully');
        setStudents(prev => prev.filter(student => student.id !== id));
      } else {
        toast.error('Failed to delete student');
      }
    } catch (error) {
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
            <p className="text-muted-foreground">Upload Excel files to add students to database</p>
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
              Upload Students from Excel
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
                  disabled={uploading}
                />
                <Button 
                  variant="outline" 
                  disabled={uploading}
                  className="relative z-10"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
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

            {/* Instructions */}
            <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-sm mb-3 text-blue-900">Excel Format Requirements</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Required Columns:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code className="bg-blue-100 px-1 rounded">rollNumber</code> - Student roll number</li>
                  <li><code className="bg-blue-100 px-1 rounded">name</code> - Student full name</li>
                  <li><code className="bg-blue-100 px-1 rounded">email</code> - Student email address</li>
                  <li><code className="bg-blue-100 px-1 rounded">phone</code> - Phone number</li>
                  <li><code className="bg-blue-100 px-1 rounded">department</code> - Department name</li>
                  <li><code className="bg-blue-100 px-1 rounded">year</code> - Academic year</li>
                </ul>
                <p className="text-xs mt-3"><strong>Note:</strong> First row should contain column headers. File format: .xlsx or .xls</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Students List
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
                <p className="text-muted-foreground text-sm">Upload an Excel file to add students to database.</p>
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
                      <th className="text-left p-3 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id} className={`border-b hover:bg-muted/30 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                        <td className="p-3 text-sm">{student.rollNumber}</td>
                        <td className="p-3 text-sm font-medium">{student.name}</td>
                        <td className="p-3 text-sm">{student.email}</td>
                        <td className="p-3 text-sm">{student.phone}</td>
                        <td className="p-3 text-sm">{student.department}</td>
                        <td className="p-3 text-sm">{student.year}</td>
                        <td className="p-3 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id!)}
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
