
import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon, Info, ExternalLink, Save, XCircle, ChevronRight, Check, ArrowUp, ArrowDown, Activity, ListOrdered, GripVertical } from 'lucide-react';
import { RestTimerOverlay } from '../components/RestTimerOverlay';

// Helper para input numérico que permite limpar o campo (0 vira "")
const NumericInput = ({ value, onChange, className }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val === '' ? 0 : Number(val));
  };
  return (
    <input 
      type="number" 
      value={value === 0 ? '' : value}
      onChange={handleChange}
      className={className}
      placeholder="0"
    />
  );
};

export const ActiveWorkoutScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { activeDraft, updateSeries, updateAllSeries, markCardioComplete, finishWorkout, cancelWorkout, reorderExercises, state, showDialog, getLastSessionData } = manager;
  const [showSummary, setShowSummary] = useState(false);
  const [notes, setNotes] = useState('');
  const [timerVisible, setTimerVisible] = useState(false);
  const [selectedExInfo, setSelectedExInfo] = useState<any | null>(null);

  // Reordering State
  const [isReordering, setIsReordering] = useState(false);
  const [localSortOrder, setLocalSortOrder] = useState<string[]>([]);
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);

  // Timeout Logic
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(300); // 5 min countdown
  const inactivityCheckRef = useRef<any>(null);

  useEffect(() => {
    // Check every minute
    inactivityCheckRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - activeDraft.startTime;
      if (elapsed > 5400000 && !showTimeoutModal) {
        setShowTimeoutModal(true);
      }
    }, 60000);

    return () => clearInterval(inactivityCheckRef.current);
  }, [activeDraft.startTime, showTimeoutModal]);

  useEffect(() => {
    let interval: any;
    if (showTimeoutModal && timeoutSeconds > 0) {
      interval = setInterval(() => setTimeoutSeconds(s => s - 1), 1000);
    } else if (showTimeoutModal && timeoutSeconds === 0) {
      finishWorkout("Finalizado automaticamente por inatividade.");
    }
    return () => clearInterval(interval);
  }, [showTimeoutModal, timeoutSeconds]);

  const handleContinue = () => {
    setShowTimeoutModal(false);
    setTimeoutSeconds(300);
  };

  const getExercise = (id: string) => state.exercises.find((e: any) => e.id === id);

  // Inicializa/Reseta a ordem local ao entrar no modo
  const toggleReorderMode = () => {
    if (!isReordering) {
      const currentIds = Object.keys(activeDraft.exercises).sort((a, b) => {
        const exA = getExercise(a);
        const exB = getExercise(b);
        return (exA?.sortOrder || 0) - (exB?.sortOrder || 0);
      });
      setLocalSortOrder(currentIds);
    }
    setIsReordering(!isReordering);
  };

  const saveReorder = () => {
    reorderExercises(localSortOrder);
    setIsReordering(false);
  };

  // Reordering Handlers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...localSortOrder];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setLocalSortOrder(newList);
  };

  const handleMoveDown = (index: number) => {
    if (index === localSortOrder.length - 1) return;
    const newList = [...localSortOrder];
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    setLocalSortOrder(newList);
  };

  const handleDragStart = (e: any, position: number) => {
    dragItem.current = position;
    // Oculta a imagem fantasma padrão do HTML5 se quiser (opcional)
    // e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: any, position: number) => {
    dragOverItem.current = position;
    e.preventDefault();
  };

  const handleDrop = (e: any) => {
    const copyListItems = [...localSortOrder];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setLocalSortOrder(copyListItems);
  };

  // Lista para renderização principal (fora do modo edição)
  const sortedExerciseIds = Object.keys(activeDraft.exercises).sort((a, b) => {
    const exA = getExercise(a);
    const exB = getExercise(b);
    return (exA?.sortOrder || 0) - (exB?.sortOrder || 0);
  });

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
      <header className="sticky top-0 bg-black/80 backdrop-blur-xl z-50 p-6 border-b border-zinc-900 flex justify-between items-center transition-all">
        {isReordering ? (
          <>
            <button onClick={toggleReorderMode} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
              Cancelar
            </button>
            <h2 className="text-sm font-black italic uppercase text-white animate-pulse">Organizando...</h2>
            <button onClick={saveReorder} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
              Salvar
            </button>
          </>
        ) : (
          <>
            <button onClick={handleCancel} className="text-zinc-600 p-2">
              <XCircle size={24} />
            </button>
            <div className="text-center">
              <h2 className="text-sm font-black italic uppercase text-blue-500 leading-none">
                Treino {activeDraft.selectedGroups.join(' + ')}
              </h2>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Sessão Ativa</span>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleReorderMode} className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400">
                <ListOrdered size={18} />
              </button>
              <button onClick={() => setTimerVisible(true)} className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-blue-500">
                 <TimerIcon size={18} />
              </button>
            </div>
          </>
        )}
      </header>

      <div className="p-4 space-y-4 mt-4">
        {/* MODO DE ORGANIZAÇÃO */}
        {isReordering ? (
          <div className="space-y-3 animate-in fade-in duration-300">
             <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 mb-6 text-center">
               <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Arraste ou use as setas para ordenar</p>
             </div>
             {localSortOrder.map((exId, index) => {
               const ex = getExercise(exId);
               if (!ex) return null;
               return (
                 <div 
                    key={exId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="bg-zinc-800/80 border border-blue-500/30 rounded-[2rem] p-4 flex items-center gap-4 transition-all active:scale-[0.98] active:bg-zinc-800"
                 >
                    {/* Grip para Drag */}
                    <div className="text-zinc-600 cursor-grab active:cursor-grabbing p-2">
                      <GripVertical size={24} />
                    </div>

                    {/* Info Central */}
                    <div className="flex-1 min-w-0">
                       <h4 className="text-base font-black italic uppercase text-white truncate">{ex.name}</h4>
                       {ex.viewUrl && (
                         <a 
                            href={ex.viewUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 mt-1 hover:underline"
                            onClick={(e) => e.stopPropagation()} // Evita drag ao clicar
                         >
                           <ExternalLink size={10} /> Ver execução
                         </a>
                       )}
                    </div>

                    {/* Botões Grandes de Ação */}
                    <div className="flex items-center gap-2">
                       <button 
                          onClick={() => handleMoveUp(index)}
                          className={`p-4 rounded-xl transition-colors ${index === 0 ? 'text-zinc-700' : 'bg-zinc-900 text-white hover:bg-blue-600'}`}
                          disabled={index === 0}
                       >
                         <ArrowUp size={24} />
                       </button>
                       <button 
                          onClick={() => handleMoveDown(index)}
                          className={`p-4 rounded-xl transition-colors ${index === localSortOrder.length - 1 ? 'text-zinc-700' : 'bg-zinc-900 text-white hover:bg-blue-600'}`}
                          disabled={index === localSortOrder.length - 1}
                       >
                         <ArrowDown size={24} />
                       </button>
                    </div>
                 </div>
               );
             })}
          </div>
        ) : (
          /* MODO DE EXECUÇÃO (Padrão) */
          sortedExerciseIds.map((exId) => {
            const ex = getExercise(exId);
            if (!ex) return null;

            // Renderização Diferente para Cardio vs Força
            if (ex.type === 'cardio') {
              const isCompleted = activeDraft.cardioCompleted?.[exId] || false;
              return (
                <div key={exId} className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-6 space-y-4 relative overflow-hidden">
                  {isCompleted && <div className="absolute inset-0 bg-green-900/10 pointer-events-none" />}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] bg-pink-500/20 text-pink-500 font-black px-1.5 py-0.5 rounded uppercase">Cardio</span>
                      </div>
                      <h4 className="text-base font-black italic uppercase text-white leading-tight">{ex.name}</h4>
                    </div>
                    <button onClick={() => setSelectedExInfo(ex)} className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
                        <Info size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => markCardioComplete(exId, !isCompleted)}
                      className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black uppercase text-xs tracking-widest ${isCompleted ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                    >
                      {isCompleted ? <><Check size={16}/> Concluído</> : 'Marcar Feito'}
                    </button>
                  </div>
                </div>
              );
            }

            // Renderização Padrão (Força)
            const series = activeDraft.exercises[exId] || [];
            const lastData = getLastSessionData(exId);
            const currentLoad = series[0]?.load || 0;
            const currentReps = series[0]?.reps || 0;
            
            const delta = currentLoad - lastData.load;
            const allCompleted = series.every((s: any) => s.completed);

            return (
              <div key={exId} className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-5 space-y-4 group">
                {/* TOPO: Título e Ações */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-base font-black italic uppercase text-white truncate leading-tight">{ex?.name}</h4>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter mt-0.5">
                      Histórico: {lastData.load}kg x {lastData.reps}
                    </p>
                  </div>
                  <div className="flex gap-1 items-start">
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
                    {/* Carga Inteligente com Input Fix */}
                    <div className="flex flex-col gap-1">
                      <span className={`text-[8px] font-black uppercase text-center ${delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : 'text-zinc-700'}`}>
                        {delta > 0 ? `▲ +${delta}kg` : delta < 0 ? `▼ ${delta}kg` : 'Manter'}
                      </span>
                      <div className="flex items-center bg-black border border-zinc-800 rounded-xl px-2 h-10">
                        <NumericInput 
                          value={currentLoad}
                          onChange={(val: number) => updateAllSeries(exId, { load: val })}
                          className="w-10 bg-transparent text-center font-black text-sm outline-none no-spinner text-white"
                        />
                        <span className="text-[8px] font-black text-zinc-600 ml-1">KG</span>
                      </div>
                    </div>

                    {/* Repetições com Input Fix */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase text-zinc-700 text-center opacity-0">.</span>
                      <div className="flex items-center bg-black border border-zinc-800 rounded-xl px-2 h-10">
                        <NumericInput 
                          value={currentReps}
                          onChange={(val: number) => updateAllSeries(exId, { reps: val })}
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
          })
        )}
      </div>

      {!isReordering && (
        <div className="fixed bottom-10 left-4 right-4 max-w-md mx-auto z-40">
          <button 
            onClick={() => setShowSummary(true)}
            className="w-full bg-white text-black py-6 rounded-3xl font-black italic uppercase text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Finalizar Sessão
            <ChevronRight size={20} />
          </button>
        </div>
      )}

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

      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6">
           <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 text-center w-full max-w-sm">
              <Activity size={48} className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black italic uppercase text-white mb-2">Ainda aí?</h3>
              <p className="text-zinc-400 text-sm mb-6">Sua sessão está ativa há 90 minutos.</p>
              
              <div className="text-4xl font-mono font-black text-white mb-8">
                {Math.floor(timeoutSeconds / 60)}:{(timeoutSeconds % 60).toString().padStart(2, '0')}
              </div>

              <div className="flex gap-3">
                 <button onClick={() => finishWorkout("Timeout Automático")} className="flex-1 py-4 rounded-2xl bg-zinc-800 text-white font-black uppercase text-xs tracking-widest">Finalizar</button>
                 <button onClick={handleContinue} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest">Continuar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
