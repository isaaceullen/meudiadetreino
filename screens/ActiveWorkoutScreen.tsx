
import React, { useState } from 'react';
import { Timer as TimerIcon, Info, ExternalLink, Save, XCircle, ChevronRight, Check } from 'lucide-react';
import { RestTimerOverlay } from '../components/RestTimerOverlay';

export const ActiveWorkoutScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { activeDraft, updateSeries, updateAllSeries, finishWorkout, cancelWorkout, state, showDialog, getLastSessionData } = manager;
  const [showSummary, setShowSummary] = useState(false);
  const [notes, setNotes] = useState('');
  const [timerVisible, setTimerVisible] = useState(false);
  const [selectedExInfo, setSelectedExInfo] = useState<any | null>(null);

  const getExercise = (id: string) => state.exercises.find((e: any) => e.id === id);

  const handleSeriesCheck = (exId: string, seriesId: string, currentStatus: boolean) => {
    updateSeries(exId, seriesId, { completed: !currentStatus });
    if (!currentStatus && state.settings.autoTimer) {
      setTimerVisible(true);
    }
  };

  const handleBulkCheck = (exId: string, alreadyCompleted: boolean) => {
    updateAllSeries(exId, { completed: !alreadyCompleted });
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
            Ajustar Treino
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

      <div className="p-4 space-y-4 mt-4">
        {Object.entries(activeDraft.exercises).map(([exId, series]: any) => {
          const ex = getExercise(exId);
          const lastData = getLastSessionData(exId);
          const currentLoad = series[0]?.load || 0;
          const currentReps = series[0]?.reps || 0;
          
          const delta = currentLoad - lastData.load;
          const allCompleted = series.every((s: any) => s.completed);

          return (
            <div key={exId} className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-5 space-y-4">
              {/* TOPO: Título e Ações */}
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black italic uppercase text-white truncate leading-tight">{ex?.name}</h4>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter mt-0.5">
                    Histórico: {lastData.load}kg x {lastData.reps}
                  </p>
                </div>
                <div className="flex gap-2">
                  {ex?.viewUrl && (
                    <a href={ex.viewUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-xl text-blue-400">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {ex?.notes && (
                    <button onClick={() => setSelectedExInfo(ex)} className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
                      <Info size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* BAIXO: Inputs e Check */}
              <div className="flex items-end justify-between gap-3 pt-2 border-t border-zinc-800/50">
                <div className="flex gap-3">
                  {/* Carga Inteligente */}
                  <div className="flex flex-col gap-1">
                    <span className={`text-[8px] font-black uppercase text-center ${delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : 'text-zinc-700'}`}>
                      {delta > 0 ? `▲ +${delta}kg` : delta < 0 ? `▼ ${delta}kg` : 'Manter'}
                    </span>
                    <div className="flex items-center bg-black border border-zinc-800 rounded-xl px-2 h-10">
                      <input 
                        type="number" 
                        value={currentLoad}
                        onChange={(e) => updateAllSeries(exId, { load: Number(e.target.value) })}
                        className="w-10 bg-transparent text-center font-black text-sm outline-none no-spinner text-white"
                      />
                      <span className="text-[8px] font-black text-zinc-600 ml-1">KG</span>
                    </div>
                  </div>

                  {/* Repetições */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black uppercase text-zinc-700 text-center opacity-0">.</span>
                    <div className="flex items-center bg-black border border-zinc-800 rounded-xl px-2 h-10">
                      <input 
                        type="number" 
                        value={currentReps}
                        onChange={(e) => updateAllSeries(exId, { reps: Number(e.target.value) })}
                        className="w-10 bg-transparent text-center font-black text-sm outline-none no-spinner text-blue-500"
                      />
                      <span className="text-[8px] font-black text-zinc-600 ml-1">REPS</span>
                    </div>
                  </div>
                </div>

                {/* Botão de Ação Híbrido */}
                <div className="flex items-center">
                  {state.settings.autoTimer ? (
                    <div className="flex gap-1">
                      {series.map((s: any, idx: number) => (
                        <button 
                          key={s.id}
                          onClick={() => handleSeriesCheck(exId, s.id, s.completed)}
                          className={`w-7 h-10 rounded-lg flex items-center justify-center transition-all ${s.completed ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-600 border border-zinc-700'}`}
                        >
                          <span className="text-[10px] font-black">{idx + 1}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleBulkCheck(exId, allCompleted)}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${allCompleted ? 'bg-blue-600 border-blue-400 text-white shadow-xl' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}
                    >
                      {allCompleted ? <Check size={28} strokeWidth={4} /> : <div className="text-xs font-black">{ex?.defaultSets}x</div>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-10 left-4 right-4 max-w-md mx-auto z-40">
        <button 
          onClick={() => setShowSummary(true)}
          className="w-full bg-white text-black py-6 rounded-3xl font-black italic uppercase text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          Finalizar Sessão
          <ChevronRight size={20} />
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
            <header className="flex justify-between items-start mb-6">
               <h4 className="text-blue-500 font-black italic uppercase text-lg">{selectedExInfo.name}</h4>
            </header>
            <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800">
              <p className="text-zinc-300 italic text-sm leading-relaxed">{selectedExInfo.notes || 'Sem observações técnicas.'}</p>
            </div>
            <button onClick={() => setSelectedExInfo(null)} className="mt-8 w-full bg-zinc-800 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};
