
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
  muscleGroup?: string; // Track which section this exercise belongs to
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

// Workout split types
export type SplitType = 'ppl' | 'bro' | 'upper_lower' | 'full_body' | 'custom';

export interface WorkoutSplit {
  type: SplitType;
  days: string[]; // e.g., ['Push', 'Pull', 'Legs']
  restPattern: number; // rest after every X workout days (e.g., 3 = PPL then rest)
  currentDayIndex: number; // which day they started on (0-based)
  startDate: string; // ISO date when they started
}

export const PRESET_SPLITS: Record<Exclude<SplitType, 'custom'>, { name: string; days: string[]; restPattern: number }> = {
  ppl: {
    name: 'Push/Pull/Legs',
    days: ['Push', 'Pull', 'Legs'],
    restPattern: 6 // PPL PPL Rest
  },
  bro: {
    name: 'Bro Split',
    days: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'],
    restPattern: 5 // 5 days then rest
  },
  upper_lower: {
    name: 'Upper/Lower',
    days: ['Upper', 'Lower'],
    restPattern: 4 // Upper Lower Upper Lower Rest
  },
  full_body: {
    name: 'Full Body',
    days: ['Full Body'],
    restPattern: 2 // Full Body, Rest, Full Body, Rest
  }
};

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

// Gender and activity level types
export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export const ACTIVITY_LEVELS: Record<ActivityLevel, { label: string; multiplier: number; description: string }> = {
  sedentary: { label: 'Sedentary', multiplier: 1.2, description: 'Little or no exercise' },
  light: { label: 'Lightly Active', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
  moderate: { label: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
  active: { label: 'Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
  very_active: { label: 'Very Active', multiplier: 1.9, description: 'Very hard exercise & physical job' }
};

// Extended user profile for authentication
export interface AuthUserProfile {
  id: string;
  user_id: string; // Supabase Auth user id
  email: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  gender?: Gender;
  activity_level?: ActivityLevel;
  calorie_goal?: number;
  protein_goal?: number;
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
