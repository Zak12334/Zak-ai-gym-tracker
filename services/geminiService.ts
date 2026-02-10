
import { WorkoutSession, UserProfile, FoodLog, WaterLog, NutritionGoals } from "../types";

interface NutritionData {
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  goals: NutritionGoals;
}

/**
 * Generates a monthly strength progression report via a secure backend logic engine.
 * Communicates with the /api/chat serverless function to protect API credentials.
 */
export const generateMonthlyReport = async (
  sessions: WorkoutSession[],
  profile: UserProfile | null,
  nutritionData?: NutritionData
): Promise<string> => {
  // Group sessions by workout type for like-for-like comparison
  const sessionsByType: Record<string, any[]> = {};

  sessions.forEach(s => {
    if (!sessionsByType[s.type]) {
      sessionsByType[s.type] = [];
    }
    sessionsByType[s.type].push({
      date: s.date,
      duration: s.duration,
      exercises: s.exercises.map(e => ({
        name: e.name,
        bestSetWeight: Math.max(...e.sets.map(set => set.weight), 0),
        totalVolume: e.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0),
        sets: e.sets.length,
        avgReps: e.sets.length > 0 ? Math.round(e.sets.reduce((sum, set) => sum + set.reps, 0) / e.sets.length) : 0
      })),
      totalVolume: s.exercises.reduce((sum, e) => sum + e.sets.reduce((ss, set) => ss + (set.weight * set.reps), 0), 0)
    });
  });

  // Analyze nutrition data by day
  let nutritionAnalysis = '';
  if (nutritionData && nutritionData.foodLogs.length > 0) {
    const { foodLogs, waterLogs, goals } = nutritionData;

    // Group by date
    const dailyNutrition: Record<string, { calories: number; protein: number; carbs: number; fat: number; water: number }> = {};

    foodLogs.forEach(f => {
      if (!dailyNutrition[f.date]) {
        dailyNutrition[f.date] = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
      }
      dailyNutrition[f.date].calories += f.calories;
      dailyNutrition[f.date].protein += f.protein;
      dailyNutrition[f.date].carbs += f.carbs;
      dailyNutrition[f.date].fat += f.fat;
    });

    waterLogs.forEach(w => {
      if (!dailyNutrition[w.date]) {
        dailyNutrition[w.date] = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
      }
      dailyNutrition[w.date].water += w.amount;
    });

    // Calculate averages and consistency
    const days = Object.keys(dailyNutrition);
    const daysTracked = days.length;

    if (daysTracked > 0) {
      const avgCalories = Math.round(days.reduce((sum, d) => sum + dailyNutrition[d].calories, 0) / daysTracked);
      const avgProtein = Math.round(days.reduce((sum, d) => sum + dailyNutrition[d].protein, 0) / daysTracked);
      const avgCarbs = Math.round(days.reduce((sum, d) => sum + dailyNutrition[d].carbs, 0) / daysTracked);
      const avgFat = Math.round(days.reduce((sum, d) => sum + dailyNutrition[d].fat, 0) / daysTracked);
      const avgWater = Math.round(days.reduce((sum, d) => sum + dailyNutrition[d].water, 0) / daysTracked);

      // Count days meeting goals
      const daysHitCalories = days.filter(d => dailyNutrition[d].calories >= goals.calories * 0.9).length;
      const daysHitProtein = days.filter(d => dailyNutrition[d].protein >= goals.protein * 0.9).length;
      const daysHitWater = days.filter(d => dailyNutrition[d].water >= goals.water * 0.9).length;

      nutritionAnalysis = `
    NUTRITION DATA (${daysTracked} days tracked):
    Goals: ${goals.calories} cal, ${goals.protein}g protein, ${goals.water}ml water

    Averages:
    - Calories: ${avgCalories}/${goals.calories} (${Math.round(avgCalories/goals.calories*100)}% of goal)
    - Protein: ${avgProtein}g/${goals.protein}g (${Math.round(avgProtein/goals.protein*100)}% of goal)
    - Carbs: ${avgCarbs}g
    - Fat: ${avgFat}g
    - Water: ${avgWater}ml/${goals.water}ml (${Math.round(avgWater/goals.water*100)}% of goal)

    Consistency (days hitting 90%+ of goal):
    - Calories: ${daysHitCalories}/${daysTracked} days (${Math.round(daysHitCalories/daysTracked*100)}%)
    - Protein: ${daysHitProtein}/${daysTracked} days (${Math.round(daysHitProtein/daysTracked*100)}%)
    - Water: ${daysHitWater}/${daysTracked} days (${Math.round(daysHitWater/daysTracked*100)}%)

    Daily breakdown (last 7 days):
    ${days.slice(0, 7).map(d => `${d}: ${dailyNutrition[d].calories} cal, ${dailyNutrition[d].protein}g protein, ${dailyNutrition[d].water}ml water`).join('\n    ')}
      `;
    }
  }

  const profileContext = profile ? `User: ${profile.name}, Age: ${profile.age}, Body Weight: ${profile.weight}kg, Height: ${profile.height}ft.` : "User: Zak.";

  // Generate the logical prompt on the frontend to keep the backend function generic
  const message = `
    Analyze ${profile?.name || 'Zak'}'s gym performance and nutrition data.
    ${profileContext}

    CRITICAL RULE: Only compare sessions of the SAME workout type. Never compare Back & Abs volume to Biceps & Shoulders - they are completely different muscle groups with different volume capacities.

    WORKOUT DATA (grouped by workout type):
    ${JSON.stringify(sessionsByType, null, 2)}
    ${nutritionAnalysis}

    For EACH workout type that has 2+ sessions, analyze:
    1. Is volume/weight trending up, down, or flat compared to PREVIOUS sessions of the SAME type?
    2. Which specific exercises are progressing vs stalling?
    3. Any exercises with 0 progress across multiple sessions of that type?

    Structure your response:

    **CHEST & TRICEPS** (if data exists)
    - Trend: [↑ Progressing / → Maintaining / ↓ Regressing]
    - Key lifts: [status of main exercises]
    - Action: [specific recommendation]

    **BACK & ABS** (if data exists)
    - Trend: [↑ Progressing / → Maintaining / ↓ Regressing]
    - Key lifts: [status of main exercises]
    - Action: [specific recommendation]

    **BICEPS & SHOULDERS** (if data exists)
    - Trend: [↑ Progressing / → Maintaining / ↓ Regressing]
    - Key lifts: [status of main exercises]
    - Action: [specific recommendation]

    **LEGS, REAR DELT & FOREARMS** (if data exists)
    - Trend: [↑ Progressing / → Maintaining / ↓ Regressing]
    - Key lifts: [status of main exercises]
    - Action: [specific recommendation]

    **NUTRITION ANALYSIS** (if nutrition data exists)
    - Protein intake: [Is it sufficient for muscle growth at ${profile?.weight || 80}kg bodyweight? Need ~1.6-2.2g per kg]
    - Calorie intake: [Surplus/deficit/maintenance? Consistent or inconsistent?]
    - Hydration: [Adequate for performance?]
    - Impact on gains: [Is nutrition supporting or limiting progress?]
    - Action: [Specific nutrition recommendation if needed]

    **OVERALL ASSESSMENT**
    - Summary of ${profile?.name || 'Zak'}'s progress across workouts AND nutrition
    - If protein/calories are consistently low, FLAG THIS as limiting muscle growth
    - 1-2 days of low intake is fine, but consistent under-eating = no gains
    - Next priority target

    Keep it data-driven and direct. Use ${profile?.name || 'Zak'}'s name. No fluff. Be honest if nutrition is sabotaging their gym progress.
  `;

  const systemInstruction = `You are the IronMind AI, ${profile?.name || 'Zak'}'s personal strength and nutrition logic engine. You analyze workout AND nutrition patterns to maximize muscle growth. CRITICAL: Never compare different workout types against each other - Back days have higher volume than Biceps days by nature. Only compare same-type sessions. Be BRUTALLY HONEST about nutrition - if protein intake is too low for muscle growth, say it clearly. Speak directly in a data-driven tone.`;

  try {
    // Call the local secure proxy instead of a direct external API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, systemInstruction })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Backend logical core failed to respond.');
    }

    const data = await response.json();
    return data.text || "Insufficient data for logical analysis.";
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "IronMind Logic Engine offline. Check your server environment configuration or deployment logs.";
  }
};
