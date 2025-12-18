
import React, { useState } from 'react';
import { Exercise, DayId, DAY_NAMES } from '../types';
import { Timer as TimerIcon, ChevronRight, Dumbbell, Clock } from 'lucide-react';
import { Timer } from './Timer';

interface DashboardProps {
  exercises: Exercise[];
  onAddHistory: (exercise: Exercise) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ exercises, onAddHistory }) => {
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const today = new Date().getDay() as DayId;
  
  const todaysExercises = exercises.filter(ex => ex.weekdays.includes(today));

  return (
    <div className="p-4 space-y-6">
      <header className="space-y-1">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Olá, Campeão!
        </h2>
        <p className="text-zinc-400 font-medium">
          {DAY_NAMES[today]}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
        </p>
      </header>

      <section>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Treino de Hoje</h3>
        
        {todaysExercises.length > 0 ? (
          <div className="space-y-4">
            {todaysExercises.map(ex => (
              <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${
                      ex.category === 'A' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      ex.category === 'B' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      GRUPO {ex.category}
                    </span>
                    <h4 className="text-lg font-bold text-white">{ex.name}</h4>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Dumbbell size={12} /> {ex.equipment}
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTimer(ex.restTime)}
                    className="p-3 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-xl transition-colors"
                  >
                    <TimerIcon size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/40 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Carga</p>
                    <p className="text-lg font-bold text-white">{ex.load}kg</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Séries</p>
                    <p className="text-lg font-bold text-white">{ex.sets}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Reps</p>
                    <p className="text-lg font-bold text-white">{ex.reps}</p>
                  </div>
                </div>

                <button 
                  onClick={() => onAddHistory(ex)}
                  className="w-full mt-4 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:bg-zinc-400 transition-colors"
                >
                  Concluir Exercício <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-800">
            <Clock className="mx-auto text-zinc-600 mb-4" size={48} />
            <p className="text-zinc-400 font-medium">Nenhum exercício para hoje.</p>
            <p className="text-xs text-zinc-600 mt-2">Aproveite seu descanso ou adicione novos treinos!</p>
          </div>
        )}
      </section>

      {activeTimer && (
        <Timer initialSeconds={activeTimer} onClose={() => setActiveTimer(null)} />
      )}
    </div>
  );
};
