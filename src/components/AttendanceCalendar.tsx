import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/premium-ui/Card';
import { Button } from '@/components/premium-ui/Button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceCalendarProps {
  attendanceRecords: Array<{
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    check_in: string | null;
    check_out: string | null;
  }>;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ attendanceRecords }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get attendance status for a specific date
  const getAttendanceStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const record = attendanceRecords.find(r => r.date === dateStr);
    return record?.status || null;
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    navigate(`/attendance/${dateStr}`);
  };

  // Get status color
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      case 'excused': return 'bg-blue-500';
      default: return 'bg-gray-200';
    }
  };

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const status = getAttendanceStatus(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isFuture = date > new Date();

      days.push(
        <div
          key={day}
          className={cn(
            'h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 relative',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            isToday && 'ring-2 ring-blue-500',
            isFuture && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !isFuture && handleDateClick(date)}
        >
          <span className={cn(
            'text-sm font-medium',
            isToday && 'text-blue-600 dark:text-blue-400'
          )}>
            {day}
          </span>
          {status && (
            <div className={cn(
              'absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full',
              getStatusColor(status)
            )} />
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Attendance Calendar
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week days */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Excused</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
