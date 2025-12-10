
export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Category {
  id: string;
  name: string;
  isDefault?: boolean;
  group?: GroupId; // A, B, C...
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
  categories: Category[];
  settings: {
    soundEnabled: boolean;
    restTimerDefault: number;
    autoTimer: boolean;
    groupSchedule: Record<GroupId, string>; // Mapeia 'A' -> 'Monday', etc.
  };
}

export type Tab = 'dashboard' | 'exercises' | 'history' | 'progress' | 'settings';
