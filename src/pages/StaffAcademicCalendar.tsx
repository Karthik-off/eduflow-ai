// @ts-nocheck
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
  Calendar, 
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
  Clock,
  MapPin,
  Users,
  BookOpen,
  Coffee,
  Gift,
  GraduationCap,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  type: 'holiday' | 'exam' | 'event' | 'meeting' | 'deadline' | 'class' | 'workshop';
  is_holiday?: boolean;
  is_recurring?: boolean;
  color?: string;
  created_at: string;
}

const StaffAcademicCalendar = () => {
  const { staffProfile } = useAuthStore();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({});

  const eventTypes = [
    { value: 'all', label: 'All Events', color: 'bg-gray-100' },
    { value: 'holiday', label: 'Holidays', color: 'bg-red-100' },
    { value: 'exam', label: 'Exams', color: 'bg-orange-100' },
    { value: 'event', label: 'Events', color: 'bg-blue-100' },
    { value: 'meeting', label: 'Meetings', color: 'bg-green-100' },
    { value: 'deadline', label: 'Deadlines', color: 'bg-purple-100' },
    { value: 'class', label: 'Classes', color: 'bg-yellow-100' },
    { value: 'workshop', label: 'Workshops', color: 'bg-pink-100' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // Filter by selected month and year
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedType, selectedMonth, selectedYear]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data: eventsData, error } = await supabase
        .from('academic_calendar')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      setEvents(eventsData || []);
    } catch (error) {
      toast.error('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    try {
      if (!formData.title || !formData.date) {
        toast.error('Title and date are required');
        return;
      }

      const { error } = await supabase
        .from('academic_calendar')
        .insert({
          title: formData.title,
          description: formData.description || '',
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location || '',
          type: formData.type || 'event',
          is_holiday: formData.type === 'holiday',
          is_recurring: formData.is_recurring || false,
          color: getEventColor(formData.type || 'event'),
          created_by: staffProfile?.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Event added successfully');
      setShowAddModal(false);
      setFormData({});
      fetchEvents();
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const handleUpdateEvent = async () => {
    try {
      if (!selectedEvent || !formData.title || !formData.date) {
        toast.error('Title and date are required');
        return;
      }

      const { error } = await supabase
        .from('academic_calendar')
        .update({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location,
          type: formData.type,
          is_holiday: formData.type === 'holiday',
          is_recurring: formData.is_recurring,
          color: getEventColor(formData.type)
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast.success('Event updated successfully');
      setShowEditModal(false);
      setSelectedEvent(null);
      setFormData({});
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('academic_calendar')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const getEventColor = (type: string): string => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || 'bg-blue-100';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday': return <Coffee className="w-4 h-4" />;
      case 'exam': return <Award className="w-4 h-4" />;
      case 'event': return <Gift className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'deadline': return <AlertCircle className="w-4 h-4" />;
      case 'class': return <BookOpen className="w-4 h-4" />;
      case 'workshop': return <GraduationCap className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const openEditModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      type: event.type,
      is_holiday: event.is_holiday,
      is_recurring: event.is_recurring
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({});
    setSelectedEvent(null);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date: string) => {
    return filteredEvents.filter(event => event.date === date);
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date: dateStr,
        events: getEventsForDate(dateStr),
        isToday: new Date().toDateString() === new Date(selectedYear, selectedMonth, day).toDateString()
      });
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent-foreground" />
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
                <Calendar className="w-4 h-4 text-primary" />
                Academic Calendar
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedYear} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-center">
              {months[selectedMonth]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((dayData, index) => (
                <div
                  key={index}
                  className={`min-h-[80px] border rounded-lg p-2 ${
                    dayData?.isToday ? 'bg-primary/10 border-primary/30' : 'bg-background border-border'
                  } ${!dayData ? 'bg-muted/30' : ''}`}
                >
                  {dayData && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${dayData.isToday ? 'text-primary' : ''}`}>
                          {dayData.day}
                        </span>
                        {dayData.events.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {dayData.events.length}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayData.events.slice(0, 2).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className={`text-xs p-1 rounded ${getEventColor(event.type)} cursor-pointer hover:opacity-80`}
                            onClick={() => openEditModal(event)}
                          >
                            <div className="flex items-center gap-1">
                              {getEventIcon(event.type)}
                              <span className="truncate">{event.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayData.events.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayData.events.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Upcoming Events ({filteredEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-foreground text-lg mb-2">No Events Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or add new events</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-4">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                            {event.start_time && event.end_time && (
                              <p className="text-xs text-muted-foreground">
                                {event.start_time} - {event.end_time}
                              </p>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEvent(event.id)}
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

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter event description"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date *</label>
                  <Input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.filter(t => t.value !== 'all').map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter event description"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date *</label>
                  <Input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.filter(t => t.value !== 'all').map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateEvent}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffAcademicCalendar;
