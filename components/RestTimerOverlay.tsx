
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Plus } from 'lucide-react';

interface RestTimerOverlayProps {
  initialSeconds: number;
  onClose: () => void;
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({ initialSeconds, onClose }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  const setTime = (val: number) => {
    setSeconds(val);
    setIsActive(true);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#121214] border border-zinc-800 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <header className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/50">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Descanso</span>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-8 flex flex-col items-center">
          <div className="text-center mb-4">
            <h2 className={`text-7xl font-mono font-black ${seconds === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {formatTime(seconds)}
            </h2>
            <p className="text-zinc-500 text-xs font-bold mt-2">Descansando...</p>
          </div>

          <div className="flex gap-2 w-full justify-center mb-10 overflow-x-auto no-scrollbar py-2">
            {[15, 30, 60, 90, 120].map(val => (
              <button 
                key={val}
                onClick={() => setTime(val)}
                className="bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-[10px] font-black px-4 py-3 rounded-xl hover:bg-zinc-700 transition-all active:scale-90"
              >
                {val < 60 ? `${val}s` : `${val / 60}${val % 60 === 30 ? '.5' : ''}m`}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between w-full px-4">
            <button 
              onClick={() => setSeconds(s => s + 10)}
              className="text-zinc-400 font-bold text-sm flex items-center gap-1 active:scale-90 transition-all"
            >
              <Plus size={16} /> 10s
            </button>

            <button 
              onClick={() => setIsActive(!isActive)}
              className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>

            <button 
              onClick={() => { setSeconds(initialSeconds); setIsActive(true); }}
              className="text-zinc-400 font-bold text-sm flex items-center gap-2 active:scale-90 transition-all"
            >
              <RotateCcw size={16} /> Resetar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
