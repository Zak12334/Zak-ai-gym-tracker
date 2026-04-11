
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
  bestSet: { weight: number; reps: number; volume: number; estimated1RM: number };
  totalVolume: number;
}

/**
 * Estimate 1 Rep Max using Epley formula
 * This gives a strength-based comparison that properly values weight increases
 * Formula: 1RM = weight × (1 + reps/30)
 */
export const estimateOneRepMax = (weight: number, reps: number): number => {
  if (reps === 0 || weight === 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

export interface SmartTarget {
  hasData: boolean;
  sessionCount: number;
  lastSession: ExerciseHistoryEntry | null;
  daysSinceLastSession: number | null;
  missedLastWeek: boolean;
  trend: 'progressing' | 'maintaining' | 'regressing' | 'unknown';
  plateauDetected: boolean;
  weightIncreasePhase: boolean; // NEW: true when user moved to higher weight with fewer reps
  targetWeight: number | null;
  targetReps: number | null;
  repGoal: number | null; // NEW: target reps to reach before next weight increase (usually 8-10)
  message: string;
  confidence: string;
}

/**
 * Get exercise history filtered by workout type (only compare like-for-like sessions)
 * If skipTypeFilter is true, matches exercise across ALL session types (for admin cross-split tracking)
 */
export const getExerciseHistory = (
  exerciseName: string,
  history: WorkoutSession[],
  workoutType: string,
  skipTypeFilter: boolean = false
): ExerciseHistoryEntry[] => {
  const normalizedName = exerciseName.trim().toLowerCase();
  const entries: ExerciseHistoryEntry[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter sessions by workout type and look back 8 weeks
  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  for (const session of history) {
    // Only compare same workout type (unless admin cross-split mode)
    if (!skipTypeFilter && session.type !== workoutType) continue;

    const sessionDate = new Date(session.date);
    if (sessionDate < eightWeeksAgo) continue;

    const exercise = session.exercises.find(
      ex => ex.name.trim().toLowerCase() === normalizedName
    );

    if (exercise && exercise.sets.length > 0) {
      const daysSinceToday = Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Find best set by estimated 1RM (strength-based, not just volume)
      // This properly values weight increases even with fewer reps
      let bestSet = { weight: 0, reps: 0, volume: 0, estimated1RM: 0 };
      let totalVolume = 0;

      for (const set of exercise.sets) {
        const setVolume = set.weight * set.reps;
        const set1RM = estimateOneRepMax(set.weight, set.reps);
        totalVolume += setVolume;
        // Compare by estimated 1RM, not volume
        if (set1RM > bestSet.estimated1RM) {
          bestSet = { weight: set.weight, reps: set.reps, volume: setVolume, estimated1RM: set1RM };
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
 * Calculate trend based on ESTIMATED 1RM progression over last 4 sessions
 * This properly recognizes strength gains when weight increases with fewer reps
 *
 * Example: 22.5kg × 10 = ~30kg 1RM → 30kg × 5 = ~35kg 1RM = PROGRESSING (not regressing!)
 */
const calculateTrend = (
  entries: ExerciseHistoryEntry[]
): 'progressing' | 'maintaining' | 'regressing' | 'unknown' => {
  if (entries.length < 2) return 'unknown';

  const recent = entries.slice(0, Math.min(4, entries.length));
  let improving = 0;
  let declining = 0;

  for (let i = 0; i < recent.length - 1; i++) {
    // Use estimated 1RM for comparison - this values strength, not just volume
    const current1RM = recent[i].bestSet.estimated1RM;
    const previous1RM = recent[i + 1].bestSet.estimated1RM;

    // Allow 2% tolerance for "maintaining" to avoid noise
    const changePercent = (current1RM - previous1RM) / previous1RM;

    if (changePercent > 0.02) improving++;
    else if (changePercent < -0.02) declining++;
  }

  if (improving > declining) return 'progressing';
  if (declining > improving) return 'regressing';
  return 'maintaining';
};

/**
 * Detect if user is in a "weight increase phase"
 * This is when they moved to a heavier weight with fewer reps (progressive overload pattern)
 */
const detectWeightIncreasePhase = (entries: ExerciseHistoryEntry[]): boolean => {
  if (entries.length < 2) return false;

  const current = entries[0].bestSet;
  const previous = entries[1].bestSet;

  // Weight increased but reps decreased = building at new weight
  return current.weight > previous.weight && current.reps < previous.reps;
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
 * Uses 1RM-based progression to properly recognize strength gains
 */
export const calculateSmartTarget = (
  exerciseName: string,
  history: WorkoutSession[],
  workoutType: string,
  skipTypeFilter: boolean = false
): SmartTarget => {
  const entries = getExerciseHistory(exerciseName, history, workoutType, skipTypeFilter);
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
      weightIncreasePhase: false,
      targetWeight: null,
      targetReps: null,
      repGoal: null,
      message: "New exercise — find your working weight. Log today to start tracking.",
      confidence: "No data yet"
    };
  }

  const lastSession = entries[0];
  const daysSinceLastSession = lastSession.daysSinceToday;
  const missedLastWeek = daysSinceLastSession > 7;
  const { weight: lastWeight, reps: lastReps } = lastSession.bestSet;

  // Standard rep goal before suggesting weight increase
  const REP_GOAL = 10;

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
      weightIncreasePhase: false,
      targetWeight: lastWeight,
      targetReps: lastReps,
      repGoal: REP_GOAL,
      message,
      confidence: "First session logged"
    };
  }

  // 2+ sessions: analyze trend and weight increase phase
  const trend = calculateTrend(entries);
  const weightIncreasePhase = detectWeightIncreasePhase(entries);

  if (sessionCount <= 3) {
    let targetWeight = lastWeight;
    let targetReps = lastReps;
    let message = `Last: ${lastWeight}kg × ${lastReps}`;

    if (missedLastWeek) {
      message = `Missed last week. Last session: ${lastWeight}kg × ${lastReps}. Match this today.`;
    } else if (weightIncreasePhase) {
      // User moved to higher weight - encourage rep building!
      targetReps = lastReps + 1;
      message = `Great weight increase! Build to ${targetReps} reps at ${lastWeight}kg`;
    } else if (trend === 'progressing' && lastReps >= REP_GOAL - 2) {
      // Ready for weight increase
      targetWeight = lastWeight + 2.5;
      targetReps = Math.max(5, lastReps - 3); // Drop reps when going heavier
      message = `Strong! Time to go heavier: ${targetWeight}kg × ${targetReps}+ reps`;
    } else if (trend === 'progressing') {
      // Keep building reps at current weight
      targetReps = lastReps + 1;
      message = `Progressing! Push for ${lastWeight}kg × ${targetReps} reps`;
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
      weightIncreasePhase,
      targetWeight,
      targetReps,
      repGoal: REP_GOAL,
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
  } else if (weightIncreasePhase) {
    // User moved to higher weight - this is GOOD, help them build reps
    targetReps = lastReps + 1;
    const repsToGo = REP_GOAL - lastReps;
    if (repsToGo > 0) {
      message = `Building at new weight! Target: ${lastWeight}kg × ${targetReps} reps (${repsToGo} to go until ${REP_GOAL})`;
    } else {
      // They've hit rep goal, ready for another increase
      targetWeight = lastWeight + 2.5;
      targetReps = Math.max(5, lastReps - 3);
      message = `Crushed it at ${lastWeight}kg! Go heavier: ${targetWeight}kg × ${targetReps}+ reps`;
    }
  } else if (plateauDetected && lastReps < REP_GOAL - 2) {
    // Plateau at low reps - might need to adjust
    const deloadWeight = Math.round((lastWeight * 0.9) / 2.5) * 2.5;
    message = `Plateau detected. Try ${deloadWeight}kg × ${lastReps + 2} reps or add a variation.`;
    targetWeight = deloadWeight;
    targetReps = lastReps + 2;
  } else if (plateauDetected) {
    // Plateau at good reps - time to go heavier
    targetWeight = lastWeight + 2.5;
    targetReps = Math.max(5, lastReps - 3);
    message = `Plateau at ${lastWeight}kg. Time to challenge yourself: ${targetWeight}kg × ${targetReps}+ reps`;
  } else if (trend === 'progressing' && lastReps >= REP_GOAL - 2) {
    // Progressing and hitting rep targets - time for weight increase
    targetWeight = lastWeight + 2.5;
    targetReps = Math.max(5, lastReps - 3);
    message = `Strong progress! Go heavier: ${targetWeight}kg × ${targetReps}+ reps`;
  } else if (trend === 'progressing') {
    // Progressing but still building reps
    targetReps = lastReps + 1;
    message = `Keep pushing! Target: ${lastWeight}kg × ${targetReps} reps`;
  } else if (trend === 'regressing') {
    // Actually regressing (same weight, fewer reps over multiple sessions)
    // Check if it's a recent weight increase they're struggling with
    const previousWeight = entries.length > 1 ? entries[1].bestSet.weight : lastWeight;
    if (lastWeight > previousWeight) {
      // They increased weight recently, give them time
      targetReps = lastReps + 1;
      message = `Building at ${lastWeight}kg. Target: ${targetReps} reps. You got this!`;
    } else {
      // Genuine regression at same weight - check form
      targetReps = lastReps + 1;
      message = `Focus on form. Target: ${lastWeight}kg × ${targetReps} solid reps`;
    }
  } else {
    // Maintaining
    targetReps = lastReps + 1;
    message = `Solid base. Push for ${lastWeight}kg × ${targetReps} reps (+1 rep)`;
  }

  return {
    hasData: true,
    sessionCount,
    lastSession,
    daysSinceLastSession,
    missedLastWeek,
    trend,
    plateauDetected,
    weightIncreasePhase,
    targetWeight,
    targetReps,
    repGoal: REP_GOAL,
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
