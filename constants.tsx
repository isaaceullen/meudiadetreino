import { AppState } from './types';

// Esta declaração permite que o TypeScript reconheça a variável que o Vite vai injetar
declare const process: { env: { GEMINI_API_KEY: string } };

// Exporta a chave para ser usada em toda a aplicação
export const API_KEY = process.env.GEMINI_API_KEY || '';

export const INITIAL_DATA: AppState = {
  categories: [],
  sessions: [],
  settings: {
    autoTimer: true,
    restTimeSeconds: 60
  },
  // Inicializa com arrays vazios para o agendamento múltiplo
  schedule: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  logs: [],
  exercises: [],
  history: []
};