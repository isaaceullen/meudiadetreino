
import { useState, useEffect } from 'react';
import { AppState, WorkoutDraft, GroupLetter, Session, SeriesEntry, Exercise, Category, Schedule } from '../types';

const STORAGE_KEY = 'meutreino_v3_state';
const DRAFT_KEY = 'meutreino_v3_draft';

const INITIAL_STATE: AppState = {
  categories: [],
  exercises: [],
  sessions: [],
  settings: {
    autoTimer: true,
    restTimeSeconds: 60
  },
  schedule: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  logs: [],
  history: []
};

// Função auxiliar para migrar dados antigos
const migrateState = (data: any): AppState => {
  const migrated = { ...data };

  // Migração 1: Agendamento Multi-select (String/Null -> Array)
  if (migrated.schedule) {
    Object.keys(migrated.schedule).forEach(key => {
      const idx = Number(key);
      const val = migrated.schedule[idx];
      if (val === null) migrated.schedule[idx] = [];
      else if (typeof val === 'string') migrated.schedule[idx] = [val];
      // Se já for array, mantém
    });
  } else {
    migrated.schedule = INITIAL_STATE.schedule;
  }

  // Migração 2: Exercícios (categoryIds, type, sortOrder)
  if (migrated.exercises) {
    migrated.exercises = migrated.exercises.map((ex: any) => ({
      ...ex,
      categoryIds: ex.categoryIds || (ex.categoryId ? [ex.categoryId] : []),
      type: ex.type || 'strength',
      sortOrder: ex.sortOrder !== undefined ? ex.sortOrder : 0
    }));
  }

  return migrated as AppState;
};

