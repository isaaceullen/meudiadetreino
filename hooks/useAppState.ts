
// hooks/useAppState.ts
import { useState, useEffect } from 'react';
import { AppState, Category, Exercise, WorkoutLog, Schedule, GroupLetter } from '../types';

const STORAGE_KEY = 'meu_dia_de_treino_v2';

const INITIAL_STATE: AppState = {
  categories: [],
  exercises: [],
  schedule: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
  logs: [],
  sessions: [],
  settings: {
    autoTimer: true,
    restTimeSeconds: 60
  },
  history: []
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addCategory = (name: string, groupLetter: GroupLetter) => {
    const newCat: Category = { id: crypto.randomUUID(), name, groupLetter };
    setState(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
  };

  const removeCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      exercises: prev.exercises.filter(e => e.categoryId !== id)
    }));
  };

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newEx: Exercise = { ...exercise, id: crypto.randomUUID() } as Exercise;
    setState(prev => ({ ...prev, exercises: [...prev.exercises, newEx] }));
  };

  const updateExercise = (exercise: Exercise) => {
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === exercise.id ? exercise : e)
    }));
  };

  const removeExercise = (id: string) => {
    setState(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== id) }));
  };

  const updateSchedule = (dayIndex: number, group: GroupLetter | null) => {
    setState(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [dayIndex]: group }
    }));
  };

  const finishWorkout = (groupLetter: GroupLetter, completedExercises: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    const newLog: WorkoutLog = {
      id: crypto.randomUUID(),
      date: today,
      groupLetter,
      completedExercises
    };
    setState(prev => ({ ...prev, logs: [...(prev.logs || []), newLog] }));
  };

  const clearAllData = () => {
    if (confirm('Deseja realmente apagar TODOS os dados?')) {
      setState(INITIAL_STATE);
    }
  };

  return {
    state,
    addCategory,
    removeCategory,
    addExercise,
    updateExercise,
    removeExercise,
    updateSchedule,
    finishWorkout,
    clearAllData
  };
};
