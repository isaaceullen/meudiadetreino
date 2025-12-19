
import { useState, useEffect } from 'react';
import { AppState, Exercise, WorkoutHistory } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'meudiadetreino_data';

export const useWorkoutData = () => {
  const [data, setData] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addExercise = (exercise: Exercise) => {
    setData(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));
  };

  const updateExercise = (exercise: Exercise) => {
    setData(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === exercise.id ? exercise : e)
    }));
  };

  const deleteExercise = (id: string) => {
    setData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== id)
    }));
  };

  const addHistoryEntry = (entry: WorkoutHistory) => {
    setData(prev => ({
      ...prev,
      history: [...prev.history, entry]
    }));
  };

  const importData = (newData: AppState) => {
    setData(newData);
  };

  const resetData = () => {
    setData(INITIAL_DATA);
  };

  return {
    data,
    addExercise,
    updateExercise,
    deleteExercise,
    addHistoryEntry,
    importData,
    resetData
  };
};
