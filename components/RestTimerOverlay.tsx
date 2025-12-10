import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDuration?: number; // in seconds
}

// Som de notificação confiável (Beep curto)
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const RestTimerOverlay: React.FC<RestTimerProps> = ({ isOpen, onClose, defaultDuration = 60 }) => {
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isActive, setIsActive] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Inicialização do Áudio e Pré-carregamento
  useEffect(() => {
    // Cria instância do áudio apenas uma vez
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.preload = 'auto'; // Tenta baixar o arquivo imediatamente
    audioRef.current.volume = 1.0;
  }, []);

  // Hack para iOS/Safari: Tenta desbloquear o áudio na interação
  const unlockAudioContext = () => {
    if (audioRef.current) {
      // Tenta tocar e pausar imediatamente apenas para ganhar permissão do browser
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        }).catch(() => {
          // Silenciosamente ignora se falhar aqui, pois é apenas uma tentativa de unlock
        });
      }
    }
  };

  // Reset timer when opened
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(defaultDuration);
      setIsActive(true);
      // Opcional: Tentar desbloquear ao abrir, embora navegadores estritos bloqueiem se não houver clique direto
      unlockAudioContext(); 
    }
  }, [isOpen, defaultDuration]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // --- Lógica de Finalização ---
      
      // 1. Tocar Áudio com tratamento de erro robusto
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
              playPromise.catch((error) => {
                  console.warn("Auto-play de áudio bloqueado pelo navegador:", error);
                  // Aqui poderíamos mostrar um Toast visual como fallback
              });
          }
      }

      // 2. Vibrar dispositivo (Mobile)
      if (navigator.vibrate) {
          try {
            navigator.vibrate([500, 200, 500]);
          } catch (e) {
            console.log("Vibração não suportada ou bloqueada");
          }
      }
      
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Wrappers para interações que também servem para desbloquear o áudio
  const handleInteraction = (callback: () => void) => {
    unlockAudioContext();
    callback();
  };

  const addTime = (seconds: number) => handleInteraction(() => setTimeLeft(prev => prev + seconds));
  const setTime = (seconds: number) => handleInteraction(() => {
    setTimeLeft(seconds);
    setIsActive(true);
  });
  const toggleTimer = () => handleInteraction(() => setIsActive(!isActive));
  const resetTimer = () => handleInteraction(() => setTime(defaultDuration));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center justify-end pointer-events-none pb-safe">
        {/* Main Timer Card */}
        <div className="w-full max-w-md pointer-events-auto mx-auto p-4 animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-surface/95 backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] overflow-hidden">
                
                {/* Header / Close */}
                <div className="flex justify-between items-center p-4 border-b border-white/5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Descanso</span>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-zinc-400">
                        <X size={18} />
                    </button>
                </div>

                {/* Timer Display */}
                <div className="flex flex-col items-center justify-center py-6 relative">
                    <div className={`text-6xl font-bold font-mono tracking-tighter tabular-nums mb-2 transition-colors ${timeLeft === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-zinc-400 font-medium">
                        {isActive ? 'Descansando...' : 'Tempo esgotado!'}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-5 gap-2 px-4 pb-4">
                    <Button variant="secondary" size="sm" className="px-1" onClick={() => setTime(15)}>15s</Button>
                    <Button variant="secondary" size="sm" className="px-1" onClick={() => setTime(30)}>30s</Button>
                    <Button variant="secondary" size="sm" className="px-1" onClick={() => setTime(60)}>1m</Button>
                    <Button variant="secondary" size="sm" className="px-1" onClick={() => setTime(90)}>1.5m</Button>
                    <Button variant="secondary" size="sm" className="px-1" onClick={() => setTime(120)}>2m</Button>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between bg-black/20 p-4">
                    <button onClick={() => addTime(10)} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5">
                        <Plus size={14} /> 10s
                    </button>
                    
                    <div className="flex gap-3">
                         <button 
                            onClick={toggleTimer}
                            className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40"
                        >
                            {isActive ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                        </button>
                    </div>

                    <button onClick={resetTimer} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5">
                        <RotateCcw size={14} /> Resetar
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};