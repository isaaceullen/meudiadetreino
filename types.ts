
export type GroupLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export const GROUPS: GroupLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

// DayId and DAY_NAMES for scheduling and display
export type DayId = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado'
};

export interface Category {
  id: string;
  name: string;
  groupLetter: GroupLetter;
}

export interface Exercise {
  id: string;
  name: string;
  categoryId: string;
  defaultSets: number;
  defaultReps: number;
  initialLoad: number;
  viewUrl?: string;
  url?: string; // Compatibility with screens/Dashboard.tsx
  notes?: string;
  // Compatibility fields for constants.tsx and various managers
  equipment?: string;
  weekdays?: number[];
  restTime?: number;
  load?: number;
  sets?: number;
  reps?: number;
  category?: string;
}

export interface SeriesEntry {
  id: string;
  load: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutDraft {
  startTime: number;
  selectedGroups: GroupLetter[];
  exercises: {
    [exerciseId: string]: SeriesEntry[];
  };
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: number;
  endTime: number;
  durationMinutes: number;
  volume: number;
  totalSeries: number;
  notes: string;
  groups: GroupLetter[];
  details: {
    exerciseId: string;
    exerciseName: string;
    series: { load: number; reps: number }[];
  }[];
}

// WorkoutLog for simple session tracking
export interface WorkoutLog {
  id: string;
  date: string;
  groupLetter: GroupLetter;
  completedExercises: string[];
}

// Schedule maps day index to a group
export type Schedule = Record<number, GroupLetter | null>;

// WorkoutHistory used in Progress and constants
export interface WorkoutHistory {
  id: string;
  exerciseId: string;
  exerciseName: string;
  load: number;
  reps: number;
  sets: number;
  date: string;
}

export interface AppSettings {
  autoTimer: boolean;
  restTimeSeconds: number;
}

export interface AppState {
  categories: Category[];
  exercises: Exercise[];
  sessions: Session[];
  settings: AppSettings;
  schedule: Schedule;
  logs: WorkoutLog[];
  history: WorkoutHistory[];
}
