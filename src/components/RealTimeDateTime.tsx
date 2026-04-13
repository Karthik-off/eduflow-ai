import React, { useState, useEffect } from 'react';

const RealTimeDateTime: React.FC = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };

    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="text-center">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {formatDateTime(dateTime)}
      </div>
    </div>
  );
};

export default RealTimeDateTime;
