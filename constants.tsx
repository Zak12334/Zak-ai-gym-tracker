
import { DayType } from './types';

// PPLUL Split - Push/Pull/Legs/Rest/Upper/Lower/Rest
// Hits each muscle group 2x per week with reasonable volume
export const WEEKLY_SCHEDULE: Record<number, DayType> = {
  1: DayType.Push,   // Monday
  2: DayType.Pull,   // Tuesday
  3: DayType.Legs,   // Wednesday
  4: DayType.Rest,   // Thursday (mid-week rest)
  5: DayType.Upper,  // Friday
  6: DayType.Lower,  // Saturday
  0: DayType.Rest    // Sunday
};

export const DEFAULT_EXERCISES: Record<DayType, string[]> = {
  // PUSH DAY - 3 exercises total
  [DayType.Push]: [
    "Chest: Chest Press",
    "Shoulders: Shoulder Press",
    "Triceps: Cable Pushdowns"
  ],
  // PULL DAY - 3 exercises total
  [DayType.Pull]: [
    "Back: Lat Pulldowns",
    "Biceps: EZ Bar Curls",
    "Rear Delt: Rear Delt Fly"
  ],
  // LEGS DAY - 3 exercises total
  [DayType.Legs]: [
    "Legs: Leg Press",
    "Legs: Lying Leg Curls",
    "Calves: Calf Raises"
  ],
  // UPPER DAY - 5 exercises (1 per muscle)
  [DayType.Upper]: [
    "Chest: Incline Press",
    "Back: High Row",
    "Shoulders: Lateral Raises",
    "Biceps: Hammer Curls",
    "Triceps: Rope Extensions"
  ],
  // LOWER DAY - 3 exercises total
  [DayType.Lower]: [
    "Legs: Leg Extensions",
    "Legs: Leg Curls",
    "Calves: Seated Calf Raise"
  ],
  [DayType.Rest]: [],
  // Legacy day types (for backwards compatibility with old sessions)
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
  ]
};
