
import React, { useState, useEffect } from 'react';

interface TimerProps {
  startTime: number;
  durationMs: number;
  onFinish: () => void;
}

const Timer: React.FC<TimerProps> = ({ startTime, durationMs, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, durationMs - elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        onFinish();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMs, onFinish]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="bg-zalo-blue text-white rounded-2xl p-4 shadow-inner flex flex-col items-center justify-center">
      <span className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">Thời gian bình chọn</span>
      <div className="text-4xl font-mono font-bold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};

export default Timer;
