
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
  // PUSH DAY - Chest (2), Shoulders (2), Triceps (1) = 5 exercises
  [DayType.Push]: [
    "Chest: Bench Press",
    "Chest: Incline Press",
    "Shoulders: Shoulder Press",
    "Shoulders: Lateral Raises",
    "Triceps: Cable Pushdowns"
  ],
  // PULL DAY - Back (2), Biceps (2), Rear Delts (1) = 5 exercises
  [DayType.Pull]: [
    "Back: Lat Pulldowns",
    "Back: Seated Row",
    "Biceps: EZ Bar Curls",
    "Biceps: Hammer Curls",
    "Rear Delts: Face Pulls"
  ],
  // LEGS DAY - Quads (2), Hamstrings (1), Calves (1) = 4 exercises
  [DayType.Legs]: [
    "Quads: Leg Press",
    "Quads: Leg Extensions",
    "Hamstrings: Lying Leg Curls",
    "Calves: Calf Raises"
  ],
  // UPPER DAY - Chest (1), Back (1), Shoulders (1), Biceps (1), Triceps (1) = 5 exercises
  [DayType.Upper]: [
    "Chest: Incline Dumbbell Press",
    "Back: Cable Row",
    "Shoulders: Arnold Press",
    "Biceps: Preacher Curls",
    "Triceps: Overhead Extension"
  ],
  // LOWER DAY - Quads (2), Hamstrings (1), Calves (1) = 4 exercises
  [DayType.Lower]: [
    "Quads: Squats",
    "Quads: Lunges",
    "Hamstrings: Romanian Deadlift",
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
