export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getTodayDateISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
};

// Removed playBeep in favor of Audio file in component
// Removed WEEKDAYS_LABELS