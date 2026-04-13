import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, BookOpen, CreditCard, Bell } from 'lucide-react';

interface QuickStatsProps {
  cgpa: number;
  totalSubjects: number;
  pendingFees: number;
  notifications: number;
}

const QuickStats = ({ cgpa, totalSubjects, pendingFees, notifications }: QuickStatsProps) => {
  const stats = [
    { label: 'CGPA', value: cgpa.toFixed(2), icon: TrendingUp, color: 'text-primary' },
    { label: 'Subjects', value: totalSubjects, icon: BookOpen, color: 'text-accent' },
    { label: 'Due Fees', value: `₹${pendingFees.toLocaleString()}`, icon: CreditCard, color: 'text-warning' },
    { label: 'Alerts', value: notifications, icon: Bell, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold font-display mt-1 text-foreground">{stat.value}</p>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;
