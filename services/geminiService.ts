
import { WorkoutSession, UserProfile } from "../types";

/**
 * Generates a monthly strength progression report via a secure backend logic engine.
 * Communicates with the /api/chat serverless function to protect API credentials.
 */
export const generateMonthlyReport = async (sessions: WorkoutSession[], profile: UserProfile | null): Promise<string> => {
  // Aggregate workout metrics for analysis
  const workoutData = sessions.map(s => ({
    date: s.date,
    type: s.type,
    exercises: s.exercises.map(e => ({
      name: e.name,
      bestSetWeight: Math.max(...e.sets.map(set => set.weight), 0),
      totalVolume: e.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0),
      avgReps: e.sets.length > 0 ? e.sets.reduce((sum, set) => sum + set.reps, 0) / e.sets.length : 0
    }))
  }));

  const profileContext = profile ? `User: ${profile.name}, Age: ${profile.age}, Body Weight: ${profile.weight}kg, Height: ${profile.height}ft.` : "User: Zak.";

  // Generate the logical prompt on the frontend to keep the backend function generic
  const message = `
    Analyze ${profile?.name || 'Zak'}'s last ${sessions.length} gym sessions. 
    ${profileContext}
    I want a highly automated, cold, and calculated assessment. 
    
    CRITICAL ANALYSIS:
    1. PROGRESSION: Are the weights going up on key lifts relative to body weight?
    2. STAGNATION: Which exercises have seen 0% growth in 2 weeks?
    3. ROUTINE EFFICACY: Is this current split (Chest/Tri, Back/Abs, Biceps, Legs) actually working for Zak?
    
    Data:
    ${JSON.stringify(workoutData)}

    Structure:
    - **Performance Mind**: (Quick summary of strength trends for Zak)
    - **The Stalls**: (List exercises where Zak is failing to progress)
    - **The Pivot**: (If Zak is stalling on more than 30% of his lifts, suggest a specific routine change. If he is progressing, tell him to keep the course.)
    - **Next Target**: (The specific machine/weight Zak needs to beat next week)

    Keep it short, direct, and automated. Use Zak's name. No encouragement, just logic.
  `;

  const systemInstruction = `You are the IronMind AI, Zak's personal strength logic engine. You analyze Zak's patterns to maximize efficiency. If progress stops, you suggest radical shifts in training style. You speak directly to Zak in a data-driven, cold tone.`;

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
