export interface Category {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  equipment: string;
  targetSets: number;
  targetReps: number;
  videoUrl?: string;
  note?: string;
  categoryId: string; // Link para a entidade Category
}

export interface SetLog {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  timestamp: number;
}

export interface SessionExercise {
  exerciseId: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  startTime: number;
  endTime?: number;
  exercises: Record<string, SessionExercise>; // Keyed by exerciseId
  note?: string;
}

export interface AppState {
  exercises: Exercise[];
  sessions: WorkoutSession[];
  categories: Category[]; // Nova lista de categorias
  settings: {
    soundEnabled: boolean;
    restTimerDefault: number;
    autoTimer: boolean; // Novo ajuste
  };
}

export type Tab = 'dashboard' | 'exercises' | 'history' | 'progress' | 'settings';