
import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, X, RotateCcw, Plus, Minus } from 'lucide-react';

interface RestTimerProps {
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ onClose }) => {
  const [seconds, setSeconds] = useState(60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      if ('vibrate' in navigator) navigator.vibrate([500, 200, 500]);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  const addTime = (s: number) => setSeconds(prev => prev + s);

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 z-50">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <TimerIcon className="text-blue-500" size={20} />
          <span className="font-bold text-zinc-400 uppercase text-xs tracking-widest">Descanso</span>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
      </div>

      <div className="text-center mb-8">
        <h2 className={`text-6xl font-mono font-bold ${seconds === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {formatTime(seconds)}
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {[15, 30, 60, 90].map(val => (
          <button 
            key={val}
            onClick={() => setSeconds(val)}
            className="bg-zinc-800 py-3 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors"
          >
            {val >= 60 ? `${val/60}m${val%60 || ''}` : `${val}s`}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-zinc-800 text-zinc-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'}`}
        >
          {isActive ? 'Pausar' : 'Retomar'}
        </button>
        <button 
          onClick={() => { setSeconds(60); setIsActive(true); }}
          className="bg-zinc-800 p-4 rounded-2xl text-white"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
};
