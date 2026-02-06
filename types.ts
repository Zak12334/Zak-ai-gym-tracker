
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
  BicepsShoulders = "Biceps & Shoulders",
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

// Nutrition tracking types
export interface FoodLog {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number; // grams or ml depending on unit
  unit: 'g' | 'ml'; // grams for solids, ml for liquids
  source: 'manual' | 'barcode' | 'ai';
}

// Extended user profile for authentication
export interface AuthUserProfile {
  id: string;
  user_id: string; // Supabase Auth user id
  email: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  created_at?: string;
}

export interface WaterLog {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: number;
  amount: number; // ml
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalWater: number; // ml
  foods: FoodLog[];
  waterLogs: WaterLog[];
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // ml
}
