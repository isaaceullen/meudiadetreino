// constants.tsx
import { AppState } from './types';

// Exporta a chave de API injetada pelo Vite durante o build
// ATENÇÃO: Como estamos usando 'define' no vite.config.ts, esta variável será
// substituída pelo valor real da chave no momento da compilação.
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export const INITIAL_DATA: AppState = {
  categories: [],
  sessions: [],
  settings: {
    autoTimer: true,
    restTimeSeconds: 60
  },
  schedule: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
  logs: [],
  exercises: [
    {
      id: '1',
      name: 'Supino Reto',
      categoryId: 'A',
      load: 60,
      reps: 10,
      sets: 3,
      weekdays: [1, 4],
      equipment: 'Barra',
      restTime: 60,
      defaultSets: 3,
      defaultReps: 10,
      initialLoad: 60
    },
    {
      id: '2',
      name: 'Agachamento Livre',
      categoryId: 'B',
      load: 80,
      reps: 12,
      sets: 4,
      weekdays: [2, 5],
      equipment: 'Halter',
      restTime: 90,
      defaultSets: 4,
      defaultReps: 12,
      initialLoad: 80
    },
    {
      id: '3',
      name: 'Puxada Aberta',
      categoryId: 'C',
      load: 50,
      reps: 10,
      sets: 3,
      weekdays: [3, 6],
      equipment: 'Polia',
      restTime: 60,
      defaultSets: 3,
      defaultReps: 10,
      initialLoad: 50
    }
  ],
  history: [
    {
      id: 'h1',
      exerciseId: '1',
      exerciseName: 'Supino Reto',
      load: 50,
      reps: 10,
      sets: 3,
      date: '2024-12-10T10:00:00Z'
    },
    {
      id: 'h2',
      exerciseId: '1',
      exerciseName: 'Supino Reto',
      load: 55,
      reps: 10,
      sets: 3,
      date: '2024-12-14T10:00:00Z'
    },
    {
      id: 'h3',
      exerciseId: '1',
      exerciseName: 'Supino Reto',
      load: 60,
      reps: 10,
      sets: 3,
      date: '2024-12-18T10:00:00Z'
    }
  ]
};