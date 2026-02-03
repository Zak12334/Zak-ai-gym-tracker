
export interface Set {
  id: string;
  weight: number;
  reps: number;
  timestamp: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string
  startTime: number;
  endTime?: number;
  duration?: number; // seconds
  type: string; // e.g., "Chest & Triceps"
  exercises: Exercise[];
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
}

export enum DayType {
  ChestTriceps = "Chest & Triceps",
  BackAbs = "Back & Abs",
  Biceps = "Biceps",
  LegsRearDeltForearms = "Legs, Rear Delt & Forearms",
  Rest = "Rest Day"
}

export interface ProgressionReport {
  summary: string;
  strengthTrend: 'increasing' | 'stable' | 'decreasing';
  topPerformers: string[];
  recommendations: string[];
  volumeTrend: { date: string; volume: number }[];
}
