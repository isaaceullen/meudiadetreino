
import React, { useState } from 'react';
import { Timer as TimerIcon, Info, ExternalLink, CheckCircle2, Save, XCircle, Plus, Minus } from 'lucide-react';
import { RestTimerOverlay } from '../components/RestTimerOverlay';

export const ActiveWorkoutScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { activeDraft, updateSeries, finishWorkout, cancelWorkout, state, showDialog } = manager;
  const [showSummary, setShowSummary] = useState(false);
  const [notes, setNotes] = useState('');
  const [timerVisible, setTimerVisible] = useState(false);
  const [selectedExInfo, setSelectedExInfo] = useState<any | null>(null);

  const getExercise = (id: string) => state.exercises.find((e: any) => e.id === id);

  const handleCheck = (exId: string, seriesId: string, currentStatus: boolean) => {
    updateSeries(exId, seriesId, { completed: !currentStatus });
    if (!currentStatus && state.settings.autoTimer) {
      setTimerVisible(true);
    }
  };

  const calculateVolume = () => {
    let vol = 0;
    Object.values(activeDraft.exercises).forEach((series: any) => {
      (series as any[]).forEach((s: any) => { if (s.completed) vol += (s.load * s.reps); });
    });
    return vol;
  };

  const handleCancel = async () => {
    const confirm = await showDialog('confirm', 'Sair do Treino?', 'Todo o progresso desta sessão não salva será perdido.');
    if (confirm) cancelWorkout();
  };

  if (showSummary) {
    return (
      <div className="min-h-screen bg-black p-6 flex flex-col animate-in slide-in-from-right duration-300">
        <header className="mb-10 pt-10 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/30">
            <Save size={40} />
          </div>
          <h2 className="text-3xl font-black italic uppercase">Resumo da Missão</h2>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Volume Total</p>
            <p className="text-2xl font-black italic text-white">{calculateVolume()} kg</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Duração</p>
            <p className="text-2xl font-black italic text-white">{Math.floor((Date.now() - activeDraft.startTime) / 60000)} min</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Diário de Treino</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 text-white min-h-[150px] outline-none focus:ring-2 ring-blue-500 transition-all text-sm"
            placeholder="Como você se sentiu hoje? Evoluiu a carga?"
          />
        </div>

        <div className="space-y-3 mt-8 pb-10">
          <button 
            onClick={() => finishWorkout(notes)}
            className="w-full bg-blue-600 py-6 rounded-[2rem] font-black italic uppercase text-lg shadow-2xl"
          >
            Confirmar e Registrar
          </button>
          <button 
            onClick={() => setShowSummary(false)}
            className="w-full py-4 text-zinc-500 font-bold uppercase text-xs"
          >
            Ajustar mais alguma coisa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      <header className="sticky top-0 bg-black/80 backdrop-blur-xl z-50 p-6 border-b border-zinc-900 flex justify-between items-center">
        <button onClick={handleCancel} className="text-zinc-600 p-2">
          <XCircle size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black italic uppercase text-blue-500 leading-none">
            Treino {activeDraft.selectedGroups.join(' + ')}
          </h2>
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Sessão Ativa</span>
        </div>
        <button onClick={() => setTimerVisible(true)} className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-blue-500">
           <TimerIcon size={18} />
        </button>
      </header>

      <div className="p-4 space-y-10 mt-4">
        {Object.entries(activeDraft.exercises).map(([exId, series]: any) => {
          const ex = getExercise(exId);
          return (
            <div key={exId} className="space-y-5">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-black italic uppercase tracking-tight text-white max-w-[60%] leading-tight">
                  {ex?.name}
                </h3>
                <div className="flex gap-2">
                  {ex?.viewUrl && (
                    <a href={ex.viewUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-900 rounded-2xl text-zinc-400 hover:text-white transition-colors">
                      <ExternalLink size={18} />
                    </a>
                  )}
                  {ex?.notes && (
                    <button onClick={() => setSelectedExInfo(ex)} className="p-3 bg-zinc-900 rounded-2xl text-zinc-400 hover:text-white transition-colors">
                      <Info size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {series.map((s: any, idx: number) => (
                  <div key={s.id} className={`bg-zinc-900 p-4 rounded-3xl border transition-all flex items-center gap-4 ${s.completed ? 'border-blue-600/50 bg-blue-900/10' : 'border-zinc-800'}`}>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500">
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="flex items-center bg-black rounded-2xl border border-zinc-800 p-1">
                        <button onClick={() => updateSeries(exId, s.id, { load: Math.max(0, s.load - 5) })} className="p-2 text-zinc-500"><Minus size={14}/></button>
                        <input 
                          type="number" 
                          value={s.load} 
                          onChange={(e) => updateSeries(exId, s.id, { load: Number(e.target.value) })}
                          className="w-full bg-transparent text-center font-black text-sm outline-none no-spinner"
                        />
                        <button onClick={() => updateSeries(exId, s.id, { load: s.load + 5 })} className="p-2 text-blue-500"><Plus size={14}/></button>
                      </div>

                      <div className="flex items-center bg-black rounded-2xl border border-zinc-800 p-1">
                        <button onClick={() => updateSeries(exId, s.id, { reps: Math.max(0, s.reps - 1) })} className="p-2 text-zinc-500"><Minus size={14}/></button>
                        <input 
                          type="number" 
                          value={s.reps} 
                          onChange={(e) => updateSeries(exId, s.id, { reps: Number(e.target.value) })}
                          className="w-full bg-transparent text-center font-black text-sm outline-none no-spinner"
                        />
                        <button onClick={() => updateSeries(exId, s.id, { reps: s.reps + 1 })} className="p-2 text-blue-500"><Plus size={14}/></button>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCheck(exId, s.id, s.completed)}
                      className={`p-3 rounded-2xl transition-all ${s.completed ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-600'}`}
                    >
                      <CheckCircle2 size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-10 left-4 right-4 max-w-md mx-auto z-40">
        <button 
          onClick={() => setShowSummary(true)}
          className="w-full bg-white text-black py-6 rounded-3xl font-black italic uppercase text-lg shadow-2xl active:scale-95 transition-all"
        >
          Finalizar Sessão
        </button>
      </div>

      {timerVisible && (
        <RestTimerOverlay 
          initialSeconds={state.settings.restTimeSeconds} 
          onClose={() => setTimerVisible(false)} 
        />
      )}

      {selectedExInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-8" onClick={() => setSelectedExInfo(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 w-full animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h4 className="text-blue-500 font-black italic uppercase mb-4 text-center">Dicas: {selectedExInfo.name}</h4>
            <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800">
              <p className="text-zinc-300 italic text-sm leading-relaxed">{selectedExInfo.notes}</p>
            </div>
            <button onClick={() => setSelectedExInfo(null)} className="mt-8 w-full bg-zinc-800 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};
