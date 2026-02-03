
import { DayType } from './types';

export const WEEKLY_SCHEDULE: Record<number, DayType> = {
  1: DayType.ChestTriceps, // Monday
  2: DayType.BackAbs,      // Tuesday
  3: DayType.Biceps,       // Wednesday
  4: DayType.ChestTriceps, // Thursday
  5: DayType.LegsRearDeltForearms, // Friday
  6: DayType.Rest,         // Saturday
  0: DayType.Rest          // Sunday
};

export const DEFAULT_EXERCISES: Record<DayType, string[]> = {
  [DayType.ChestTriceps]: [
    "Chest Press", 
    "Incline Press", 
    "Dips",
    "Cable Tricep Pushdowns", 
    "Rope Extensions"
  ],
  [DayType.BackAbs]: [
    "Back: Deadlifts",
    "Back: Lat Pulldowns",
    "Back: High Row", 
    "Back: ISO-Lateral Row",
    "Abs: Machine Crunches",
    "Abs: Hanging Leg Raises"
  ],
  [DayType.Biceps]: [
    "EZ Bar Curls", 
    "Hammer Curls", 
    "Preacher Machine Curls", 
    "Cable Bicep Curls"
  ],
  [DayType.LegsRearDeltForearms]: [
    "Leg Press", 
    "Leg Extensions", 
    "Lying Leg Curls", 
    "Rear Delt Fly", 
    "Dumbbell Forearm Curls"
  ],
  [DayType.Rest]: []
};
