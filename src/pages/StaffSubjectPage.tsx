import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Loader2, ClipboardList, Upload, Brain, Save, X,
  Plus, FileText, Trash2, BookOpen, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  roll_number: string;
  full_name: string;
}

interface MarkEntry {
  id?: string;
  student_id: string;
  marks_obtained: number | string;
  isNew?: boolean;
}

interface MarkRecord {
  id: string;
  student_id: string;
  marks_obtained: number;
  max_marks: number;
  exam_type: string;
  is_locked: boolean;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

interface AIRecovery {
  strategies: string[];
  youtubeQueries: string[];
  motivation: string;
}

const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Assignment 1', 'Assignment 2', 'End Semester'];
const MAX_MARKS_MAP: Record<string, number> = {
  'Unit Test 1': 25, 'Unit Test 2': 25, 'Mid Term': 50,
  'Assignment 1': 10, 'Assignment 2': 10, 'End Semester': 100,
};

const StaffSubjectPage = () => {
  const { sectionId, subjectId } = useParams<{ sectionId: string; subjectId: string }>();
  const navigate = useNavigate();
  const { staffProfile, user } = useAuthStore();

  const [subjectInfo, setSubjectInfo] = useState<{ name: string; code: string } | null>(null);
  const [sectionInfo, setSectionInfo] = useState<{ name: string } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marks');

  // Marks
  const [selectedExamType, setSelectedExamType] = useState(EXAM_TYPES[0]);
  const [existingMarks, setExistingMarks] = useState<MarkRecord[]>([]);
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([]);
  const [savingMarks, setSavingMarks] = useState(false);

  // Materials
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecovery, setAiRecovery] = useState<AIRecovery | null>(null);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (sectionId && subjectId) {
      fetchData();
    }
  }, [sectionId, subjectId]);

  useEffect(() => {
    if (students.length > 0 && subjectId) fetchMarks();
  }, [selectedExamType, students, subjectId]);

  useEffect(() => {
    if (activeTab === 'materials') fetchMaterials();
  }, [activeTab]);

  const fetchData = async () => {
    const [{ data: subj }, { data: sec }, { data: studs }] = await Promise.all([
      supabase.from('subjects').select('name, code').eq('id', subjectId!).single(),
      supabase.from('sections').select('name').eq('id', sectionId!).single(),
      supabase.from('students').select('id, roll_number, full_name').eq('section_id', sectionId!).order('roll_number'),
    ]);
    setSubjectInfo(subj as any);
    setSectionInfo(sec as any);
    setStudents((studs ?? []) as Student[]);
    setLoading(false);
  };

  // --- MARKS ---
  const fetchMarks = async () => {
    const { data } = await supabase
      .from('marks')
      .select('id, student_id, marks_obtained, max_marks, exam_type, is_locked')
      .eq('subject_id', subjectId!)
      .eq('exam_type', selectedExamType)
      .in('student_id', students.map(s => s.id));

    setExistingMarks((data ?? []) as MarkRecord[]);

    // Build entries
    const entries: MarkEntry[] = students.map(s => {
      const existing = (data ?? []).find((m: any) => m.student_id === s.id);
      return {
        id: existing?.id,
        student_id: s.id,
        marks_obtained: existing ? existing.marks_obtained : '',
        isNew: !existing,
      };
    });
    setMarkEntries(entries);
  };

  const maxMarks = MAX_MARKS_MAP[selectedExamType] ?? 100;

  const updateMark = (studentId: string, value: string) => {
    const num = value === '' ? '' : parseFloat(value);
    if (num !== '' && (num < 0 || num > maxMarks)) return; // range validation
    setMarkEntries(prev => prev.map(e =>
      e.student_id === studentId ? { ...e, marks_obtained: num } : e
    ));
  };

  const handleSaveMarks = async () => {
    setSavingMarks(true);
    const toInsert = markEntries.filter(e => e.isNew && e.marks_obtained !== '');
    const toUpdate = markEntries.filter(e => !e.isNew && e.marks_obtained !== '');

    try {
      if (toInsert.length > 0) {
        const { error } = await supabase.from('marks').insert(
          toInsert.map(e => ({
            student_id: e.student_id,
            subject_id: subjectId!,
            exam_type: selectedExamType,
            marks_obtained: Number(e.marks_obtained),
            max_marks: maxMarks,
            entered_by: staffProfile!.id,
          }))
        );
        if (error) throw error;
      }

      for (const entry of toUpdate) {
        if (entry.id) {
          const { error } = await supabase.from('marks')
            .update({ marks_obtained: Number(entry.marks_obtained) })
            .eq('id', entry.id);
          if (error) throw error;
        }
      }

      toast.success(`Marks saved for ${selectedExamType}`);
      fetchMarks();
    } catch (err: any) {
      toast.error('Failed to save marks: ' + err.message);
    }
    setSavingMarks(false);
  };

  // --- MATERIALS ---
  const fetchMaterials = async () => {
    setMaterialsLoading(true);
    const { data } = await supabase
      .from('study_materials')
      .select('*')
      .eq('subject_id', subjectId!)
      .order('created_at', { ascending: false });
    setMaterials((data ?? []) as StudyMaterial[]);
    setMaterialsLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, PPT, and image files are allowed');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !uploadForm.title.trim()) {
      toast.error('Please enter a title and select a file');
      return;
    }

    setUploading(true);
    const filePath = `${subjectId}/${Date.now()}_${selectedFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(filePath, selectedFile);

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase() ?? 'pdf';
    const { error: insertError } = await supabase.from('study_materials').insert({
      subject_id: subjectId!,
      title: uploadForm.title,
      description: uploadForm.description || null,
      file_path: filePath,
      file_type: fileType,
      file_size: selectedFile.size,
      uploaded_by: user!.id,
    });

    if (insertError) {
      toast.error('Failed to save record');
    } else {
      toast.success('Material uploaded');
      setShowUpload(false);
      setUploadForm({ title: '', description: '' });
      setSelectedFile(null);
      fetchMaterials();
    }
    setUploading(false);
  };

  const deleteMaterial = async (id: string, filePath: string) => {
    await supabase.storage.from('study-materials').remove([filePath]);
    await supabase.from('study_materials').delete().eq('id', id);
    toast.success('Material removed');
    fetchMaterials();
  };

  // --- AI RECOVERY ---
  const handleAIRecovery = async () => {
    // Find students below 40% in current exam type
    const lowStudents = markEntries.filter(e => {
      if (e.marks_obtained === '' || e.marks_obtained === undefined) return false;
      return (Number(e.marks_obtained) / maxMarks) * 100 < 40;
    });

    if (lowStudents.length === 0) {
      toast.info('No students below 40% threshold in this exam');
      return;
    }

    setAiLoading(true);
    setShowAI(true);
    try {
      const firstLow = lowStudents[0];
      const student = students.find(s => s.id === firstLow.student_id);
      const { data, error } = await supabase.functions.invoke('ai-academic', {
        body: {
          type: 'recovery_suggestion',
          studentName: student?.full_name ?? 'Student',
          subjectName: subjectInfo?.name ?? 'Subject',
          marksObtained: Number(firstLow.marks_obtained),
          maxMarks,
          examType: selectedExamType,
        },
      });
      if (error) throw error;
      setAiRecovery(data as AIRecovery);
    } catch {
      toast.error('Failed to generate AI suggestions');
      setShowAI(false);
    }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-5xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/staff/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold font-display text-foreground truncate">
              {subjectInfo?.name ?? 'Subject'}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {subjectInfo?.code} · {sectionInfo?.name}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-5xl mx-auto space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marks" className="text-xs gap-1">
              <ClipboardList className="w-3 h-3" /> Marks
            </TabsTrigger>
            <TabsTrigger value="materials" className="text-xs gap-1">
              <Upload className="w-3 h-3" /> Materials
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1">
              <Brain className="w-3 h-3" /> AI Recovery
            </TabsTrigger>
          </TabsList>

          {/* MARKS TAB */}
          <TabsContent value="marks" className="space-y-3 mt-3">
            <div className="flex items-center gap-3">
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_TYPES.map(et => (
                    <SelectItem key={et} value={et}>{et}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="text-[10px]">Max: {maxMarks}</Badge>
              <div className="flex-1" />
              <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={handleSaveMarks} disabled={savingMarks}>
                {savingMarks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" /> Save</>}
              </Button>
            </div>

            <div className="space-y-1.5">
              {markEntries.map(entry => {
                const student = students.find(s => s.id === entry.student_id);
                const val = entry.marks_obtained;
                const pct = val !== '' ? (Number(val) / maxMarks) * 100 : null;
                const isLow = pct !== null && pct < 40;
                return (
                  <Card key={entry.student_id} className={`shadow-card border-0 ${isLow ? 'ring-1 ring-destructive/30' : ''}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{student?.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">{student?.roll_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={maxMarks}
                          step="0.5"
                          value={val}
                          onChange={e => updateMark(entry.student_id, e.target.value)}
                          className="w-20 h-8 text-center text-sm"
                          placeholder="—"
                        />
                        <span className="text-[10px] text-muted-foreground w-8">/{maxMarks}</span>
                        {isLow && <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* MATERIALS TAB */}
          <TabsContent value="materials" className="space-y-3 mt-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-display text-foreground">Study Materials</h3>
              <Button size="sm" className="gradient-accent text-accent-foreground text-xs" onClick={() => setShowUpload(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Upload
              </Button>
            </div>

            {materialsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : materials.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No materials uploaded yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {materials.map(mat => (
                  <Card key={mat.id} className="shadow-card border-0">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{mat.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {mat.file_type.toUpperCase()} · {mat.file_size ? `${(mat.file_size / 1024).toFixed(0)}KB` : ''} · {new Date(mat.created_at).toLocaleDateString()}
                        </p>
                        {mat.description && <p className="text-[10px] text-muted-foreground truncate">{mat.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMaterial(mat.id, mat.file_path)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI RECOVERY TAB */}
          <TabsContent value="ai" className="space-y-3 mt-3">
            <Card className="shadow-card border-0">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" /> AI Academic Recovery
                </h3>
                <p className="text-xs text-muted-foreground">
                  Analyzes students below 40% and generates personalized recovery plans with YouTube learning resources.
                </p>
                <Button
                  className="gradient-primary text-primary-foreground text-xs"
                  onClick={handleAIRecovery}
                  disabled={aiLoading}
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Brain className="w-3.5 h-3.5 mr-1" />}
                  {aiLoading ? 'Analyzing...' : 'Generate Recovery Plan'}
                </Button>

                {aiRecovery && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-border">
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">📚 Study Strategies</h4>
                      <ul className="space-y-1">
                        {aiRecovery.strategies.map((s, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-accent mt-0.5">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">🎥 YouTube Resources</h4>
                      <div className="space-y-1">
                        {aiRecovery.youtubeQueries.map((q, i) => (
                          <a
                            key={i}
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> {q}
                          </a>
                        ))}
                      </div>
                    </div>
                    {aiRecovery.motivation && (
                      <div className="bg-accent/10 rounded-lg p-3">
                        <p className="text-xs text-foreground italic">💡 {aiRecovery.motivation}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={(open) => { setShowUpload(open); if (!open) { setSelectedFile(null); setUploadForm({ title: '', description: '' }); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-accent" /> Upload Study Material
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Title</label>
              <Input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Unit 3 Notes" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Input value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">File (PDF, PPT, Image)</label>
              <Input type="file" accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp" onChange={handleFileSelect} disabled={uploading} />
              {selectedFile && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground text-xs"
              onClick={handleUploadSubmit}
              disabled={uploading || !uploadForm.title.trim() || !selectedFile}
            >
              {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Uploading...</> : <><Upload className="w-3.5 h-3.5 mr-1" /> Upload Material</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffSubjectPage;
