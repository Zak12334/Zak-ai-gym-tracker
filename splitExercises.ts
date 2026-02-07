// Default exercises for each muscle group
// These are common gym machines/exercises that new users will see

export interface MuscleGroupExercises {
  name: string;
  color: string;
  exercises: string[];
}

export interface WorkoutDayExercises {
  muscleGroups: MuscleGroupExercises[];
}

// Muscle group definitions with common exercises
const CHEST_EXERCISES: MuscleGroupExercises = {
  name: 'Chest',
  color: '#ef4444',
  exercises: ['Chest: Bench Press', 'Chest: Incline Press', 'Chest: Cable Fly', 'Chest: Pec Deck']
};

const TRICEPS_EXERCISES: MuscleGroupExercises = {
  name: 'Triceps',
  color: '#f97316',
  exercises: ['Triceps: Pushdown', 'Triceps: Overhead Extension', 'Triceps: Dips']
};

const SHOULDERS_EXERCISES: MuscleGroupExercises = {
  name: 'Shoulders',
  color: '#eab308',
  exercises: ['Shoulders: Shoulder Press', 'Shoulders: Lateral Raise', 'Shoulders: Front Raise']
};

const BACK_EXERCISES: MuscleGroupExercises = {
  name: 'Back',
  color: '#3b82f6',
  exercises: ['Back: Lat Pulldown', 'Back: Seated Row', 'Back: Cable Row', 'Back: Pull-ups']
};

const BICEPS_EXERCISES: MuscleGroupExercises = {
  name: 'Biceps',
  color: '#22c55e',
  exercises: ['Biceps: Bicep Curl', 'Biceps: Hammer Curl', 'Biceps: Preacher Curl']
};

const REAR_DELTS_EXERCISES: MuscleGroupExercises = {
  name: 'Rear Delts',
  color: '#8b5cf6',
  exercises: ['Rear Delts: Face Pulls', 'Rear Delts: Reverse Fly']
};

const LEGS_QUADS_EXERCISES: MuscleGroupExercises = {
  name: 'Quads',
  color: '#a855f7',
  exercises: ['Quads: Leg Press', 'Quads: Squats', 'Quads: Leg Extension', 'Quads: Lunges']
};

const LEGS_HAMSTRINGS_EXERCISES: MuscleGroupExercises = {
  name: 'Hamstrings',
  color: '#ec4899',
  exercises: ['Hamstrings: Leg Curl', 'Hamstrings: Romanian Deadlift']
};

const LEGS_GLUTES_EXERCISES: MuscleGroupExercises = {
  name: 'Glutes',
  color: '#f472b6',
  exercises: ['Glutes: Hip Thrust', 'Glutes: Cable Kickback']
};

const LEGS_CALVES_EXERCISES: MuscleGroupExercises = {
  name: 'Calves',
  color: '#06b6d4',
  exercises: ['Calves: Calf Raise', 'Calves: Seated Calf Raise']
};

const ABS_EXERCISES: MuscleGroupExercises = {
  name: 'Abs',
  color: '#14b8a6',
  exercises: ['Abs: Cable Crunch', 'Abs: Hanging Leg Raise', 'Abs: Ab Roller']
};

// Workout day configurations for different splits
export const SPLIT_DAY_EXERCISES: Record<string, WorkoutDayExercises> = {
  // PPL Split
  'Push': {
    muscleGroups: [CHEST_EXERCISES, SHOULDERS_EXERCISES, TRICEPS_EXERCISES]
  },
  'Pull': {
    muscleGroups: [BACK_EXERCISES, BICEPS_EXERCISES, REAR_DELTS_EXERCISES]
  },
  'Legs': {
    muscleGroups: [LEGS_QUADS_EXERCISES, LEGS_HAMSTRINGS_EXERCISES, LEGS_GLUTES_EXERCISES, LEGS_CALVES_EXERCISES]
  },

  // Bro Split
  'Chest': {
    muscleGroups: [CHEST_EXERCISES]
  },
  'Back': {
    muscleGroups: [BACK_EXERCISES, REAR_DELTS_EXERCISES]
  },
  'Shoulders': {
    muscleGroups: [SHOULDERS_EXERCISES, { ...REAR_DELTS_EXERCISES, exercises: ['Rear Delts: Face Pulls'] }]
  },
  'Arms': {
    muscleGroups: [BICEPS_EXERCISES, TRICEPS_EXERCISES]
  },

  // Upper/Lower Split
  'Upper': {
    muscleGroups: [
      { ...CHEST_EXERCISES, exercises: ['Chest: Bench Press', 'Chest: Incline Press'] },
      { ...BACK_EXERCISES, exercises: ['Back: Lat Pulldown', 'Back: Seated Row'] },
      { ...SHOULDERS_EXERCISES, exercises: ['Shoulders: Shoulder Press', 'Shoulders: Lateral Raise'] },
      { ...BICEPS_EXERCISES, exercises: ['Biceps: Bicep Curl'] },
      { ...TRICEPS_EXERCISES, exercises: ['Triceps: Pushdown'] }
    ]
  },
  'Lower': {
    muscleGroups: [LEGS_QUADS_EXERCISES, LEGS_HAMSTRINGS_EXERCISES, LEGS_GLUTES_EXERCISES, LEGS_CALVES_EXERCISES]
  },

  // Full Body Split
  'Full Body': {
    muscleGroups: [
      { ...CHEST_EXERCISES, exercises: ['Chest: Bench Press'] },
      { ...BACK_EXERCISES, exercises: ['Back: Lat Pulldown', 'Back: Seated Row'] },
      { ...SHOULDERS_EXERCISES, exercises: ['Shoulders: Shoulder Press'] },
      { ...LEGS_QUADS_EXERCISES, exercises: ['Quads: Squats', 'Quads: Leg Press'] },
      { ...LEGS_HAMSTRINGS_EXERCISES, exercises: ['Hamstrings: Leg Curl'] }
    ]
  }
};

