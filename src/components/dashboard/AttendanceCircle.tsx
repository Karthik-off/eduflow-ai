interface AttendanceCircleProps {
  percentage: number;
  size?: number;
}

const AttendanceCircle = ({ percentage, size = 120 }: AttendanceCircleProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage < 75) return 'hsl(var(--destructive))';
    if (percentage < 85) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-display text-foreground">{percentage}%</span>
        <span className="text-xs text-muted-foreground">Attendance</span>
      </div>
    </div>
  );
};

export default AttendanceCircle;
