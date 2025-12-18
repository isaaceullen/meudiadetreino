
import React, { useState } from 'react';
import { GROUPS, GroupLetter, DAY_NAMES, Exercise } from '../types';
// Fixed: Added missing Dumbbell icon to the lucide-react imports
import { Play, CheckCircle2, Info, ExternalLink, Timer as TimerIcon, ChevronRight, Dumbbell } from 'lucide-react';
import { RestTimer } from '../components/RestTimer';

export const Dashboard: React.FC<{ app: any }> = ({ app }) => {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeGroup, setActiveGroup] = useState<GroupLetter | null>(null);
  const [completedExIds, setCompletedExIds] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedExForNotes, setSelectedExForNotes] = useState<Exercise | null>(null);

  const todayIndex = new Date().getDay();
  const suggestedGroup = app.state.schedule[todayIndex];

  const handleStart = (group: GroupLetter) => {
    setActiveGroup(group);
    setIsWorkoutActive(true);
    setCompletedExIds([]);
  };

  const handleFinish = () => {
    if (activeGroup) {
      app.finishWorkout(activeGroup, completedExIds);
      setIsWorkoutActive(false);
      setActiveGroup(null);
      alert('Treino finalizado e registrado com sucesso!');
    }
  };

  const toggleExercise = (id: string) => {
    setCompletedExIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (isWorkoutActive && activeGroup) {
    const categoriesInGroup = app.state.categories.filter((c: any) => c.groupLetter === activeGroup);
    const exercisesInGroup = app.state.exercises.filter((e: any) => 
      categoriesInGroup.some((c: any) => c.id === e.categoryId)
    );

    return (
      <div className="p-4 animate-in fade-in slide-in-from-right-10 duration-500 pb-32">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase text-blue-500">Treino {activeGroup}</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Sessão Ativa • {exercisesInGroup.length} Exercícios</p>
          </div>
          <button onClick={() => setShowTimer(true)} className="bg-zinc-900 p-4 rounded-2xl text-blue-500 border border-zinc-800 shadow-xl">
            <TimerIcon size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {exercisesInGroup.map((ex: Exercise) => {
            const isDone = completedExIds.includes(ex.id);
            return (
              <div key={ex.id} className={`bg-zinc-900 border transition-all rounded-3xl p-5 ${isDone ? 'border-green-500/50 opacity-60' : 'border-zinc-800'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-white mb-1 leading-tight">{ex.name}</h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="text-zinc-400 text-xs font-bold bg-zinc-800 px-2 py-1 rounded-lg">{ex.sets} Séries</span>
                      <span className="text-zinc-400 text-xs font-bold bg-zinc-800 px-2 py-1 rounded-lg">{ex.reps} Reps</span>
                      <span className="text-blue-400 text-xs font-black bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">{ex.load} KG</span>
                    </div>
                  </div>
                  <button onClick={() => toggleExercise(ex.id)} className={`p-3 rounded-2xl transition-colors ${isDone ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                    <CheckCircle2 size={24} />
                  </button>
                </div>

                <div className="flex gap-2">
                  {ex.url && (
                    <a href={ex.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors">
                      <ExternalLink size={14} /> Execução
                    </a>
                  )}
                  {ex.notes && (
                    <button onClick={() => setSelectedExForNotes(ex)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors">
                      <Info size={14} /> Notas
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30">
          <button 
            onClick={handleFinish}
            className="w-full bg-blue-600 text-white font-black italic uppercase py-5 rounded-3xl shadow-2xl shadow-blue-900/40 hover:bg-blue-500 active:scale-95 transition-all"
          >
            Finalizar Treino
          </button>
        </div>

        {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
        
        {selectedExForNotes && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedExForNotes(null)}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <h4 className="text-blue-500 font-black italic uppercase mb-4">Notas: {selectedExForNotes.name}</h4>
              <p className="text-zinc-300 leading-relaxed italic">"{selectedExForNotes.notes}"</p>
              <button onClick={() => setSelectedExForNotes(null)} className="mt-8 w-full bg-zinc-800 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest">Fechar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 flex flex-col items-center text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/40 rotate-12">
        <Dumbbell size={40} className="text-white -rotate-12" />
      </div>
      <h2 className="text-4xl font-black italic uppercase leading-none mb-2">Pronto para<br/>o Treino?</h2>
      <p className="text-zinc-500 font-bold mb-12 uppercase text-[10px] tracking-[0.3em]">Mantenha a constância, campeão.</p>

      {suggestedGroup && (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8 text-left">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Sugestão de Hoje</span>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Grupo {suggestedGroup}</h3>
              <p className="text-zinc-500 text-xs font-bold">{DAY_NAMES[todayIndex]}</p>
            </div>
            <button 
              onClick={() => handleStart(suggestedGroup as GroupLetter)}
              className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-900/20 active:scale-90 transition-all"
            >
              <Play fill="white" size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}

      <div className="w-full text-left">
        <h4 className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest mb-4 ml-2">Escolher Grupo Manual</h4>
        <div className="grid grid-cols-3 gap-3">
          {GROUPS.map(g => (
            <button 
              key={g} 
              onClick={() => handleStart(g)}
              className="bg-zinc-900 border border-zinc-800 py-6 rounded-3xl font-black text-2xl uppercase hover:border-blue-500/50 transition-all active:scale-95"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
