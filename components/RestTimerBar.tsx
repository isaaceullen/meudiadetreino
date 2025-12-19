
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface RestTimerBarProps {
  initialSeconds: number;
  isVisible: boolean;
  onClose: () => void;
}

export const RestTimerBar: React.FC<RestTimerBarProps> = ({ initialSeconds, isVisible, onClose }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isVisible) setSeconds(initialSeconds);
  }, [isVisible, initialSeconds]);

  useEffect(() => {
    let interval: any;
    if (isActive && isVisible && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, isVisible, seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-lg mx-auto bg-zinc-900/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl rounded-3xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Descanso</span>
            <span className={`text-3xl font-mono font-black ${seconds === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 flex-1 justify-center px-4 overflow-x-auto no-scrollbar">
          {[15, 30, 60, 90].map(val => (
            <button
              key={val}
              onClick={() => { setSeconds(val); setIsActive(true); }}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black px-3 py-2.5 rounded-xl transition-all border border-zinc-700 active:scale-90"
            >
              {val < 60 ? `${val}s` : `${Math.floor(val/60)}m${val%60 || ''}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="p-2 text-zinc-400"
          >
            {isActive ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
