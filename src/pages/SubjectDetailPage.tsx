import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, Eye, Calendar, FolderOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
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

const SubjectDetailPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;

      // Fetch subject info
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('id, name, code, credits')
        .eq('id', subjectId)
        .single();

      if (subjectData) setSubject(subjectData as Subject);

      // Fetch study materials
      const { data: materialsData } = await supabase
        .from('study_materials')
        .select('id, title, description, file_path, file_type, file_size, created_at')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      setMaterials((materialsData as StudyMaterial[]) ?? []);
      setLoading(false);
    };
    fetchData();
  }, [subjectId]);

  const getSignedUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('study-materials')
      .createSignedUrl(filePath, 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  };

  const handleView = async (filePath: string) => {
    const url = await getSignedUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Failed to open file');
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    setDownloading(material.id);
    try {
      const { data, error } = await supabase.storage
        .from('study-materials')
        .download(material.file_path);
      if (error || !data) throw error || new Error('No data');
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${material.title}.${material.file_type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Failed to download file');
    }
    setDownloading(null);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <UnifiedLayout userRole="student" title={subject?.name || "Subject Details"}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <button onClick={() => navigate('/academics')} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold font-display text-foreground truncate">
              {subject?.name ?? 'Loading...'}
            </h2>
            {subject && (
              <p className="text-xs text-muted-foreground">{subject.code} • {subject.credits} Credits</p>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Materials Section */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold font-display text-foreground flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            Study Materials
          </h3>
          <p className="text-xs text-muted-foreground">PDFs and documents for this subject</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : materials.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No study materials uploaded yet.</p>
              <p className="text-muted-foreground text-xs mt-1">Check back later for updates from your professor.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {materials.map((material) => (
              <Card key={material.id} className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">{material.title}</h4>
                      {material.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{material.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <span className="uppercase font-medium">{material.file_type}</span>
                        {material.file_size && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(material.file_size)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(material.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 ml-13">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 text-xs"
                      onClick={() => handleView(material.file_path)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-9 text-xs gradient-primary text-primary-foreground"
                      disabled={downloading === material.id}
                      onClick={() => handleDownload(material)}
                    >
                      {downloading === material.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <Download className="w-3.5 h-3.5 mr-1" />
                      )}
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </UnifiedLayout>
  );
};

export default SubjectDetailPage;
