
import { DayType } from './types';

export const WEEKLY_SCHEDULE: Record<number, DayType> = {
  1: DayType.ChestTriceps, // Monday
  2: DayType.BackAbs,      // Tuesday
  3: DayType.BicepsShoulders, // Wednesday
  4: DayType.ChestTriceps, // Thursday
  5: DayType.LegsRearDeltForearms, // Friday
  6: DayType.Rest,         // Saturday
  0: DayType.Rest          // Sunday
};

export const DEFAULT_EXERCISES: Record<DayType, string[]> = {
  [DayType.ChestTriceps]: [
    "Chest: Chest Press",
    "Chest: Incline Press",
    "Chest: Dips",
    "Triceps: Cable Pushdowns",
    "Triceps: Rope Extensions"
  ],
  [DayType.BackAbs]: [
    "Back: Deadlifts",
    "Back: Lat Pulldowns",
    "Back: High Row",
    "Back: ISO-Lateral Row",
    "Abs: Machine Crunches",
    "Abs: Hanging Leg Raises"
  ],
  [DayType.BicepsShoulders]: [
    "Biceps: EZ Bar Curls",
    "Biceps: Hammer Curls",
    "Biceps: Preacher Machine Curls",
    "Biceps: Cable Curls",
    "Shoulders: Shoulder Press",
    "Shoulders: Lateral Raises"
  ],
  [DayType.LegsRearDeltForearms]: [
    "Legs: Leg Press",
    "Legs: Leg Extensions",
    "Legs: Lying Leg Curls",
    "Rear Delt: Rear Delt Fly",
    "Forearms: Dumbbell Curls"
  ],
  [DayType.Rest]: []
};
