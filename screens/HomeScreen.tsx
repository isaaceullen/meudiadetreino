
import React, { useState, useEffect } from 'react';
import { GROUPS, GroupLetter } from '../types';
import { Play, Dumbbell } from 'lucide-react';

export const HomeScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, startWorkout } = manager;
  const [selected, setSelected] = useState<GroupLetter[]>([]);

  // Pré-selecionar grupos baseados no dia atual (Multi-select suportado)
  useEffect(() => {
    const todayIndex = new Date().getDay();
    // Agora state.schedule[todayIndex] é um array de GroupLetter
    const scheduledGroups: GroupLetter[] = state.schedule[todayIndex] || [];
    
    if (scheduledGroups.length > 0) {
      setSelected(scheduledGroups);
    }
  }, [state.schedule]);

  const toggleGroup = (g: GroupLetter) => {
    setSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const getExerciseCountForGroup = (g: GroupLetter) => {
    // Conta exercícios que pertencem a categorias deste grupo
    const catsInGroupIds = state.categories.filter((c: any) => c.groupLetter === g).map((c: any) => c.id);
    // Verifica se exercise.categoryIds contem algum ID desse grupo
    return state.exercises.filter((e: any) => 
      e.categoryIds.some((cId: string) => catsInGroupIds.includes(cId))
    ).length;
  };

  // Categorias ativas baseadas nos grupos selecionados
  const activeCategories = state.categories.filter((c: any) => selected.includes(c.groupLetter));

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="pt-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Meu Dia <br/><span className="text-blue-500">de Treino</span>
          </h1>
        </div>
        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-blue-500">
          <Dumbbell size={24} />
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Selecione seu Split</h2>
        <div className="grid grid-cols-2 gap-3">
          {GROUPS.map(g => {
            const count = getExerciseCountForGroup(g);
            const isSelected = selected.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGroup(g)}
                className={`relative flex flex-col items-start p-5 rounded-[2rem] border-2 transition-all duration-300 text-left ${
                  isSelected 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/20' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black italic uppercase">{g}</span>
                  <div className="w-px h-6 bg-current opacity-20" />
                  <span className="text-xs font-black">{count}</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isSelected ? 'text-blue-200' : 'text-zinc-600'}`}>
                  exercícios
                </span>
                {isSelected && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {selected.length > 0 && (
        <section className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2.5rem] space-y-4 animate-in zoom-in-95">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Foco da Sessão</h3>
          <div className="flex flex-wrap gap-2">
            {activeCategories.map((cat: any) => (
              <span key={cat.id} className="bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase px-4 py-2 rounded-full border border-zinc-700">
                {cat.name}
              </span>
            ))}
            {activeCategories.length === 0 && (
              <p className="text-zinc-600 italic text-xs">Vincule categorias a estes grupos nas configurações.</p>
            )}
          </div>
        </section>
      )}

      <div className="fixed bottom-28 left-4 right-4 max-w-md mx-auto z-40">
        <button
          disabled={selected.length === 0}
          onClick={() => startWorkout(selected)}
          className={`w-full py-5 rounded-3xl font-black uppercase text-lg italic tracking-widest flex items-center justify-center gap-3 transition-all ${
            selected.length > 0 
            ? 'bg-white text-black shadow-2xl active:scale-95' 
            : 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed'
          }`}
        >
          <Play fill="currentColor" size={24} />
          Iniciar Treino
        </button>
      </div>
    </div>
  );
};
