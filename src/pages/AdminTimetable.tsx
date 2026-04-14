import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  MapPin,
  Users,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { toast } from 'sonner';

interface TimetableEntry {
  id: string;
  subject: string;
  class_name: string;
  faculty: string;
  room: string;
  day: string;
  time_start: string;
  time_end: string;
  department: string;
  semester: string;
  status: 'scheduled' | 'cancelled' | 'rescheduled';
  created_at: string;
}

const AdminTimetable = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useDarkMode();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'cancelled' | 'rescheduled'>('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  // Mock data for demonstration
  const mockTimetable: TimetableEntry[] = [
    {
      id: '1',
      subject: 'Data Structures',
      class_name: 'CS301-A',
      faculty: 'John Smith',
      room: 'Lab 301',
      day: 'Monday',
      time_start: '09:00',
      time_end: '10:30',
      department: 'Computer Science',
      semester: '3rd',
      status: 'scheduled',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      subject: 'Web Development',
      class_name: 'CS302-B',
      faculty: 'Sarah Johnson',
      room: 'Lab 302',
      day: 'Tuesday',
      time_start: '14:00',
      time_end: '15:30',
      department: 'Computer Science',
      semester: '3rd',
      status: 'scheduled',
      created_at: '2024-01-15'
    },
    {
      id: '3',
      subject: 'Calculus III',
      class_name: 'MATH201-A',
      faculty: 'Michael Brown',
      room: 'Room 101',
      day: 'Wednesday',
      time_start: '11:00',
      time_end: '12:30',
      department: 'Mathematics',
      semester: '2nd',
      status: 'scheduled',
      created_at: '2024-01-20'
    },
    {
      id: '4',
      subject: 'Quantum Mechanics',
      class_name: 'PHY401-A',
      faculty: 'Emily Davis',
      room: 'Room 201',
      day: 'Thursday',
      time_start: '10:00',
      time_end: '11:30',
      department: 'Physics',
      semester: '4th',
      status: 'cancelled',
      created_at: '2024-01-10'
    },
    {
      id: '5',
      subject: 'Database Systems',
      class_name: 'CS303-A',
      faculty: 'John Smith',
      room: 'Lab 303',
      day: 'Friday',
      time_start: '14:00',
      time_end: '15:30',
      department: 'Computer Science',
      semester: '3rd',
      status: 'rescheduled',
      created_at: '2023-08-15'
    },
    {
      id: '6',
      subject: 'Algorithms',
      class_name: 'CS301-A',
      faculty: 'John Smith',
      room: 'Lab 301',
      day: 'Monday',
      time_start: '14:00',
      time_end: '15:30',
      department: 'Computer Science',
      semester: '3rd',
      status: 'scheduled',
      created_at: '2024-01-15'
    },
    {
      id: '7',
      subject: 'React Development',
      class_name: 'CS302-B',
      faculty: 'Sarah Johnson',
      room: 'Lab 302',
      day: 'Thursday',
      time_start: '09:00',
      time_end: '10:30',
      department: 'Computer Science',
      semester: '3rd',
      status: 'scheduled',
      created_at: '2024-01-15'
    },
    {
      id: '8',
      subject: 'Vector Analysis',
      class_name: 'MATH201-A',
      faculty: 'Michael Brown',
      room: 'Room 101',
      day: 'Friday',
      time_start: '09:00',
      time_end: '10:30',
      department: 'Mathematics',
      semester: '2nd',
      status: 'scheduled',
      created_at: '2024-01-20'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setTimetable(mockTimetable);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTimetable = timetable.filter(entry => {
    const matchesSearch = entry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || entry.department === filterDepartment;
    const matchesDay = filterDay === 'all' || entry.day === filterDay;
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesDay && matchesStatus;
  });

  const departments = Array.from(new Set(timetable.map(entry => entry.department)));
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to remove this timetable entry?')) {
      setTimetable(timetable.filter(entry => entry.id !== entryId));
      toast.success('Timetable entry removed successfully');
    }
  };

  const handleToggleStatus = (entryId: string) => {
    const statusFlow = ['scheduled', 'cancelled', 'rescheduled'] as const;
    setTimetable(timetable.map(entry => {
      if (entry.id === entryId) {
        const currentIndex = statusFlow.indexOf(entry.status);
        const nextIndex = (currentIndex + 1) % statusFlow.length;
        return { ...entry, status: statusFlow[nextIndex] };
      }
      return entry;
    }));
    toast.success('Entry status updated successfully');
  };

  const exportTimetableData = () => {
    const csvContent = [
      ['Subject', 'Class', 'Faculty', 'Room', 'Day', 'Start Time', 'End Time', 'Department', 'Semester', 'Status'],
      ...filteredTimetable.map(entry => [
        entry.subject,
        entry.class_name,
        entry.faculty,
        entry.room,
        entry.day,
        entry.time_start,
        entry.time_end,
        entry.department,
        entry.semester,
        entry.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Timetable data exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      case 'rescheduled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const groupByTimeSlot = (entries: TimetableEntry[]) => {
    const grouped: { [key: string]: TimetableEntry[] } = {};
    entries.forEach(entry => {
      const slot = `${entry.day}-${entry.time_start}`;
      if (!grouped[slot]) {
        grouped[slot] = [];
      }
      grouped[slot].push(entry);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const groupedEntries = groupByTimeSlot(filteredTimetable);

  return (
    <AdminLayout title="Timetable Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              Timetable Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage class schedules and time allocations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTimetableData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{timetable.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-green-600">
                  {timetable.filter(t => t.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {timetable.filter(t => t.status === 'cancelled').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by subject, class, faculty, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Days</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable View */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule ({filteredTimetable.length} classes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 border bg-muted">Time</th>
                  {days.map(day => (
                    <th key={day} className="text-center p-3 border bg-muted min-w-[150px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                  <tr key={time} className="border-b">
                    <td className="p-3 border bg-muted font-medium">{time}</td>
                    {days.map(day => {
                      const entries = filteredTimetable.filter(entry => 
                        entry.day === day && 
                        getTimeSlot(entry.time_start) >= getTimeSlot(time) &&
                        getTimeSlot(entry.time_start) < getTimeSlot(time) + 60
                      );
                      
                      return (
                        <td key={`${day}-${time}`} className="p-2 border align-top">
                          {entries.map(entry => (
                            <div
                              key={entry.id}
                              className={`mb-2 p-2 rounded-lg text-xs ${getStatusColor(entry.status)} ${
                                entry.status === 'cancelled' ? 'opacity-60 line-through' : ''
                              }`}
                            >
                              <div className="font-semibold">{entry.subject}</div>
                              <div className="text-xs opacity-90">{entry.class_name}</div>
                              <div className="text-xs opacity-90">{entry.faculty}</div>
                              <div className="text-xs opacity-90 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {entry.room}
                              </div>
                              <div className="text-xs opacity-90 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {entry.time_start} - {entry.time_end}
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* List View */}
      <Card>
        <CardHeader>
          <CardTitle>All Schedule Entries ({filteredTimetable.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Subject</th>
                  <th className="text-left p-4">Class</th>
                  <th className="text-left p-4">Faculty</th>
                  <th className="text-left p-4">Room</th>
                  <th className="text-left p-4">Day</th>
                  <th className="text-left p-4">Time</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimetable.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{entry.subject}</td>
                    <td className="p-4">
                      <Badge variant="outline">{entry.class_name}</Badge>
                    </td>
                    <td className="p-4">{entry.faculty}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{entry.room}</span>
                      </div>
                    </td>
                    <td className="p-4">{entry.day}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{entry.time_start} - {entry.time_end}</span>
                      </div>
                    </td>
                    <td className="p-4">{entry.department}</td>
                    <td className="p-4">
                      <Badge 
                        variant="outline"
                        className={getStatusColor(entry.status)}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(entry.status)}
                          {entry.status}
                        </div>
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(entry.id)}
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
};

export default AdminTimetable;