// Get exercises for a workout day
export const getExercisesForWorkoutDay = (dayName: string): string[] => {
  // Direct match
  if (SPLIT_DAY_EXERCISES[dayName]) {
    return SPLIT_DAY_EXERCISES[dayName].muscleGroups.flatMap(mg => mg.exercises);
  }

  // Try to detect muscle groups from custom day names
  const lowerName = dayName.toLowerCase();
  const detectedExercises: string[] = [];

  // Check for keywords
  if (lowerName.includes('push')) {
    return getExercisesForWorkoutDay('Push');
  }
  if (lowerName.includes('pull')) {
    return getExercisesForWorkoutDay('Pull');
  }
  if (lowerName.includes('leg') || lowerName.includes('lower')) {
    return getExercisesForWorkoutDay('Legs');
  }
  if (lowerName.includes('upper')) {
    return getExercisesForWorkoutDay('Upper');
  }
  if (lowerName.includes('full body') || lowerName.includes('fullbody')) {
    return getExercisesForWorkoutDay('Full Body');
  }

  // Check individual muscle groups
  if (lowerName.includes('chest')) {
    detectedExercises.push(...CHEST_EXERCISES.exercises);
  }
  if (lowerName.includes('back')) {
    detectedExercises.push(...BACK_EXERCISES.exercises);
  }
  if (lowerName.includes('shoulder')) {
    detectedExercises.push(...SHOULDERS_EXERCISES.exercises);
  }
  if (lowerName.includes('bicep') || lowerName.includes('arm')) {
    detectedExercises.push(...BICEPS_EXERCISES.exercises);
  }
  if (lowerName.includes('tricep') || lowerName.includes('arm')) {
    detectedExercises.push(...TRICEPS_EXERCISES.exercises);
  }
  if (lowerName.includes('ab') || lowerName.includes('core')) {
    detectedExercises.push(...ABS_EXERCISES.exercises);
  }

  // Remove duplicates
  return [...new Set(detectedExercises)];
};

// Get muscle group sections for the active workout UI
export const getMuscleGroupsForWorkoutDay = (dayName: string): MuscleGroupExercises[] => {
  // Direct match
  if (SPLIT_DAY_EXERCISES[dayName]) {
    return SPLIT_DAY_EXERCISES[dayName].muscleGroups;
  }

  // Try to detect from custom day names
  const lowerName = dayName.toLowerCase();
  const detectedGroups: MuscleGroupExercises[] = [];

  if (lowerName.includes('push')) {
    return SPLIT_DAY_EXERCISES['Push'].muscleGroups;
  }
  if (lowerName.includes('pull')) {
    return SPLIT_DAY_EXERCISES['Pull'].muscleGroups;
  }
  if (lowerName.includes('leg') || lowerName.includes('lower')) {
    return SPLIT_DAY_EXERCISES['Legs'].muscleGroups;
  }
  if (lowerName.includes('upper')) {
    return SPLIT_DAY_EXERCISES['Upper'].muscleGroups;
  }
  if (lowerName.includes('full body') || lowerName.includes('fullbody')) {
    return SPLIT_DAY_EXERCISES['Full Body'].muscleGroups;
  }

  // Check individual muscle groups
  if (lowerName.includes('chest')) {
    detectedGroups.push(CHEST_EXERCISES);
  }
  if (lowerName.includes('back')) {
    detectedGroups.push(BACK_EXERCISES);
  }
  if (lowerName.includes('shoulder')) {
    detectedGroups.push(SHOULDERS_EXERCISES);
  }
  if (lowerName.includes('bicep')) {
    detectedGroups.push(BICEPS_EXERCISES);
  }
  if (lowerName.includes('tricep')) {
    detectedGroups.push(TRICEPS_EXERCISES);
  }
  if (lowerName.includes('arm')) {
    detectedGroups.push(BICEPS_EXERCISES, TRICEPS_EXERCISES);
  }
  if (lowerName.includes('ab') || lowerName.includes('core')) {
    detectedGroups.push(ABS_EXERCISES);
  }

  return detectedGroups;
};
