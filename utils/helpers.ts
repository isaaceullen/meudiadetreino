
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getTodayDateISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getTodayWeekdayName = (): string => {
  // Retorna 'Monday', 'Tuesday', etc. em inglês para padronização interna
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
};

export const GROUP_IDS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export const WEEKDAYS_EN = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const WEEKDAYS_PT: Record<string, string> = {
  'Monday': 'Segunda',
  'Tuesday': 'Terça',
  'Wednesday': 'Quarta',
  'Thursday': 'Quinta',
  'Friday': 'Sexta',
  'Saturday': 'Sábado',
  'Sunday': 'Domingo'
};
