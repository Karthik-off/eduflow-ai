import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, User } from 'lucide-react';

interface TimetableEntry {
  id: string;
  subject: string;
  professor: string;
  room: string;
  startTime: string;
  endTime: string;
  isOngoing?: boolean;
}

interface TodayTimetableProps {
  entries: TimetableEntry[];
}

const TodayTimetable = ({ entries }: TodayTimetableProps) => {
  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No classes today</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-xl border transition-all ${
                entry.isOngoing
                  ? 'border-primary/30 bg-primary/5 shadow-sm'
                  : 'border-transparent bg-secondary/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-foreground">{entry.subject}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {entry.professor}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {entry.room}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3" />
                  {entry.startTime}–{entry.endTime}
                </div>
              </div>
              {entry.isOngoing && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary">Ongoing</span>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TodayTimetable;
