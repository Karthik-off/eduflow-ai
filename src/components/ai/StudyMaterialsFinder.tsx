import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  ExternalLink,
  Star,
  Clock,
  Users,
  Filter,
  ChevronRight
} from 'lucide-react';

interface StudyMaterial {
  id: string;
  title: string;
  type: 'video' | 'article' | 'book' | 'notes' | 'practice' | 'course';
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  rating: number;
  downloads?: number;
  description: string;
  url?: string;
  tags: string[];
  author?: string;
}

const StudyMaterialsFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const subjects = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 
    'Biology', 'Engineering', 'Business', 'Literature'
  ];

  const materials: StudyMaterial[] = [
    {
      id: '1',
      title: 'Introduction to Data Structures',
      type: 'video',
      subject: 'Computer Science',
      difficulty: 'beginner',
      duration: '45 min',
      rating: 4.8,
      downloads: 1250,
      description: 'Comprehensive introduction to arrays, linked lists, stacks, and queues with practical examples.',
      tags: ['algorithms', 'programming', 'fundamentals'],
      author: 'Prof. Smith'
    },
    {
      id: '2',
      title: 'Calculus Fundamentals',
      type: 'book',
      subject: 'Mathematics',
      difficulty: 'intermediate',
      rating: 4.6,
      downloads: 890,
      description: 'Complete guide to differential and integral calculus with solved problems.',
      tags: ['math', 'calculus', 'problem-solving'],
      author: 'Dr. Johnson'
    },
    {
      id: '3',
      title: 'Organic Chemistry Notes',
      type: 'notes',
      subject: 'Chemistry',
      difficulty: 'intermediate',
      rating: 4.7,
      downloads: 650,
      description: 'Detailed notes on organic reactions, mechanisms, and synthesis strategies.',
      tags: ['chemistry', 'organic', 'reactions']
    },
    {
      id: '4',
      title: 'Physics Problem Set',
      type: 'practice',
      subject: 'Physics',
      difficulty: 'advanced',
      rating: 4.9,
      downloads: 2100,
      description: 'Challenging problems in mechanics, electromagnetism, and thermodynamics with solutions.',
      tags: ['physics', 'problems', 'solutions']
    },
    {
      id: '5',
      title: 'Web Development Course',
      type: 'course',
      subject: 'Computer Science',
      difficulty: 'beginner',
      duration: '8 weeks',
      rating: 4.5,
      downloads: 3200,
      description: 'Complete web development course covering HTML, CSS, JavaScript, and React.',
      tags: ['web', 'programming', 'frontend'],
      author: 'Tech Academy'
    },
    {
      id: '6',
      title: 'Business Strategy Article',
      type: 'article',
      subject: 'Business',
      difficulty: 'intermediate',
      rating: 4.4,
      downloads: 450,
      description: 'Analysis of modern business strategies and case studies from successful companies.',
      tags: ['business', 'strategy', 'management']
    }
  ];

  const getTypeIcon = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'book': return <BookOpen className="w-4 h-4" />;
      case 'notes': return <FileText className="w-4 h-4" />;
      case 'practice': return <FileText className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'book': return 'bg-blue-100 text-blue-800';
      case 'notes': return 'bg-green-100 text-green-800';
      case 'practice': return 'bg-purple-100 text-purple-800';
      case 'course': return 'bg-orange-100 text-orange-800';
      case 'article': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: StudyMaterial['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject;
    const matchesType = selectedType === 'all' || material.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || material.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesType && matchesDifficulty;
  });

  const handleDownload = (materialId: string) => {
    console.log('Downloading material:', materialId);
    // In a real app, this would trigger actual download
  };

  const handleOpenLink = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Study Materials Finder
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search materials, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="video">Videos</option>
              <option value="book">Books</option>
              <option value="notes">Notes</option>
              <option value="practice">Practice</option>
              <option value="course">Courses</option>
              <option value="article">Articles</option>
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {filteredMaterials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No materials found matching your criteria.</p>
                <p className="text-sm">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(material.type)}`}>
                        {getTypeIcon(material.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm leading-tight truncate">
                              {material.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {material.description}
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(material.id)}
                              className="h-8 px-2"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            {material.url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenLink(material.url)}
                                className="h-8 px-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {material.subject}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(material.difficulty)}`}>
                            {material.difficulty}
                          </Badge>
                          {material.duration && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {material.duration}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {material.rating}
                          </div>
                          {material.downloads && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Download className="w-3 h-3" />
                              {material.downloads}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {material.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {material.author && (
                          <p className="text-xs text-muted-foreground mt-2">
                            By {material.author}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StudyMaterialsFinder;