export const useWorkoutManager = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? migrateState(JSON.parse(saved)) : INITIAL_STATE;
  });

  const [activeDraft, setActiveDraft] = useState<WorkoutDraft | null>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (activeDraft) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(activeDraft));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [activeDraft]);

  const showDialog = (type: 'alert' | 'confirm', title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type,
        title,
        message,
        onConfirm: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `meu-dia-de-treino-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (jsonStr: string) => {
    try {
      const importedState = JSON.parse(jsonStr);
      if (importedState.categories && importedState.exercises) {
        setState(migrateState(importedState));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const getLastSessionData = (exerciseId: string) => {
    const lastSession = [...state.sessions]
      .reverse()
      .find(s => s.details.some(d => d.exerciseId === exerciseId));
    
    if (lastSession) {
      const detail = lastSession.details.find(d => d.exerciseId === exerciseId);
      return {
        load: detail?.series[0]?.load || 0,
        reps: detail?.series[0]?.reps || 0
      };
    }
    
    const ex = state.exercises.find(e => e.id === exerciseId);
    return {
      load: ex?.initialLoad || 0,
      reps: ex?.defaultReps || 0
    };
  };

  const startWorkout = (groups: GroupLetter[]) => {
    const categoriesInGroups = state.categories.filter(c => groups.includes(c.groupLetter));
    // Suporte a categoryIds (array)
    const exercisesInGroups = state.exercises.filter(e => 
      e.categoryIds.some(cId => categoriesInGroups.some(c => c.id === cId))
    );

    const draftExercises: WorkoutDraft['exercises'] = {};
    const cardioCompleted: WorkoutDraft['cardioCompleted'] = {};

    exercisesInGroups.forEach(ex => {
      if (ex.type === 'strength') {
        const last = getLastSessionData(ex.id);
        draftExercises[ex.id] = Array.from({ length: ex.defaultSets }).map(() => ({
          id: crypto.randomUUID(),
          load: last.load,
          reps: last.reps,
          completed: false
        }));
      } else {
        // Cardio initialization
        draftExercises[ex.id] = [];
        cardioCompleted[ex.id] = false;
      }
    });

    setActiveDraft({
      startTime: Date.now(),
      selectedGroups: groups,
      exercises: draftExercises,
      cardioCompleted
    });
  };

  const updateSeries = (exerciseId: string, seriesId: string, updates: Partial<SeriesEntry>) => {
    setActiveDraft(prev => {
      if (!prev) return null;
      const exSeries = prev.exercises[exerciseId] || [];
      return {
        ...prev,
        exercises: {
          ...prev.exercises,
          [exerciseId]: exSeries.map(s => s.id === seriesId ? { ...s, ...updates } : s)
        }
      };
    });
  };

  const updateAllSeries = (exerciseId: string, updates: Partial<SeriesEntry>) => {
    setActiveDraft(prev => {
      if (!prev) return null;
      const exSeries = prev.exercises[exerciseId] || [];
      return {
        ...prev,
        exercises: {
          ...prev.exercises,
          [exerciseId]: exSeries.map(s => ({ ...s, ...updates }))
        }
      };
    });
  };

  const markCardioComplete = (exerciseId: string, completed: boolean) => {
    setActiveDraft(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cardioCompleted: {
          ...prev.cardioCompleted,
          [exerciseId]: completed
        }
      };
    });
  };

  const finishWorkout = (notes: string) => {
    if (!activeDraft) return;

    const endTime = Date.now();
    const durationMinutes = Math.floor((endTime - activeDraft.startTime) / 60000);
    
    let totalVolume = 0;
    let totalSeriesCount = 0;
    const details: Session['details'] = [];

    // Process Strength
    Object.entries(activeDraft.exercises).forEach(([exId, series]) => {
      const ex = state.exercises.find(e => e.id === exId);
      if (!ex) return;

      if (ex.type === 'strength') {
        const completedSeries = (series as SeriesEntry[]).filter(s => s.completed);
        if (completedSeries.length > 0) {
          totalSeriesCount += completedSeries.length;
          completedSeries.forEach(s => totalVolume += (s.load * s.reps));
          
          details.push({
            exerciseId: exId,
            exerciseName: ex.name,
            type: 'strength',
            series: completedSeries.map(s => ({ load: s.load, reps: s.reps }))
          });
        }
      } 
    });

    // Process Cardio
    if (activeDraft.cardioCompleted) {
      Object.entries(activeDraft.cardioCompleted).forEach(([exId, completed]) => {
         if (completed) {
           const ex = state.exercises.find(e => e.id === exId);
           if (ex) {
             details.push({
               exerciseId: exId,
               exerciseName: ex.name,
               type: 'cardio',
               series: [] // No series for cardio
             });
           }
         }
      });
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      startTime: activeDraft.startTime,
      endTime,
      durationMinutes,
      volume: totalVolume,
      totalSeries: totalSeriesCount,
      notes,
      groups: activeDraft.selectedGroups,
      details
    };

    setState(prev => ({ ...prev, sessions: [...prev.sessions, newSession] }));
    setActiveDraft(null);
  };

  const removeSession = (id: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== id)
    }));
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    setState(prev => ({ ...prev, categories: [...prev.categories, { ...cat, id: crypto.randomUUID() }] }));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const removeCategory = (id: string) => {
    setState((prev: AppState) => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      // Remove da lista de categorias dos exercícios. Se ficar vazio, o exercício fica "órfão" mas não deletado.
      exercises: prev.exercises.map(e => ({
        ...e,
        categoryIds: e.categoryIds.filter(cid => cid !== id)
      }))
    }));
  };

  const addExercise = (ex: Omit<Exercise, 'id'>) => {
    const maxSort = Math.max(0, ...state.exercises.map(e => e.sortOrder));
    setState(prev => ({ 
      ...prev, 
      exercises: [...prev.exercises, { ...ex, id: crypto.randomUUID(), sortOrder: maxSort + 1 }] 
    }));
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  // Função para reordenar em lote
  const reorderExercises = (orderedIds: string[]) => {
    setState(prev => {
      const newExercises = prev.exercises.map(ex => {
        const newIndex = orderedIds.indexOf(ex.id);
        if (newIndex !== -1) {
          // Se o exercício está na lista ordenada, atualiza seu sortOrder
          return { ...ex, sortOrder: newIndex };
        }
        return ex; // Se não estiver na lista, mantém
      });
      return { ...prev, exercises: newExercises };
    });
  };

  const removeExercise = (id: string) => {
    setState(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== id) }));
  };

  return {
    state,
    setState,
    activeDraft,
    startWorkout,
    updateSeries,
    updateAllSeries,
    markCardioComplete,
    finishWorkout,
    removeSession,
    cancelWorkout: () => setActiveDraft(null),
    addCategory,
    updateCategory,
    removeCategory,
    addExercise,
    updateExercise,
    reorderExercises,
    removeExercise,
    exportData,
    importData,
    showDialog,
    dialog,
    getLastSessionData
  };
};
