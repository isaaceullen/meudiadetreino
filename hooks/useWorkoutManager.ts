
import { useState, useEffect } from 'react';
import { AppState, WorkoutDraft, GroupLetter, Session, SeriesEntry, Exercise, Category } from '../types';

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
  schedule: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
  logs: [],
  history: []
};

export const useWorkoutManager = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
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
        setState(importedState);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const getLastLoadForExercise = (exerciseId: string): number => {
    const lastSessionWithExercise = [...state.sessions]
      .reverse()
      .find(s => s.details.some(d => d.exerciseId === exerciseId));
    
    if (lastSessionWithExercise) {
      const detail = lastSessionWithExercise.details.find(d => d.exerciseId === exerciseId);
      return detail?.series[0]?.load || 0;
    }
    
    const ex = state.exercises.find(e => e.id === exerciseId);
    return ex?.initialLoad || 0;
  };

  const startWorkout = (groups: GroupLetter[]) => {
    const categoriesInGroups = state.categories.filter(c => groups.includes(c.groupLetter));
    const exercisesInGroups = state.exercises.filter(e => 
      categoriesInGroups.some(c => c.id === e.categoryId)
    );

    const draftExercises: WorkoutDraft['exercises'] = {};
    exercisesInGroups.forEach(ex => {
      const lastLoad = getLastLoadForExercise(ex.id);
      draftExercises[ex.id] = Array.from({ length: ex.defaultSets }).map(() => ({
        id: crypto.randomUUID(),
        load: lastLoad,
        reps: ex.defaultReps,
        completed: false
      }));
    });

    setActiveDraft({
      startTime: Date.now(),
      selectedGroups: groups,
      exercises: draftExercises
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

  const finishWorkout = (notes: string) => {
    if (!activeDraft) return;

    const endTime = Date.now();
    const durationMinutes = Math.floor((endTime - activeDraft.startTime) / 60000);
    
    let totalVolume = 0;
    let totalSeriesCount = 0;
    const details: Session['details'] = [];

    Object.entries(activeDraft.exercises).forEach(([exId, series]) => {
      const completedSeries = (series as SeriesEntry[]).filter(s => s.completed);
      if (completedSeries.length > 0) {
        const ex = state.exercises.find(e => e.id === exId);
        totalSeriesCount += completedSeries.length;
        completedSeries.forEach(s => totalVolume += (s.load * s.reps));
        
        details.push({
          exerciseId: exId,
          exerciseName: ex?.name || 'Exercício Excluído',
          series: completedSeries.map(s => ({ load: s.load, reps: s.reps }))
        });
      }
    });

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
      exercises: prev.exercises.filter(e => e.categoryId !== id)
    }));
  };

  const addExercise = (ex: Omit<Exercise, 'id'>) => {
    setState(prev => ({ ...prev, exercises: [...prev.exercises, { ...ex, id: crypto.randomUUID() }] }));
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
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
    finishWorkout,
    cancelWorkout: () => setActiveDraft(null),
    addCategory,
    updateCategory,
    removeCategory,
    addExercise,
    updateExercise,
    removeExercise,
    exportData,
    importData,
    showDialog,
    dialog
  };
};
