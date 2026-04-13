// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/premium-ui/Card';
import { Button } from '@/components/premium-ui/Button';
import { Input } from '@/components/premium-ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import ExcelTemplate from '@/components/common/ExcelTemplate';
import { 
  FileText, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  XCircle,
  Users,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Mark {
  id: string;
  rollNumber: string;
  name: string;
  department: string;
  year: string;
  semester: string;
  subject: string;
  marks: number;
  maxMarks: number;
  testType: string;
  subTestType: string;
  created_at: string;
}

interface ExcelMarkData {
  rollNumber: string;
  fullName: string;
  department: string;
  year: string;
  semester: string;
  subject: string;
  marks: number;
  maxMarks: number;
  testType: string;
  subTestType: string;
}

interface RetestData {
  studentId: string;
  studentName: string;
  subjectId: string;
  originalMarks: number;
  retestMarks: string;
}

const StaffMarksEntry: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRetestModal, setShowRetestModal] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [selectedMark, setSelectedMark] = useState<Mark | null>(null);
  const [retestData, setRetestData] = useState<RetestData | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [filteredMarks, setFilteredMarks] = useState<Mark[]>([]);
  const [formData, setFormData] = useState<Partial<Mark>>({});

  // Test type options
  const testTypes = ['Daily Test', 'Internal Test', 'Model Exam'];
  const dailyTestOptions = ['Daily Test 1', 'Daily Test 2', 'Daily Test 3'];
  const internalTestOptions = ['Internal Test 1', 'Internal Test 2', 'Internal Test 3'];
  const reviewOptions = ['Review 1', 'Review 2', 'Review 3'];

  // Helper functions
  const getSubTestOptions = (testType: string) => {
    switch (testType) {
      case 'Daily Test': return dailyTestOptions;
      case 'Internal Test': return internalTestOptions;
      case 'Model Exam': return [];
      default: return [];
    }
  };

  const isFinalYearFinalSemester = (year: string, semester: string) => {
    return year === '4' && (semester === 'Semester 8' || semester === '8');
  };

  const getDisplayOptions = (year: string, semester: string) => {
    if (isFinalYearFinalSemester(year, semester)) {
      return reviewOptions;
    }
    return ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Data Structures', 'Algorithms'];
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMarks();
  }, [user, navigate]);

  useEffect(() => {
    let filtered = marks;
    
    if (searchTerm) {
      filtered = filtered.filter(mark =>
        mark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mark.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(mark => mark.subject === selectedSubject);
    }
    
    if (selectedExamType !== 'all') {
      filtered = filtered.filter(mark => mark.testType === selectedExamType);
    }
    
    setFilteredMarks(filtered);
  }, [marks, searchTerm, selectedSubject, selectedExamType]);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      
      // Sample data with new structure
      const sampleMarks: Mark[] = [
        {
          id: '1',
          rollNumber: 'STU001',
          name: 'Alice Johnson',
          department: 'CSE',
          year: '3',
          semester: 'Semester 5',
          subject: 'Mathematics',
          marks: 85,
          maxMarks: 100,
          testType: 'Daily Test',
          subTestType: 'Daily Test 1',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          rollNumber: 'STU002',
          name: 'Bob Smith',
          department: 'CSE',
          year: '4',
          semester: 'Semester 8',
          subject: 'Review 1',
          marks: 78,
          maxMarks: 100,
          testType: 'Model Exam',
          subTestType: '',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          rollNumber: 'STU003',
          name: 'Charlie Brown',
          department: 'IT',
          year: '2',
          semester: 'Semester 4',
          subject: 'Physics',
          marks: 92,
          maxMarks: 100,
          testType: 'Internal Test',
          subTestType: 'Internal Test 2',
          created_at: new Date().toISOString()
        }
      ];
      
      setMarks(sampleMarks);
      setFilteredMarks(sampleMarks);
    } catch (error) {
      toast.error('Failed to fetch marks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMark = async () => {
    try {
      if (!formData.rollNumber || !formData.name || !formData.subject || !formData.marks || !formData.maxMarks || !formData.testType) {
        toast.error('Please fill all required fields');
        return;
      }

      const newMark: Mark = {
        id: Date.now().toString() + Math.random().toString(),
        rollNumber: formData.rollNumber,
        name: formData.name,
        department: formData.department || 'CSE',
        year: formData.year || '1',
        semester: formData.semester || 'Semester 1',
        subject: formData.subject,
        marks: formData.marks,
        maxMarks: formData.maxMarks,
        testType: formData.testType,
        subTestType: formData.subTestType || '',
        created_at: new Date().toISOString()
      };

      setMarks(prevMarks => [...prevMarks, newMark]);
      setFilteredMarks(prevMarks => [...prevMarks, newMark]);
      
      toast.success('Mark added successfully');
      setShowAddModal(false);
      setFormData({});
    } catch (error) {
      toast.error('Failed to add mark');
    }
  };

  const handleUpdateMark = async () => {
    try {
      if (!selectedMark || !formData.marks || !formData.maxMarks) {
        toast.error('Marks and max marks are required');
        return;
      }

      const updatedMark = {
        ...selectedMark,
        marks: formData.marks,
        maxMarks: formData.maxMarks,
        testType: formData.testType || selectedMark.testType,
        subTestType: formData.subTestType || selectedMark.subTestType
      };

      setMarks(prevMarks =>
        prevMarks.map(mark =>
          mark.id === selectedMark.id ? updatedMark : mark
        )
      );
      setFilteredMarks(prevMarks =>
        prevMarks.map(mark =>
          mark.id === selectedMark.id ? updatedMark : mark
        )
      );

      toast.success('Marks updated successfully');
      setShowEditModal(false);
      setSelectedMark(null);
      setFormData({});
    } catch (error) {
      toast.error('Failed to update marks');
    }
  };

  const handleDeleteMark = async (markId: string) => {
    if (!confirm('Are you sure you want to delete this mark?')) return;

    try {
      setMarks(prevMarks => prevMarks.filter(mark => mark.id !== markId));
      setFilteredMarks(prevMarks => prevMarks.filter(mark => mark.id !== markId));
      
      toast.success('Mark deleted successfully');
    } catch (error) {
      toast.error('Failed to delete mark');
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
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        toast.error('Excel file is empty');
        return;
      }

      const parsedMarks: ExcelMarkData[] = jsonData.map((row: any) => {
        const normalizedRow: any = {};
        Object.keys(row).forEach(key => {
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
          normalizedRow[normalizedKey] = row[key];
        });

        return {
          rollNumber: normalizedRow.rollnumber || normalizedRow.rollno || '',
          fullName: normalizedRow.fullname || normalizedRow.name || '',
          department: normalizedRow.department || normalizedRow.dept || 'CSE',
          year: normalizedRow.year || '1',
          semester: normalizedRow.semester || 'Semester 1',
          subject: normalizedRow.subject || normalizedRow.review || '',
          marks: parseFloat(normalizedRow.marks) || 0,
          maxMarks: parseFloat(normalizedRow.maxmarks) || 100,
          testType: normalizedRow.testtype || normalizedRow.test || 'Daily Test',
          subTestType: normalizedRow.subtesttype || normalizedRow.subtest || ''
        };
      });

      const invalidRows = parsedMarks.filter(mark => 
        !mark.rollNumber || !mark.fullName || !mark.subject || mark.marks === undefined
      );

      const invalidTestTypes = parsedMarks.filter(mark => 
        !testTypes.includes(mark.testType)
      );

      const invalidSubTestTypes = parsedMarks.filter(mark => {
        if (mark.testType === 'Daily Test') {
          return !dailyTestOptions.includes(mark.subTestType);
        }
        if (mark.testType === 'Internal Test') {
          return !internalTestOptions.includes(mark.subTestType);
        }
        if (mark.testType === 'Model Exam') {
          return mark.subTestType !== '';
        }
        return false;
      });

      if (invalidRows.length > 0) {
        toast.error('Invalid Excel format for marks upload. Roll Number, Full Name, Subject/Review, and Marks columns are required.');
        return;
      }

      if (invalidTestTypes.length > 0) {
        toast.error('Invalid Test Type in Excel. Only allowed: Daily Test, Internal Test, Model Exam');
        return;
      }

      if (invalidSubTestTypes.length > 0) {
        toast.error('Invalid Sub Test Type in Excel. Check your Test Type and Sub Test Type combinations.');
        return;
      }

      const newMarks: Mark[] = parsedMarks.map((markData) => ({
        id: Date.now().toString() + Math.random().toString(),
        rollNumber: markData.rollNumber,
        name: markData.fullName,
        department: markData.department,
        year: markData.year,
        semester: markData.semester,
        subject: markData.subject,
        marks: markData.marks,
        maxMarks: markData.maxMarks,
        testType: markData.testType,
        subTestType: markData.subTestType,
        created_at: new Date().toISOString()
      }));

      setMarks(prevMarks => [...prevMarks, ...newMarks]);
      setFilteredMarks(prevMarks => [...prevMarks, ...newMarks]);

      toast.success(`${newMarks.length} marks uploaded successfully`);

      if (event.target) {
        event.target.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload Excel file');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (mark: Mark) => {
    setSelectedMark(mark);
    setFormData({
      rollNumber: mark.rollNumber,
      name: mark.name,
      department: mark.department,
      year: mark.year,
      semester: mark.semester,
      subject: mark.subject,
      marks: mark.marks,
      maxMarks: mark.maxMarks,
      testType: mark.testType,
      subTestType: mark.subTestType
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({});
    setSelectedMark(null);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleRetest = (mark: Mark) => {
    setRetestData({
      studentId: mark.id,
      studentName: mark.name,
      subjectId: mark.subject,
      originalMarks: mark.marks,
      retestMarks: ''
    });
    setShowRetestModal(true);
  };

  const handleSaveRetest = async () => {
    if (!retestData) return;

    try {
      const retestMarks = parseInt(retestData.retestMarks);
      if (isNaN(retestMarks) || retestMarks < 0 || retestMarks > (retestData.originalMarks || 100)) {
        toast.error('Please enter valid retest marks');
        return;
      }

      toast.success('Retest marks saved successfully');
      setShowRetestModal(false);
      setRetestData(null);
    } catch (error) {
      toast.error('Failed to save retest marks');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Staff Portal</p>
              <h2 className="text-sm font-bold font-display text-foreground leading-none">
                {user?.user_metadata?.full_name || 'Staff'}
              </h2>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/staff/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="px-4 py-5 max-w-5xl mx-auto space-y-6">
        {/* Upload Section */}
        <Card variant="elevated" className="hover-lift-enhanced">
          <CardHeader className="pb-3" title={
              <div className="text-base font-semibold flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Upload Excel File
              </div>
            } />
          <CardContent className="p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
              <Button variant="primary" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Upload Excel'}
              </Button>
              <Button variant="outline" onClick={() => setShowTemplate(true)}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Excel Format: Roll Number, Full Name, Department, Year, Semester, Subject/Review, Marks, Max Marks, Test Type, Sub Test Type
            </p>
          </CardContent>
        </Card>

        {/* Add Mark Button */}
        <Card variant="gradient" className="hover-lift-enhanced">
          <CardHeader className="pb-3" title={
              <div className="text-base font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Add New Mark
              </div>
            } />
          <CardContent className="p-4">
            <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Mark
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card variant="glass" className="hover-lift-enhanced">
          <CardHeader className="pb-3" title={
              <div className="text-base font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filters
              </div>
            } />
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by student name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Data Structures">Data Structures</SelectItem>
                    <SelectItem value="Algorithms">Algorithms</SelectItem>
                    <SelectItem value="Review 1">Review 1</SelectItem>
                    <SelectItem value="Review 2">Review 2</SelectItem>
                    <SelectItem value="Review 3">Review 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {testTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marks List */}
        <Card variant="elevated" className="hover-lift-enhanced">
          <CardHeader className="pb-3" title={
              <div className="text-base font-semibold">
                Marks ({filteredMarks.length})
              </div>
            } />
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredMarks.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-foreground text-lg mb-2">No Marks Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or add new marks</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-4">
                  {filteredMarks.map((mark) => (
                    <div key={mark.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{mark.name}</p>
                            <p className="text-sm text-muted-foreground">{mark.rollNumber}</p>
                            <p className="text-xs text-muted-foreground">{mark.department} - Year {mark.year}</p>
                            <p className="text-xs text-muted-foreground">{mark.semester}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                {mark.subject}
                              </Badge>
                              <Badge variant="outline">
                                {mark.testType}
                              </Badge>
                              {mark.subTestType && (
                                <Badge variant="outline">
                                  {mark.subTestType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{mark.marks}</p>
                          <p className="text-sm text-muted-foreground">/ {mark.maxMarks}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(mark)}
                            title="Edit Marks"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteMark(mark.id)}
                            title="Delete Mark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Mark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card variant="gradient" className="w-full max-w-2xl mx-4 shadow-2xl">
            <CardHeader title="Add New Mark" />
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Roll Number *</label>
                  <Input
                    value={formData.rollNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Student Name *</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Select value={formData.department || 'CSE'} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">Computer Science</SelectItem>
                      <SelectItem value="IT">Information Technology</SelectItem>
                      <SelectItem value="ECE">Electronics</SelectItem>
                      <SelectItem value="MECH">Mechanical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select value={formData.year || '1'} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Semester</label>
                  <Select value={formData.semester || 'Semester 1'} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semester 1">Semester 1</SelectItem>
                      <SelectItem value="Semester 2">Semester 2</SelectItem>
                      <SelectItem value="Semester 3">Semester 3</SelectItem>
                      <SelectItem value="Semester 4">Semester 4</SelectItem>
                      <SelectItem value="Semester 5">Semester 5</SelectItem>
                      <SelectItem value="Semester 6">Semester 6</SelectItem>
                      <SelectItem value="Semester 7">Semester 7</SelectItem>
                      <SelectItem value="Semester 8">Semester 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Test Type *</label>
                  <Select value={formData.testType || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, testType: value, subTestType: '' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.testType && formData.testType !== 'Model Exam' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sub Test Type *</label>
                    <Select value={formData.subTestType || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, subTestType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub test type" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubTestOptions(formData.testType).map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isFinalYearFinalSemester(formData.year || '1', formData.semester || 'Semester 1') ? 'Review' : 'Subject'} *
                  </label>
                  <Select value={formData.subject || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${isFinalYearFinalSemester(formData.year || '1', formData.semester || 'Semester 1') ? 'review' : 'subject'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getDisplayOptions(formData.year || '1', formData.semester || 'Semester 1').map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Marks *</label>
                  <Input
                    type="number"
                    value={formData.marks || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, marks: parseInt(e.target.value) }))}
                    placeholder="Enter marks"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Marks *</label>
                  <Input
                    type="number"
                    value={formData.maxMarks || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) }))}
                    placeholder="Enter max marks"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddMark}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Mark
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Mark Modal */}
      {showEditModal && selectedMark && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card variant="gradient" className="w-full max-w-2xl mx-4 shadow-2xl">
            <CardHeader title="Edit Mark" />
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Roll Number *</label>
                  <Input
                    value={formData.rollNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Student Name *</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Select value={formData.department || 'CSE'} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">Computer Science</SelectItem>
                      <SelectItem value="IT">Information Technology</SelectItem>
                      <SelectItem value="ECE">Electronics</SelectItem>
                      <SelectItem value="MECH">Mechanical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select value={formData.year || '1'} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Semester</label>
                  <Select value={formData.semester || 'Semester 1'} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semester 1">Semester 1</SelectItem>
                      <SelectItem value="Semester 2">Semester 2</SelectItem>
                      <SelectItem value="Semester 3">Semester 3</SelectItem>
                      <SelectItem value="Semester 4">Semester 4</SelectItem>
                      <SelectItem value="Semester 5">Semester 5</SelectItem>
                      <SelectItem value="Semester 6">Semester 6</SelectItem>
                      <SelectItem value="Semester 7">Semester 7</SelectItem>
                      <SelectItem value="Semester 8">Semester 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Test Type *</label>
                  <Select value={formData.testType || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, testType: value, subTestType: '' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.testType && formData.testType !== 'Model Exam' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sub Test Type *</label>
                    <Select value={formData.subTestType || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, subTestType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub test type" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubTestOptions(formData.testType).map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isFinalYearFinalSemester(formData.year || '1', formData.semester || 'Semester 1') ? 'Review' : 'Subject'} *
                  </label>
                  <Select value={formData.subject || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${isFinalYearFinalSemester(formData.year || '1', formData.semester || 'Semester 1') ? 'review' : 'subject'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getDisplayOptions(formData.year || '1', formData.semester || 'Semester 1').map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Marks *</label>
                  <Input
                    type="number"
                    value={formData.marks || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, marks: parseInt(e.target.value) }))}
                    placeholder="Enter marks"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Marks *</label>
                  <Input
                    type="number"
                    value={formData.maxMarks || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) }))}
                    placeholder="Enter max marks"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdateMark}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Mark
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Retest Modal */}
      {showRetestModal && retestData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card variant="gradient" className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader title="Enter Retest Marks" />
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Student: <span className="font-medium">{retestData.studentName}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Subject: <span className="font-medium">{retestData.subjectId}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Original Marks: <span className="font-medium">{retestData.originalMarks}</span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Retest Marks</label>
                <Input
                  type="number"
                  value={retestData.retestMarks}
                  onChange={(e) => setRetestData(prev => prev ? { ...prev, retestMarks: e.target.value } : null)}
                  placeholder="Enter retest marks"
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRetestModal(false)}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleSaveRetest}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Retest
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Excel Template Modal */}
      {showTemplate && (
        <ExcelTemplate type="marks" onClose={() => setShowTemplate(false)} />
      )}
    </div>
  );
};

export default StaffMarksEntry;
