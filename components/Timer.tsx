
import React, { useState, useEffect, useCallback } from 'react';
import { Timer as TimerIcon, X, Play, Pause, RefreshCw } from 'lucide-react';

interface TimerProps {
  initialSeconds: number;
  onClose: () => void;
}

export const Timer: React.FC<TimerProps> = ({ initialSeconds, onClose }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      if (isActive) {
        // Simple notification/beep logic could go here
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        setIsActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setSeconds(initialSeconds);
    setIsActive(true);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${seconds === 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`}>
          <TimerIcon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-zinc-400 font-medium">Descanso</p>
          <p className={`text-2xl font-bold font-mono ${seconds === 0 ? 'text-red-500' : 'text-white'}`}>
            {formatTime(seconds)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button onClick={resetTimer} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <RefreshCw size={20} />
        </button>
        <button onClick={toggleTimer} className="p-3 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition-colors">
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-300">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
