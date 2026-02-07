
import { WEEKLY_SCHEDULE } from './constants';
import { DayType, WorkoutSession, Exercise, Set, SplitType, PRESET_SPLITS, Gender, ActivityLevel, ACTIVITY_LEVELS } from './types';

// Original function for Zak's hardcoded schedule (profiles without split_type)
export const getWorkoutForToday = (): DayType => {
  const day = new Date().getDay();
  return WEEKLY_SCHEDULE[day] || DayType.Rest;
};

// New function for user-specific splits
export interface UserSplitConfig {
  split_type: SplitType | null;
  split_days: string[] | null;
  split_rest_pattern: number | null;
  split_current_day_index: number | null;
  split_start_date: string | null;
}

export const getWorkoutForUser = (profile: UserSplitConfig): string => {
  // If no split configured, fall back to original schedule (for Zak's profile)
  if (!profile.split_type || !profile.split_days || profile.split_start_date === null) {
    return getWorkoutForToday();
  }

  const { split_days, split_rest_pattern, split_current_day_index, split_start_date } = profile;
  const restPattern = split_rest_pattern || split_days.length;

  // Calculate days since start
  const startDate = new Date(split_start_date);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate cycle length (workout days + rest day)
  const cycleLength = restPattern + 1;

  // Where they started in the rotation (which workout day)
  const startOffset = split_current_day_index !== null && split_current_day_index >= 0
    ? split_current_day_index
    : 0;

  // Total days into the rotation
  const totalDaysIntoRotation = startOffset + daysSinceStart;

  // Position in current cycle
  const positionInCycle = totalDaysIntoRotation % cycleLength;

  // If position is >= number of workout days in the pattern, it's a rest day
  if (positionInCycle >= restPattern) {
    return 'Rest Day';
  }

  // Otherwise, return the appropriate workout day
  const workoutDayIndex = positionInCycle % split_days.length;
  return split_days[workoutDayIndex];
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

export const generateUUID = (): string => {
  // Try to use crypto.randomUUID if available (secure contexts)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback to a simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Smart Targets - Exercise History Analysis

export interface ExerciseHistoryEntry {
  date: string;
  daysSinceToday: number;
  sets: Set[];
  bestSet: { weight: number; reps: number; volume: number };
  totalVolume: number;
}

export interface SmartTarget {
  hasData: boolean;
  sessionCount: number;
  lastSession: ExerciseHistoryEntry | null;
  daysSinceLastSession: number | null;
  missedLastWeek: boolean;
  trend: 'progressing' | 'maintaining' | 'regressing' | 'unknown';
  plateauDetected: boolean;
  targetWeight: number | null;
  targetReps: number | null;
  message: string;
  confidence: string;
}

/**
 * Get exercise history filtered by workout type (only compare like-for-like sessions)
 */
export const getExerciseHistory = (
  exerciseName: string,
  history: WorkoutSession[],
  workoutType: string
): ExerciseHistoryEntry[] => {
  const normalizedName = exerciseName.trim().toLowerCase();
  const entries: ExerciseHistoryEntry[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter sessions by workout type and look back 8 weeks
  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  for (const session of history) {
    // Only compare same workout type
    if (session.type !== workoutType) continue;

    const sessionDate = new Date(session.date);
    if (sessionDate < eightWeeksAgo) continue;

    const exercise = session.exercises.find(
      ex => ex.name.trim().toLowerCase() === normalizedName
    );

    if (exercise && exercise.sets.length > 0) {
      const daysSinceToday = Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Find best set (highest volume = weight × reps)
      let bestSet = { weight: 0, reps: 0, volume: 0 };
      let totalVolume = 0;

      for (const set of exercise.sets) {
        const setVolume = set.weight * set.reps;
        totalVolume += setVolume;
        if (setVolume > bestSet.volume) {
          bestSet = { weight: set.weight, reps: set.reps, volume: setVolume };
        }
      }

      entries.push({
        date: session.date,
        daysSinceToday,
        sets: exercise.sets,
        bestSet,
        totalVolume
      });
    }
  }

  // Sort by date descending (most recent first)
  return entries.sort((a, b) => a.daysSinceToday - b.daysSinceToday);
};

/**
 * Calculate trend based on best set progression over last 4 sessions
 */
const calculateTrend = (
  entries: ExerciseHistoryEntry[]
): 'progressing' | 'maintaining' | 'regressing' | 'unknown' => {
  if (entries.length < 2) return 'unknown';

  const recent = entries.slice(0, Math.min(4, entries.length));
  let improving = 0;
  let declining = 0;

  for (let i = 0; i < recent.length - 1; i++) {
    const current = recent[i].bestSet.volume;
    const previous = recent[i + 1].bestSet.volume;

    if (current > previous) improving++;
    else if (current < previous) declining++;
  }

  if (improving > declining) return 'progressing';
  if (declining > improving) return 'regressing';
  return 'maintaining';
};

/**
 * Detect plateau (3+ sessions with no meaningful progress)
 */
const detectPlateau = (entries: ExerciseHistoryEntry[]): boolean => {
  if (entries.length < 3) return false;

  const recent = entries.slice(0, 3);
  const volumes = recent.map(e => e.bestSet.volume);
  const maxVolume = Math.max(...volumes);
  const minVolume = Math.min(...volumes);

  // If variance is less than 5%, consider it a plateau
  return (maxVolume - minVolume) / maxVolume < 0.05;
};

/**
 * Calculate Smart Target for an exercise based on history
 */
export const calculateSmartTarget = (
  exerciseName: string,
  history: WorkoutSession[],
  workoutType: string
): SmartTarget => {
  const entries = getExerciseHistory(exerciseName, history, workoutType);
  const sessionCount = entries.length;

  // Base case: no data
  if (sessionCount === 0) {
    return {
      hasData: false,
      sessionCount: 0,
      lastSession: null,
      daysSinceLastSession: null,
      missedLastWeek: false,
      trend: 'unknown',
      plateauDetected: false,
      targetWeight: null,
      targetReps: null,
      message: "New exercise — find your working weight. Log today to start tracking.",
      confidence: "No data yet"
    };
  }

  const lastSession = entries[0];
  const daysSinceLastSession = lastSession.daysSinceToday;
  const missedLastWeek = daysSinceLastSession > 7;
  const { weight: lastWeight, reps: lastReps } = lastSession.bestSet;

  // 1 session: just show reference
  if (sessionCount === 1) {
    let message = `Last time: ${lastWeight}kg × ${lastReps} reps`;
    if (daysSinceLastSession > 0) {
      message += ` (${daysSinceLastSession} days ago)`;
    }
    if (missedLastWeek) {
      message += ". Missed last week — ease back in if needed.";
    } else {
      message += ". Try to match or beat it.";
    }

    return {
      hasData: true,
      sessionCount: 1,
      lastSession,
      daysSinceLastSession,
      missedLastWeek,
      trend: 'unknown',
      plateauDetected: false,
      targetWeight: lastWeight,
      targetReps: lastReps,
      message,
      confidence: "First session logged"
    };
  }

  // 2-3 sessions: basic analysis
  const trend = calculateTrend(entries);

  if (sessionCount <= 3) {
    let targetWeight = lastWeight;
    let targetReps = lastReps;
    let message = `Last: ${lastWeight}kg × ${lastReps}`;

    if (missedLastWeek) {
      message = `Missed last week. Last session: ${lastWeight}kg × ${lastReps}. Match this today.`;
    } else if (trend === 'progressing') {
      targetWeight = lastWeight + 2.5;
      message = `Progressing! Try ${targetWeight}kg × ${lastReps} reps`;
    } else {
      message = `Target: ${targetWeight}kg × ${targetReps} reps`;
    }

    return {
      hasData: true,
      sessionCount,
      lastSession,
      daysSinceLastSession,
      missedLastWeek,
      trend,
      plateauDetected: false,
      targetWeight,
      targetReps,
      message,
      confidence: "Building data..."
    };
  }

  // 4+ sessions: full analysis
  const plateauDetected = detectPlateau(entries);
  let targetWeight = lastWeight;
  let targetReps = lastReps;
  let message = "";

  if (missedLastWeek) {
    // Came back after missed week - match last session
    message = `Back after ${daysSinceLastSession} days. Target: match ${lastWeight}kg × ${lastReps}`;
  } else if (plateauDetected) {
    // Plateau detected
    const deloadWeight = Math.round((lastWeight * 0.9) / 2.5) * 2.5;
    message = `Plateau detected (3 sessions flat). Consider deload to ${deloadWeight}kg or try a variation.`;
    targetWeight = deloadWeight;
  } else if (trend === 'progressing') {
    // Progressing - suggest increase
    targetWeight = lastWeight + 2.5;
    message = `Strong progress! Push for ${targetWeight}kg × ${lastReps} reps`;
  } else if (trend === 'regressing') {
    // Regressing - suggest drop and rebuild
    targetWeight = Math.round((lastWeight * 0.9) / 2.5) * 2.5;
    message = `Form check: drop to ${targetWeight}kg, focus on ${lastReps + 2} clean reps`;
  } else {
    // Maintaining
    targetReps = lastReps + 1;
    message = `Solid base. Try ${lastWeight}kg × ${targetReps} reps (+1 rep)`;
  }

  return {
    hasData: true,
    sessionCount,
    lastSession,
    daysSinceLastSession,
    missedLastWeek,
    trend,
    plateauDetected,
    targetWeight,
    targetReps,
    message,
    confidence: `Based on ${sessionCount} sessions`
  };
};

/**
 * Get days since last session of a specific workout type
 */
export const getDaysSinceLastWorkoutType = (
  history: WorkoutSession[],
  workoutType: string
): number | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const session of history) {
    if (session.type === workoutType) {
      const sessionDate = new Date(session.date);
      return Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  }
  return null;
};

// ============================================
// Nutrition Calculations (Mifflin-St Jeor)
// ============================================

/**
 * Calculate BMR using Mifflin-St Jeor equation
 * - Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
 * - Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
 */
export const calculateBMR = (
  weight: number, // kg
  height: number, // decimal feet (e.g., 5.75 for 5'9")
  age: number,
  gender: Gender
): number => {
  // Convert height from decimal feet to cm
  const heightInCm = height * 30.48;

  const baseBMR = (10 * weight) + (6.25 * heightInCm) - (5 * age);

  if (gender === 'male') {
    return Math.round(baseBMR + 5);
  } else {
    return Math.round(baseBMR - 161);
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × activity multiplier
 */
export const calculateTDEE = (
  bmr: number,
  activityLevel: ActivityLevel
): number => {
  const multiplier = ACTIVITY_LEVELS[activityLevel].multiplier;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate protein goal based on body weight
 * Using 1.8g per kg (middle ground for muscle building)
 */
export const calculateProteinGoal = (weight: number): number => {
  return Math.round(weight * 1.8);
};

/**
 * Calculate all nutrition goals from user stats
 */
export interface NutritionCalculation {
  bmr: number;
  tdee: number; // maintenance calories
  protein: number; // grams
  carbs: number; // grams (roughly 45% of remaining calories)
  fat: number; // grams (roughly 25% of calories)
}

export const calculateNutritionGoals = (
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): NutritionCalculation => {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const protein = calculateProteinGoal(weight);

  // Calculate protein calories (4 cal/g)
  const proteinCalories = protein * 4;
  const remainingCalories = tdee - proteinCalories;

  // Fat: ~25% of total calories (9 cal/g)
  const fat = Math.round((tdee * 0.25) / 9);

  // Carbs: remaining calories (4 cal/g)
  const fatCalories = fat * 9;
  const carbs = Math.round((remainingCalories - (fatCalories - (tdee * 0.25))) / 4);

  return {
    bmr,
    tdee,
    protein,
    carbs: Math.max(carbs, 100), // minimum 100g carbs
    fat
  };
};
