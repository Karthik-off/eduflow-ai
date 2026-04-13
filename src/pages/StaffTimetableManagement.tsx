import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
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
  Users,
  BookOpen,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface TimetableEntry {
  id: string;
  subject_id: string;
  section_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  created_at: string;
  subject?: {
    name: string;
    code: string;
  };
  section?: {
    name: string;
  };
}

interface FormData {
  subject_id: string;
  section_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
}

const StaffTimetableManagement = () => {
  const { staffProfile } = useAuthStore();
  const navigate = useNavigate();
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const subjects = [
    { id: 'cs101', name: 'Computer Science Fundamentals', code: 'CS101' },
    { id: 'cs102', name: 'Data Structures', code: 'CS102' },
    { id: 'cs103', name: 'Algorithms', code: 'CS103' },
    { id: 'math101', name: 'Mathematics I', code: 'MATH101' },
    { id: 'phy101', name: 'Physics I', code: 'PHY101' },
    { id: 'chem101', name: 'Chemistry I', code: 'CHEM101' }
  ];

  const sections = [
    { id: 'section-1', name: 'CS-A' },
    { id: 'section-2', name: 'CS-B' },
    { id: 'section-3', name: 'IT-A' },
    { id: 'section-4', name: 'IT-B' }
  ];

  const rooms = [
    'Room 101', 'Room 102', 'Room 103', 'Room 201', 
    'Room 202', 'Room 203', 'Lab 1', 'Lab 2'
  ];

  useEffect(() => {
    fetchTimetableEntries();
  }, []);

  useEffect(() => {
    let filtered = timetableEntries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.section?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.room?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDay !== 'all') {
      filtered = filtered.filter(entry => entry.day_of_week === selectedDay);
    }

    if (selectedSection !== 'all') {
      filtered = filtered.filter(entry => entry.section_id === selectedSection);
    }

    setFilteredEntries(filtered);
  }, [timetableEntries, searchTerm, selectedDay, selectedSection]);

  const fetchTimetableEntries = async () => {
    try {
      setLoading(true);
      const { data: entriesData, error } = await supabase
        .from('timetable_entries')
        .select(`
          id, subject_id, section_id, day_of_week, start_time, end_time, room, created_at,
          subjects!timetable_entries_subject_id_fkey (name, code),
          sections!timetable_entries_section_id_fkey (name)
        `)
        .order('day_of_week, start_time');

      if (error) throw error;

      setTimetableEntries(entriesData || []);
    } catch (error) {
      toast.error('Failed to fetch timetable entries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    try {
      if (!formData.subject_id || !formData.section_id || !formData.day_of_week || !formData.start_time || !formData.end_time || !formData.room) {
        toast.error('All fields are required');
        return;
      }

      const { error } = await supabase
        .from('timetable_entries')
        .insert({
          subject_id: formData.subject_id,
          section_id: formData.section_id,
          day_of_week: formData.day_of_week,
          start_time: formData.start_time,
          end_time: formData.end_time,
          room: formData.room,
          created_by: staffProfile?.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Timetable entry added successfully');
      setShowAddModal(false);
      setFormData({});
      fetchTimetableEntries();
    } catch (error) {
      toast.error('Failed to add timetable entry');
    }
  };

  const handleUpdateEntry = async () => {
    try {
      if (!selectedEntry || !formData.subject_id || !formData.section_id || !formData.day_of_week || !formData.start_time || !formData.end_time || !formData.room) {
        toast.error('All fields are required');
        return;
      }

      const { error } = await supabase
        .from('timetable_entries')
        .update({
          subject_id: formData.subject_id,
          section_id: formData.section_id,
          day_of_week: formData.day_of_week,
          start_time: formData.start_time,
          end_time: formData.end_time,
          room: formData.room
        })
        .eq('id', selectedEntry.id);

      if (error) throw error;

      toast.success('Timetable entry updated successfully');
      setShowEditModal(false);
      setSelectedEntry(null);
      setFormData({});
      fetchTimetableEntries();
    } catch (error) {
      toast.error('Failed to update timetable entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;

    try {
      const { error } = await supabase
        .from('timetable_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Timetable entry deleted successfully');
      fetchTimetableEntries();
    } catch (error) {
      toast.error('Failed to delete timetable entry');
    }
  };

  const openEditModal = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setFormData({
      subject_id: entry.subject_id,
      section_id: entry.section_id,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      room: entry.room
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({});
    setSelectedEntry(null);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const getDayColor = (dayOfWeek: number) => {
    const colors = ['bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-orange-100', 'bg-purple-100', 'bg-pink-100'];
    return colors[dayOfWeek] || 'bg-gray-100';
  };

  const getConflictStatus = (entry: TimetableEntry) => {
    const conflicts = filteredEntries.filter(e => 
      e.id !== entry.id &&
      e.day_of_week === entry.day_of_week &&
      ((e.start_time >= entry.start_time && e.start_time < entry.end_time) ||
       (e.end_time > entry.start_time && e.end_time <= entry.end_time) ||
       (e.start_time <= entry.start_time && e.end_time >= entry.end_time))
    );
    return conflicts.length > 0;
  };

  const generateWeeklyView = () => {
    const weeklySchedule = [];
    
    for (let day = 0; day < 7; day++) {
      const dayEntries = filteredEntries.filter(entry => entry.day_of_week === day);
      const timeSlots = [];
      
      // Generate time slots from 8:00 AM to 6:00 PM
      for (let hour = 8; hour <= 18; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const slotEntry = dayEntries.find(entry => 
          entry.start_time <= timeStr && entry.end_time > timeStr
        );
        
        timeSlots.push({
          time: timeStr,
          entry: slotEntry || null
        });
      }
      
      weeklySchedule.push({
        day,
        dayName: daysOfWeek[day].label,
        timeSlots
      });
    }
    
    return weeklySchedule;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Clock className="w-4 h-4 text-accent-foreground" />
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
                <Clock className="w-4 h-4 text-primary" />
                Timetable Management
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by subject, section, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={selectedDay} onValueChange={(value) => setSelectedDay(value === 'all' ? 'all' : parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule View */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-2 text-left font-medium">Time</th>
                    {daysOfWeek.map(day => (
                      <th key={day.value} className={`border border-border p-2 text-center font-medium ${getDayColor(day.value)}`}>
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 11 }, (_, hourIndex) => {
                    const hour = hourIndex + 8;
                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                    
                    return (
                      <tr key={hourIndex}>
                        <td className="border border-border p-2 font-medium text-sm">
                          {timeStr}
                        </td>
                        {daysOfWeek.map(day => {
                          const entry = filteredEntries.find(e => 
                            e.day_of_week === day.value &&
                            e.start_time <= timeStr &&
                            e.end_time > timeStr
                          );
                          
                          return (
                            <td key={day.value} className="border border-border p-2 align-top">
                              {entry ? (
                                <div className={`p-2 rounded text-xs ${
                                  getConflictStatus(entry) ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'
                                }`}>
                                  <div className="font-medium">{entry.subject?.name}</div>
                                  <div className="text-muted-foreground">{entry.room}</div>
                                  <div className="text-xs">
                                    {entry.start_time} - {entry.end_time}
                                  </div>
                                  {entry.section?.name && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {entry.section.name}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full min-h-[60px]"></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Entries List */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Timetable Entries ({filteredEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-foreground text-lg mb-2">No Timetable Entries Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or add new entries</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-4">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className={`flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      getConflictStatus(entry) ? 'border-red-200 bg-red-50' : 'border-border'
                    }`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{entry.subject?.name}</p>
                            <p className="text-sm text-muted-foreground">{entry.subject?.code}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">
                                {daysOfWeek[entry.day_of_week]?.label || 'Unknown'}
                              </Badge>
                              <Badge variant="outline">
                                {entry.section?.name || 'Unknown'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {entry.start_time} - {entry.end_time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {entry.room}
                          </div>
                        </div>
                        {getConflictStatus(entry) && (
                          <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                            <AlertCircle className="w-4 h-4" />
                            Time conflict detected
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEntry(entry.id)}
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

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Timetable Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject *</label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Section *</label>
                  <Select value={formData.section_id} onValueChange={(value) => setFormData(prev => ({ ...prev, section_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Day *</label>
                  <Select value={formData.day_of_week?.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Room *</label>
                  <Select value={formData.room} onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map(room => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Time *</label>
                  <Input
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Time *</label>
                  <Input
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditModal && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Timetable Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Section</label>
                  <Select value={formData.section_id} onValueChange={(value) => setFormData(prev => ({ ...prev, section_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Day</label>
                  <Select value={formData.day_of_week?.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Room</label>
                  <Select value={formData.room} onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map(room => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Time</label>
                  <Input
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Time</label>
                  <Input
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateEntry}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffTimetableManagement;
