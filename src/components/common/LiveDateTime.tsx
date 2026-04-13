import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface LiveDateTimeProps {
  className?: string;
  showDate?: boolean;
  showTime?: boolean;
  showDay?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

const LiveDateTime = ({ 
  className = '', 
  showDate = true, 
  showTime = true, 
  showDay = true,
  variant = 'default' 
}: LiveDateTimeProps) => {
  const [dateTime, setDateTime] = useState({
    date: '',
    day: '',
    time: '',
    fullDateTime: ''
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format options
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };

      const dayOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long'
      };

      const date = now.toLocaleDateString('en-US', dateOptions);
      const time = now.toLocaleTimeString('en-US', timeOptions);
      const day = now.toLocaleDateString('en-US', dayOptions);
      const fullDateTime = now.toLocaleString('en-US', {
        ...dateOptions,
        ...timeOptions
      });

      setDateTime({
        date,
        day,
        time,
        fullDateTime
      });
    };

    // Update immediately
    updateDateTime();
    
    // Update every second for time
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className="flex items-center gap-2 text-sm">
            {showDate && <span className="font-medium">{dateTime.date}</span>}
            {showTime && <span className="text-muted-foreground">{dateTime.time}</span>}
          </div>
        );
      
      case 'minimal':
        return (
          <div className="flex items-center gap-2 text-sm">
            {showDate && <span>{new Date().toLocaleDateString()}</span>}
            {showTime && <span className="font-mono">{dateTime.time}</span>}
          </div>
        );
      
      default:
        return (
          <div className="space-y-1">
            {showDay && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{dateTime.day}</span>
              </div>
            )}
            {showDate && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{dateTime.date}</span>
              </div>
            )}
            {showTime && (
              <div className="flex items-center gap-2 text-sm font-mono text-primary">
                <Clock className="w-4 h-4" />
                <span>{dateTime.time}</span>
              </div>
            )}
          </div>
        );
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center ${className}`}>
        {renderContent()}
      </div>
    );
  }

  return (
    <Card className={`shadow-sm border ${className}`}>
      <CardContent className="p-3">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default LiveDateTime;
