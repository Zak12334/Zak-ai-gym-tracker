
import { WorkoutSession, UserProfile } from "../types";

/**
 * Generates a monthly strength progression report via a secure backend logic engine.
 * Communicates with the /api/chat serverless function to protect API credentials.
 */
export const generateMonthlyReport = async (sessions: WorkoutSession[], profile: UserProfile | null): Promise<string> => {
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

  const profileContext = profile ? `User: ${profile.name}, Age: ${profile.age}, Body Weight: ${profile.weight}kg, Height: ${profile.height}ft.` : "User: Zak.";

  // Generate the logical prompt on the frontend to keep the backend function generic
  const message = `
    Analyze ${profile?.name || 'Zak'}'s gym performance data.
    ${profileContext}

    CRITICAL RULE: Only compare sessions of the SAME workout type. Never compare Back & Abs volume to Biceps & Shoulders - they are completely different muscle groups with different volume capacities.

    Data is grouped by workout type:
    ${JSON.stringify(sessionsByType, null, 2)}

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

    **OVERALL ASSESSMENT**
    - Summary of ${profile?.name || 'Zak'}'s progress across all workout types
    - Any workout types that need attention
    - Next priority target

    Keep it data-driven and direct. Use ${profile?.name || 'Zak'}'s name. No fluff.
  `;

  const systemInstruction = `You are the IronMind AI, ${profile?.name || 'Zak'}'s personal strength logic engine. You analyze patterns to maximize efficiency. CRITICAL: Never compare different workout types against each other - Back days have higher volume than Biceps days by nature. Only compare same-type sessions. Speak directly in a data-driven tone.`;

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
