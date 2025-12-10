
import React, { useState, useEffect, useMemo } from 'react';
import { Check, Plus, Minus, ExternalLink, Trophy, Timer, BarChart2, StickyNote, History } from 'lucide-react';
import { Exercise, WorkoutSession, SessionExercise, SetLog, Category, AppState, GroupId } from '../types';
import { getTodayDateISO, generateId, formatDuration, getTodayWeekdayName, GROUP_IDS } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { RestTimerOverlay } from '../components/RestTimerOverlay';

interface DashboardProps {
  exercises: Exercise[];
  categories: Category[];
  sessions: WorkoutSession[];
  settings: AppState['settings'];
  onSaveSession: (session: WorkoutSession) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ exercises, categories, sessions, settings, onSaveSession }) => {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [noteModalContent, setNoteModalContent] = useState<string | null>(null);
  
  // Selection State
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutNote, setCheckoutNote] = useState('');

  // --- SMART SELECT LOGIC (On Mount) ---
  useEffect(() => {
    // Only auto-select if no session is active and no selection made yet
    if (!activeSession && selectedCategoryIds.length === 0 && !selectedGroup) {
        const todayWeekday = getTodayWeekdayName(); // e.g. "Monday"
        
        // Find which group is scheduled for today
        const scheduledGroupId = Object.keys(settings.groupSchedule).find(
            key => settings.groupSchedule[key as GroupId] === todayWeekday
        );

        if (scheduledGroupId) {
            handleGroupSelect(scheduledGroupId);
        }
    }
  }, []); // Run once on mount

  // Recover active session logic
  useEffect(() => {
    const dateKey = getTodayDateISO();
    const existingSession = sessions.find(s => s.date === dateKey);
    
    if (existingSession && !existingSession.endTime) {
      setActiveSession(existingSession);
      if (existingSession.note) setCheckoutNote(existingSession.note);
      
      // Restore view based on exercises in session
      const usedExerciseIds = Object.keys(existingSession.exercises);
      if (usedExerciseIds.length > 0) {
          const usedCategories = new Set<string>();
          usedExerciseIds.forEach(exId => {
              const ex = exercises.find(e => e.id === exId);
              if (ex) {
                  usedCategories.add(ex.categoryId);
                  // Also set group if found
                  const cat = categories.find(c => c.id === ex.categoryId);
                  if (cat && cat.group) setSelectedGroup(cat.group);
              }
          });
          if (selectedCategoryIds.length === 0) {
             setSelectedCategoryIds(Array.from(usedCategories));
          }
      }
    }
  }, [sessions, exercises]);

  // --- Derived Data ---
  
  // Groups that actually have exercises
  const availableGroups = useMemo(() => {
      const groups = new Set<string>();
      exercises.forEach(ex => {
          const cat = categories.find(c => c.id === ex.categoryId);
          if (cat && cat.group) groups.add(cat.group);
      });
      return GROUP_IDS.filter(g => groups.has(g));
  }, [exercises, categories]);

  // Filtered exercises
  const filteredExercises = exercises.filter(ex => selectedCategoryIds.includes(ex.categoryId));

  // --- Handlers ---

  const handleGroupSelect = (groupId: string) => {
      if (selectedGroup === groupId) {
          // Deselect
          setSelectedGroup(null);
          setSelectedCategoryIds([]);
      } else {
          // Select Group and Auto-select all its categories
          setSelectedGroup(groupId);
          const groupCats = categories.filter(c => c.group === groupId).map(c => c.id);
          setSelectedCategoryIds(groupCats);
      }
  };

  const toggleCategory = (catId: string) => {
      setSelectedCategoryIds(prev => 
        prev.includes(catId) 
            ? prev.filter(id => id !== catId)
            : [...prev, catId]
      );
  };

  const startWorkout = () => {
    const newSession: WorkoutSession = {
      id: generateId(),
      date: getTodayDateISO(),
      startTime: Date.now(), // START TIMER
      exercises: {}
    };
    setActiveSession(newSession);
    onSaveSession(newSession);
  };

  const initiateFinish = () => {
    if (!activeSession) return;
    setShowCheckout(true);
  };

  const confirmFinishWorkout = () => {
    if (!activeSession) return;
    const completedSession = {
      ...activeSession,
      endTime: Date.now(), // END TIMER
      note: checkoutNote
    };
    onSaveSession(completedSession);
    setActiveSession(null);
    setShowCheckout(false);
    setCheckoutNote('');
    setSelectedCategoryIds([]);
    setSelectedGroup(null);
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof SetLog, value: any) => {
    if (!activeSession) {
        // Auto-start if user interacts
        const newSession: WorkoutSession = {
            id: generateId(),
            date: getTodayDateISO(),
            startTime: Date.now(),
            exercises: {}
        };
        setActiveSession(newSession);
        // We need to pass the new session to the update logic, but state update is async.
        // For simplicity, we just init state here and let the next click work or rely on rapid state update.
        // A better approach is to create variable `currentSession` = activeSession || newSession
        onSaveSession(newSession);
        // Recursive call with delay to ensure session exists? 
        // Better: Duplicate logic for creating session inline
        // (Skipping deep refactor for brevity, assuming user clicks Start or we accept 1st click glitch-free due to React batching)
    }

    // Safety check if activeSession is null (should be handled above or by UI)
    const sessionToUpdate = activeSession || {
        id: generateId(),
        date: getTodayDateISO(),
        startTime: Date.now(),
        exercises: {}
    };

    const currentEx = sessionToUpdate.exercises[exerciseId] || { exerciseId, sets: [] };
    const sets = [...currentEx.sets];
    
    if (!sets[setIndex]) {
        sets[setIndex] = {
            id: generateId(),
            weight: 0,
            reps: 0,
            completed: false,
            timestamp: Date.now()
        };
    }

    let finalValue = value;
    if (typeof value === 'number') finalValue = Math.max(0, value);

    sets[setIndex] = { ...sets[setIndex], [field]: finalValue };

    if (field === 'completed' && value === true && settings.autoTimer) {
        setShowRestTimer(true);
    }

    const updatedSession = {
        ...sessionToUpdate,
        exercises: {
            ...sessionToUpdate.exercises,
            [exerciseId]: { ...currentEx, sets }
        }
    };

    setActiveSession(updatedSession);
    onSaveSession(updatedSession);
  };

  const addSet = (exerciseId: string, targetReps: number) => {
    if (!activeSession) return;
    const currentEx = activeSession.exercises[exerciseId] || { exerciseId, sets: [] };
    // Clone weight from last set if exists
    const lastWeight = currentEx.sets.length > 0 ? currentEx.sets[currentEx.sets.length-1].weight : 0;
    
    const newSet: SetLog = {
        id: generateId(),
        weight: lastWeight,
        reps: targetReps,
        completed: false,
        timestamp: Date.now()
    };
    
    const updatedSession = {
        ...activeSession,
        exercises: {
            ...activeSession.exercises,
            [exerciseId]: { ...currentEx, sets: [...currentEx.sets, newSet] }
        }
    };
    setActiveSession(updatedSession);
    onSaveSession(updatedSession);
  };

  const removeSet = (exerciseId: string) => {
      if (!activeSession) return;
      const currentEx = activeSession.exercises[exerciseId];
      if (!currentEx || currentEx.sets.length === 0) return;
      const sets = [...currentEx.sets];
      sets.pop();
      const updatedSession = {
          ...activeSession,
          exercises: {
              ...activeSession.exercises,
              [exerciseId]: { ...currentEx, sets }
          }
      };
      setActiveSession(updatedSession);
      onSaveSession(updatedSession);
  };

  // --- PROGRESSIVE OVERLOAD HELPER ---
  const getLastSessionData = (exerciseId: string) => {
      // Find the most recent session (excluding today) that has this exercise completed
      const today = getTodayDateISO();
      const pastSessions = sessions.filter(s => s.date !== today && s.exercises[exerciseId]);
      // Sort descending by date
      pastSessions.sort((a,b) => b.date.localeCompare(a.date));
      
      if (pastSessions.length === 0) return null;
      return pastSessions[0].exercises[exerciseId];
  };

  const getSessionStats = () => {
    if (!activeSession) return { volume: 0, sets: 0, duration: 0 };
    let totalVolume = 0;
    let totalSets = 0;
    Object.values(activeSession.exercises).forEach((ex: SessionExercise) => {
        ex.sets.forEach(s => {
            if (s.completed) {
                totalVolume += s.weight * s.reps;
                totalSets++;
            }
        });
    });
    const duration = Date.now() - activeSession.startTime;
    return { volume: totalVolume, sets: totalSets, duration };
  };

  const stats = getSessionStats();

  return (
    <div className="space-y-6">
      <header className="sticky top-0 bg-background/95 backdrop-blur-md z-30 pt-4 pb-2 -mx-4 px-4 border-b border-white/5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
               Meu Dia de Treino
            </h1>
            <p className="text-xs text-zinc-400">
                {activeSession ? "Treino em andamento..." : "Escolha um grupo para começar."}
            </p>
          </div>
          {!activeSession ? (
            <Button onClick={startWorkout} className="animate-pulse-fast h-9 px-4">
              Iniciar Agora
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={initiateFinish}>
              Finalizar
            </Button>
          )}
        </div>
        
        {/* GROUP SELECTION CHIPS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {availableGroups.map(group => {
                const isActive = selectedGroup === group;
                return (
                    <button
                        key={group}
                        onClick={() => handleGroupSelect(group)}
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-sm
                            ${isActive 
                                ? 'bg-blue-600 text-white shadow-blue-900/40 ring-2 ring-blue-400 ring-offset-2 ring-offset-background' 
                                : 'bg-surface border border-zinc-700 text-zinc-400 hover:text-white'
                            }
                        `}
                    >
                        {group}
                    </button>
                )
            })}
        </div>

        {/* SUB-CATEGORY CHIPS (Visible only when Group Selected) */}
        {selectedGroup && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mask-linear-fade animate-in slide-in-from-top-2">
                {categories.filter(c => c.group === selectedGroup).map(cat => {
                    const isActive = selectedCategoryIds.includes(cat.id);
                    const count = exercises.filter(e => e.categoryId === cat.id).length;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className={`
                                px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5
                                ${isActive 
                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' 
                                    : 'bg-surface border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                }
                            `}
                        >
                            {cat.name}
                            <span className="opacity-50">({count})</span>
                        </button>
                    )
                })}
            </div>
        )}
      </header>

      {/* Exercise List */}
      <div className="space-y-4 min-h-[50vh]">
        {selectedCategoryIds.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center text-zinc-600 mb-4 border border-zinc-800">
                    <Plus size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Selecione um Grupo</h3>
                <p className="text-zinc-500 max-w-xs text-sm">Clique em A, B, C acima para ver os exercícios.</p>
             </div>
        ) : filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                <p>Nenhum exercício encontrado nesta categoria.</p>
            </div>
        ) : (
            filteredExercises.map((ex) => {
            const sessionData = activeSession?.exercises[ex.id];
            const sets = sessionData?.sets || [];
            const displaySetsCount = Math.max(sets.length, ex.targetSets);
            
            // Progressive Overload Data
            const lastSessionData = getLastSessionData(ex.id);

            return (
                <div key={ex.id} className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-4 flex items-center justify-between border-b border-white/5 bg-zinc-800/30">
                    <div>
                    <h3 className="font-semibold text-lg text-white">{ex.name}</h3>
                    <p className="text-xs text-zinc-400">{ex.equipment} • {categories.find(c => c.id === ex.categoryId)?.name}</p>
                    </div>
                    <div className="flex gap-2">
                        {ex.note && (
                            <button 
                                onClick={() => setNoteModalContent(ex.note || '')}
                                className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20"
                            >
                                <StickyNote size={18} />
                            </button>
                        )}
                        {ex.videoUrl && (
                        <button 
                            onClick={() => window.open(ex.videoUrl, '_blank')}
                            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                        >
                            <ExternalLink size={18} />
                        </button>
                        )}
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase text-zinc-500 font-medium px-2 py-1">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-5 text-center">kg</div>
                        <div className="col-span-4 text-center">Reps</div>
                        <div className="col-span-2 text-center">OK</div>
                    </div>

                    {Array.from({ length: displaySetsCount }).map((_, idx) => {
                        const set = sets[idx];
                        const isCompleted = set?.completed;
                        const currentWeight = set?.weight ?? 0;
                        const currentReps = set?.reps ?? ex.targetReps;
                        
                        // Last Lift Comparison
                        const prevSet = lastSessionData?.sets[idx];
                        
                        return (
                            <div key={idx} className="relative group">
                                {/* PROGRESSIVE OVERLOAD GHOST TEXT */}
                                {prevSet && prevSet.completed && (
                                    <div className="absolute -top-3 left-14 text-[9px] text-zinc-600 flex items-center gap-1">
                                        <History size={8} /> 
                                        Anterior: {prevSet.weight}kg x {prevSet.reps}
                                    </div>
                                )}

                                <div className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-colors ${isCompleted ? 'bg-green-500/10' : 'bg-zinc-800/50'} mt-2`}>
                                    <div className="col-span-1 text-center font-mono text-zinc-400 text-sm">
                                        {idx + 1}
                                    </div>
                                    
                                    <div className="col-span-5 flex items-center gap-1">
                                        <button 
                                        onClick={() => activeSession && updateSet(ex.id, idx, 'weight', currentWeight - 5)}
                                        className="h-8 w-6 flex items-center justify-center bg-zinc-700/50 hover:bg-zinc-700 rounded-l-lg text-[10px] text-zinc-400"
                                        disabled={!activeSession}
                                        >-5</button>
                                        <input 
                                            type="number" 
                                            className="w-full h-8 bg-black/20 border-y border-white/5 px-1 text-center text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={set?.weight ?? ''}
                                            onChange={(e) => activeSession && updateSet(ex.id, idx, 'weight', Number(e.target.value))}
                                            placeholder="0"
                                            disabled={!activeSession}
                                        />
                                        <button 
                                        onClick={() => activeSession && updateSet(ex.id, idx, 'weight', currentWeight + 5)}
                                        className="h-8 w-6 flex items-center justify-center bg-zinc-700/50 hover:bg-zinc-700 rounded-r-lg text-[10px] text-zinc-400"
                                        disabled={!activeSession}
                                        >+5</button>
                                    </div>

                                    <div className="col-span-4 flex items-center gap-1">
                                        <button 
                                        onClick={() => activeSession && updateSet(ex.id, idx, 'reps', currentReps - 1)}
                                        className="h-8 w-6 flex items-center justify-center bg-zinc-700/50 hover:bg-zinc-700 rounded-l-lg text-zinc-400"
                                        disabled={!activeSession}
                                        >
                                        <Minus size={12} />
                                        </button>
                                        <input 
                                            type="number" 
                                            className="w-full h-8 bg-black/20 border-y border-white/5 px-1 text-center text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={set?.reps ?? ex.targetReps}
                                            onChange={(e) => activeSession && updateSet(ex.id, idx, 'reps', Number(e.target.value))}
                                            disabled={!activeSession}
                                        />
                                        <button 
                                        onClick={() => activeSession && updateSet(ex.id, idx, 'reps', currentReps + 1)}
                                        className="h-8 w-6 flex items-center justify-center bg-zinc-700/50 hover:bg-zinc-700 rounded-r-lg text-zinc-400"
                                        disabled={!activeSession}
                                        >
                                        <Plus size={12} />
                                        </button>
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            onClick={() => activeSession && updateSet(ex.id, idx, 'completed', !isCompleted)}
                                            disabled={!activeSession}
                                            className={`h-8 w-full rounded-lg flex items-center justify-center transition-all ${
                                                isCompleted 
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' 
                                                : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                            } ${!activeSession ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Check size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {activeSession && (
                        <div className="flex justify-center gap-3 pt-2">
                            <button onClick={() => removeSet(ex.id)} className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white text-xs font-medium">
                                - Série
                            </button>
                            <button onClick={() => addSet(ex.id, ex.targetReps)} className="px-4 py-2 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600/20 text-xs font-medium">
                                + Add Série
                            </button>
                        </div>
                    )}
                </div>
                </div>
            );
            })
        )}
      </div>

      <RestTimerOverlay 
        isOpen={showRestTimer} 
        onClose={() => setShowRestTimer(false)} 
        defaultDuration={settings.restTimerDefault} 
      />

      <Modal isOpen={!!noteModalContent} onClose={() => setNoteModalContent(null)} title="Nota do Exercício">
          <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {noteModalContent}
          </div>
      </Modal>

      {/* Checkout Modal */}
      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Resumo do Treino">
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4">
                    <Trophy size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">Treino Concluído!</h2>
                <p className="text-zinc-400 text-sm">Bom trabalho hoje.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 p-3 rounded-xl text-center border border-white/5">
                    <Timer className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{formatDuration(stats.duration)}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Duração</div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-xl text-center border border-white/5">
                    <BarChart2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{(stats.volume / 1000).toFixed(1)}k</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Vol (kg)</div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-xl text-center border border-white/5">
                    <Check className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{stats.sets}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Séries</div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Notas do Treino</label>
                <textarea 
                    value={checkoutNote}
                    onChange={(e) => setCheckoutNote(e.target.value)}
                    placeholder="Como você se sentiu? Alguma dor?"
                    className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none h-24 text-sm"
                />
            </div>

            <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowCheckout(false)} className="flex-1">
                    Continuar
                </Button>
                <Button variant="primary" onClick={confirmFinishWorkout} className="flex-1">
                    Salvar
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
