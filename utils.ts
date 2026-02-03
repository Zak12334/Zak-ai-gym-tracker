
import { WEEKLY_SCHEDULE } from './constants';
import { DayType, WorkoutSession, Exercise } from './types';

export const getWorkoutForToday = (): DayType => {
  const day = new Date().getDay();
  return WEEKLY_SCHEDULE[day] || DayType.Rest;
};

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

export const calculateSessionVolume = (session: WorkoutSession): number => {
  return session.exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0);
  }, 0);
};

export const getLastPerformanceForExercise = (history: WorkoutSession[], exerciseName: string): Exercise | null => {
  for (const session of history) {
    const found = session.exercises.find(ex => ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
    if (found && found.sets.length > 0) return found;
  }
  return null;
};

export const generateUUID = () => Math.random().toString(36).substr(2, 9);
