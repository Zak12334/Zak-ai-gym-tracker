
import React, { useState, useEffect, useRef } from 'react';
import { WorkoutSession, DayType, Exercise, Set, UserProfile, FoodLog, WaterLog, NutritionGoals } from './types';
import { getWorkoutForToday, getWorkoutForUser, generateUUID, formatDuration, calculateSmartTarget, getDaysSinceLastWorkoutType } from './utils';
import { SmartTargets } from './components/SmartTargets';
import { NutritionView } from './components/NutritionView';
import { BarcodeScanner } from './components/BarcodeScanner';
import { PhotoEstimator } from './components/PhotoEstimator';
import { AuthView } from './components/AuthView';
import { ProfileSetup } from './components/ProfileSetup';
import { DEFAULT_EXERCISES } from './constants';
import { getExercisesForWorkoutDay, getMuscleGroupsForWorkoutDay } from './splitExercises';
import { SessionCard } from './components/SessionCard';
import { generateMonthlyReport } from './services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import supabase from './supabaseClient';
import { User } from '@supabase/supabase-js';

type View = 'Home' | 'Active' | 'History' | 'Report' | 'EditSession' | 'Nutrition';

const App: React.FC = () => {
  const [view, setView] = useState<View>('Home');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [timer, setTimer] = useState(0);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const [preferredMachines, setPreferredMachines] = useState<Record<string, {name: string, muscleGroup?: string}[]>>({});
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const timerRef = useRef<number | null>(null);

  // Nutrition tracking state
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showPhotoEstimator, setShowPhotoEstimator] = useState(false);

  // Compute nutrition goals from profile (with fallbacks for existing users)
  // Water goal: ~33ml per kg body weight (75kg = 2.5L, 90kg = 3L, 110kg = 3.6L)
  const waterGoal = profile?.weight ? Math.round(profile.weight * 33 / 100) * 100 : 3000;

  const nutritionGoals: NutritionGoals = {
    calories: profile?.calorie_goal || 2500,
    protein: profile?.protein_goal || 180,
    carbs: Math.round((profile?.calorie_goal || 2500) * 0.4 / 4), // ~40% of calories
    fat: Math.round((profile?.calorie_goal || 2500) * 0.25 / 9), // ~25% of calories
    water: waterGoal
  };

  // Helper to persist active session to localStorage
  const persistActiveSession = (session: WorkoutSession | null) => {
    if (session) {
      localStorage.setItem('activeSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('activeSession');
    }
  };

  // Nutrition persistence - saves to Supabase
  const addFoodLog = async (food: FoodLog) => {
    if (!profile) return;

    // Optimistic update
    setFoodLogs(prev => [food, ...prev]);

    const { error } = await supabase
      .from('food_logs')
      .insert([{
        id: food.id,
        profile_id: profile.id,
        date: food.date,
        timestamp: food.timestamp,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        grams: food.amount, // Keep for backward compatibility with DB constraint
        amount: food.amount,
        unit: food.unit,
        source: food.source
      }]);

    if (error) {
      console.error("Error saving food log:", error.message, error.details, error.hint, error.code);
      // Revert on error
      setFoodLogs(prev => prev.filter(f => f.id !== food.id));
    }
  };

  const deleteFoodLog = async (id: string) => {
    // Optimistic update
    setFoodLogs(prev => prev.filter(f => f.id !== id));

    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting food log:", error);
    }
  };

  const addWaterLog = async (water: WaterLog) => {
    if (!profile) return;

    // Optimistic update
    setWaterLogs(prev => [water, ...prev]);

    const { error } = await supabase
      .from('water_logs')
      .insert([{
        id: water.id,
        profile_id: profile.id,
        date: water.date,
        timestamp: water.timestamp,
        amount: water.amount
      }]);

    if (error) {
      console.error("Error saving water log:", error);
      // Revert on error
      setWaterLogs(prev => prev.filter(w => w.id !== water.id));
    }
  };

  const deleteWaterLog = async (id: string) => {
    // Optimistic update
    setWaterLogs(prev => prev.filter(w => w.id !== id));

    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting water log:", error);
    }
  };

  const handleScanBarcode = () => {
    setShowBarcodeScanner(true);
  };

  const handleBarcodeFood = (food: FoodLog) => {
    addFoodLog(food);
    setShowBarcodeScanner(false);
  };

  const handlePhotoEstimate = () => {
    setShowPhotoEstimator(true);
  };

  const handlePhotoFoods = (foods: FoodLog[]) => {
    foods.forEach(food => addFoodLog(food));
    setShowPhotoEstimator(false);
  };

  // Check for existing auth session on mount
  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted || hasLoaded) return;
        hasLoaded = true;

        if (error) {
          console.error("Auth session error:", error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setAuthUser(session.user);
          try {
            await loadUserData(session.user.id);
          } catch (loadErr) {
            console.error('Failed to load user data:', loadErr);
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();

    // Safety timeout - never stay loading forever (max 10 seconds)
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("Loading timeout reached, forcing load complete");
        setIsLoading(false);
      }
    }, 10000);

    // Listen for auth changes (but ignore initial session which we handle above)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // Skip INITIAL_SESSION as we handle it in checkAuth
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser(session.user);
        if (!hasLoaded) {
          hasLoaded = true;
          await loadUserData(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setProfile(null);
        setHistory([]);
        setFoodLogs([]);
        setWaterLogs([]);
        setNeedsProfileSetup(false);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    setIsLoading(true);

    try {
      // Restore active session from localStorage if exists
      const savedSession = localStorage.getItem('activeSession');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession) as WorkoutSession;
          // Calculate elapsed time from startTime
          const elapsedSeconds = Math.floor((Date.now() - parsed.startTime) / 1000);
          setActiveSession(parsed);
          setTimer(elapsedSeconds);
          setView('Active');
        } catch (e) {
          console.error("Failed to restore session:", e);
          localStorage.removeItem('activeSession');
        }
      }

      // Load Profile for this user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Profile load error:", profileError);
        // If RLS blocks us, try without user_id filter (fallback for migration)
        const { data: fallbackProfile } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (fallbackProfile) {
          setProfile(fallbackProfile);
          setNeedsProfileSetup(false);
        } else {
          setNeedsProfileSetup(true);
        }
        setIsLoading(false);
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setNeedsProfileSetup(false);

        // Load Sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('date', { ascending: false });

        if (sessionError) {
          console.error("Sessions load error:", sessionError);
        } else if (sessionData) {
          setHistory(sessionData);
          // Reconstruct preferred machines from history (most recent session for each type)
          const machines: Record<string, {name: string, muscleGroup?: string}[]> = {};
          sessionData.forEach((s: any) => {
            // Only use first (most recent) session for each workout type
            if (!machines[s.type] && s.exercises && Array.isArray(s.exercises)) {
              // Filter out empty names and preserve muscleGroup
              const exerciseInfo = s.exercises
                .filter((e: any) => e.name?.trim() && e.name.trim().length > 0)
                .map((e: any) => ({ name: e.name.trim(), muscleGroup: e.muscleGroup }));
              if (exerciseInfo.length > 0) {
                machines[s.type] = exerciseInfo;
              }
            }
          });
          setPreferredMachines(machines);
          console.log("Loaded preferred machines:", machines); // Debug log
        }

        // Load Food Logs from Supabase
        const { data: foodData, error: foodError } = await supabase
          .from('food_logs')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('timestamp', { ascending: false });

        if (foodError) {
          console.error("Food logs load error:", foodError);
        } else if (foodData) {
          setFoodLogs(foodData.map((f: any) => ({
            id: f.id,
            date: f.date,
            timestamp: f.timestamp,
            name: f.name,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            amount: f.amount || f.grams,
            unit: f.unit || 'g',
            source: f.source
          })));
        }

        // Load Water Logs from Supabase
        const { data: waterData, error: waterError } = await supabase
          .from('water_logs')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('timestamp', { ascending: false });

        if (waterError) {
          console.error("Water logs load error:", waterError);
        } else if (waterData) {
          setWaterLogs(waterData.map((w: any) => ({
            id: w.id,
            date: w.date,
            timestamp: w.timestamp,
            amount: w.amount
          })));
        }
      } else {
        // No profile found for this user - needs setup
        setNeedsProfileSetup(true);
      }
    } catch (err) {
      console.error("loadUserData failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (user: User) => {
    setAuthUser(user);
    try {
      await loadUserData(user.id);
    } catch (err) {
      console.error('Failed to load user data after auth:', err);
      setIsLoading(false);
    }
  };

  const handleProfileComplete = (newProfile: any) => {
    setProfile(newProfile);
    setNeedsProfileSetup(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutMenu(false);
    setAuthUser(null);
    setProfile(null);
    setHistory([]);
    setFoodLogs([]);
    setWaterLogs([]);
    setActiveSession(null);
    persistActiveSession(null);
    setTimer(0);
    setView('Home');
  };

  useEffect(() => {
    if (activeSession && !activeSession.endTime) {
      if (timerRef.current) clearInterval(timerRef.current);
      // Calculate elapsed time from startTime for accuracy
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
        setTimer(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeSession]);

  const startSession = () => {
    const type = profile?.split_type ? getWorkoutForUser(profile) : getWorkoutForToday();
    const userDefined = preferredMachines[type];

    // Get muscle groups for this workout type to detect muscleGroup from name
    // Always try to get muscle groups, even for Zak's profile without split_type
    const workoutMuscleGroups = getMuscleGroupsForWorkoutDay(type);

    let initialExercises: { id: string; name: string; sets: any[]; muscleGroup?: string }[];

    // Unambiguous exercise keywords (only for exercises that ONLY belong to one muscle group)
    const unambiguousKeywords: Record<string, string> = {
      'lateral raise': 'Shoulders',
      'front raise': 'Shoulders',
      'shrug': 'Shoulders',
      'face pull': 'Rear Delts',
      'reverse fly': 'Rear Delts',
      'lat pulldown': 'Back',
      'pull-up': 'Back',
      'pullup': 'Back',
      'deadlift': 'Back',
      'barbell row': 'Back',
      'preacher curl': 'Biceps',
      'hammer curl': 'Biceps',
      'bicep curl': 'Biceps',
      'cable curl': 'Biceps',
      'curl': 'Biceps',
      'tricep pushdown': 'Triceps',
      'skull crusher': 'Triceps',
      'overhead extension': 'Triceps',
      'leg press': 'Quads',
      'leg extension': 'Quads',
      'squat': 'Quads',
      'lunge': 'Quads',
      'leg curl': 'Hamstrings',
      'romanian deadlift': 'Hamstrings',
      'calf raise': 'Calves',
      'crunch': 'Abs',
      'plank': 'Abs',
      'sit-up': 'Abs',
    };

    const detectMuscleGroup = (name: string): string | undefined => {
      const nameLower = name.toLowerCase().trim();

      // First check prefix format
      for (const mg of workoutMuscleGroups) {
        const mgNameLower = mg.name.toLowerCase();
        if (nameLower.startsWith(mgNameLower + ':') || nameLower.startsWith(mgNameLower + ': ')) {
          return mg.name;
        }
      }

      // Then check unambiguous keywords (only if this muscle group is in the current workout)
      for (const [keyword, mgName] of Object.entries(unambiguousKeywords)) {
        if (nameLower.includes(keyword)) {
          // Only assign if this muscle group is actually in this workout
          const matchingMg = workoutMuscleGroups.find(mg => mg.name.toLowerCase() === mgName.toLowerCase());
          if (matchingMg) {
            return matchingMg.name;
          }
        }
      }

      return undefined;
    };

    if (userDefined && userDefined.length > 0) {
      // User has done this workout type before - use their preferred exercises with muscleGroup preserved
      initialExercises = userDefined.map(ex => {
        // If muscleGroup is already set, use it; otherwise try to detect
        const muscleGroup = ex.muscleGroup || detectMuscleGroup(ex.name);
        return {
          id: generateUUID(),
          name: ex.name,
          sets: [],
          muscleGroup
        };
      });
    } else {
      // Get default exercise names
      let defaultNames: string[];
      if (profile?.split_type) {
        defaultNames = getExercisesForWorkoutDay(type);
      } else {
        defaultNames = DEFAULT_EXERCISES[type as DayType] || [];
      }

      // Create exercises with muscleGroup detected from name
      initialExercises = defaultNames.map(name => ({
        id: generateUUID(),
        name,
        sets: [],
        muscleGroup: detectMuscleGroup(name)
      }));
    }

    const newSession: WorkoutSession = {
      id: generateUUID(),
      date: new Date().toISOString(),
      startTime: Date.now(),
      type,
      exercises: initialExercises
    };

    setTimer(0);
    setActiveSession(newSession);
    persistActiveSession(newSession);

    // Initialize expanded sections based on workout type
    const muscleGroups = profile?.split_type ? getMuscleGroupsForWorkoutDay(type) : [];
    const initialExpanded: Record<string, boolean> = {};
    muscleGroups.forEach(mg => {
      initialExpanded[mg.name] = false;
    });
    setExpandedSections(initialExpanded);

    setView('Active');
  };

  const deleteSession = async (id: string) => {
    if (window.confirm("Permanently delete this session record?")) {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting session:", error);
      } else {
        setHistory(prev => prev.filter(s => s.id !== id));
      }
    }
  };

  const cancelSession = () => {
    if (window.confirm("Discard session? All current data will be lost.")) {
      setActiveSession(null);
      persistActiveSession(null);
      setTimer(0);
      setView('Home');
    }
  };

  const updateExerciseName = (id: string, newName: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        exercises: prev.exercises.map(ex => ex.id === id ? { ...ex, name: newName } : ex)
      };
      persistActiveSession(updated);
      return updated;
    });
  };

  const addExercise = (muscleGroup: string = "") => {
    setActiveSession(prev => {
      if (!prev) return null;
      const newEx = {
        id: generateUUID(),
        name: muscleGroup ? `${muscleGroup}: ` : '',
        sets: [],
        muscleGroup: muscleGroup || undefined // Track which section it belongs to
      };
      const updated = {
        ...prev,
        exercises: [newEx, ...prev.exercises]
      };
      persistActiveSession(updated);
      return updated;
    });
  };

  const removeExercise = (id: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        exercises: prev.exercises.filter(ex => ex.id !== id)
      };
      persistActiveSession(updated);
      return updated;
    });
  };

  const addSet = (exerciseId: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id === exerciseId) {
            const lastSet = ex.sets[ex.sets.length - 1];
            return {
              ...ex,
              sets: [...ex.sets, {
                id: generateUUID(),
                weight: lastSet ? lastSet.weight : 0,
                reps: lastSet ? lastSet.reps : 0,
                timestamp: Date.now()
              }]
            };
          }
          return ex;
        })
      };
      persistActiveSession(updated);
      return updated;
    });
  };

  const adjustWeight = (exerciseId: string, setId: string, amount: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              sets: ex.sets.map(s => s.id === setId ? { ...s, weight: Math.max(0, s.weight + amount) } : s)
            };
          }
          return ex;
        })
      };
      persistActiveSession(updated);
      return updated;
    });
  };

  const updateSetField = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
            };
          }
          return ex;
        })
      };
      persistActiveSession(updated);
      return updated;
    });
  };

  const finishSession = async () => {
    if (!activeSession || !profile || isSaving) return;

    setIsSaving(true);

    const completedSession: any = {
      profile_id: profile.id,
      date: activeSession.date,
      type: activeSession.type,
      exercises: activeSession.exercises,
      duration: timer,
      start_time: activeSession.startTime,
      end_time: Date.now()
    };

    const { data, error } = await supabase
      .from('sessions')
      .insert([completedSession])
      .select()
      .single();

    if (error) {
      console.error("Error saving session:", error);
      alert("Failed to save session. Check connection.");
      setIsSaving(false);
    } else {
      setHistory(prev => [data, ...prev]);
      // Update preferred machines cache with muscleGroup info
      const exercisesUsed = activeSession.exercises
        .filter(e => e.name.trim() !== "")
        .map(e => ({ name: e.name.trim(), muscleGroup: e.muscleGroup }));
      if (exercisesUsed.length > 0) {
        setPreferredMachines(prev => ({ ...prev, [activeSession.type]: exercisesUsed }));
      }
      setActiveSession(null);
      persistActiveSession(null);
      setTimer(0);
      setIsSaving(false);
      setView('Home');
    }
  };

  // Edit saved session functions
  const openEditSession = (session: WorkoutSession) => {
    setEditingSession({ ...session, exercises: session.exercises.map(ex => ({ ...ex, sets: [...ex.sets] })) });
    setView('EditSession');
  };

  const removeExerciseFromEdit = (exerciseId: string) => {
    setEditingSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
      };
    });
  };

  const removeSetFromEdit = (exerciseId: string, setId: string) => {
    setEditingSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.id === exerciseId
            ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
            : ex
        )
      };
    });
  };

  const updateEditingDuration = (minutes: number) => {
    setEditingSession(prev => {
      if (!prev) return null;
      return { ...prev, duration: minutes * 60 };
    });
  };

  const saveEditedSession = async () => {
    if (!editingSession) return;

    const { error } = await supabase
      .from('sessions')
      .update({
        exercises: editingSession.exercises,
        duration: editingSession.duration
      })
      .eq('id', editingSession.id);

    if (error) {
      console.error("Error updating session:", error);
      alert("Failed to save changes. Check connection.");
    } else {
      setHistory(prev => prev.map(s => s.id === editingSession.id
        ? { ...s, exercises: editingSession.exercises, duration: editingSession.duration }
        : s
      ));
      setEditingSession(null);
      setView('History');
    }
  };

  const cancelEditSession = () => {
    setEditingSession(null);
    setView('History');
  };

  const fetchAiReport = async () => {
    if (history.length < 8) {
      alert(`${profile?.name || 'User'}, IronMind needs at least 8 sessions (2 weeks) to identify progression patterns. Progress: ${history.length}/8`);
      return;
    }
    setIsGeneratingReport(true);
    setView('Report');
    const report = await generateMonthlyReport(history, profile, {
      foodLogs,
      waterLogs,
      goals: nutritionGoals
    });
    setAiReport(report);
    setIsGeneratingReport(false);
  };

  const renderHome = () => {
    const todayWorkout = profile?.split_type ? getWorkoutForUser(profile) : getWorkoutForToday();
    const firstName = profile?.name || 'Zak';
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] p-8 text-center animate-in fade-in duration-500 relative">
        {/* Profile/Logout Menu */}
        <div className="absolute right-4" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <button
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-white font-black text-sm uppercase"
          >
            {firstName.charAt(0)}
          </button>
          {showLogoutMenu && (
            <div className="absolute right-0 top-12 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-xl z-50 min-w-[150px]">
              <p className="text-[10px] text-slate-500 px-3 py-2 font-bold uppercase tracking-widest">{authUser?.email}</p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-400 font-bold text-sm rounded-xl hover:bg-red-900/30 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">IronMind</h1>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.3em]">Authorized for {firstName}</p>
            <p className="text-blue-500 font-black text-xs uppercase tracking-widest">{todayWorkout}</p>
          </div>
        </header>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <button onClick={startSession} className="fire-button relative w-64 h-64 rounded-full flex flex-col items-center justify-center border-4 border-white/10 z-10 group overflow-hidden">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
            <svg className="w-16 h-16 text-white mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M11 21h-1l1-7H7.5l5.5-10h1l-1 7h3.5L11 21z"/></svg>
            <span className="text-xl font-black text-white italic tracking-tighter uppercase">Start Session</span>
          </button>
        </div>
        
        <div className="mt-24 max-w-[200px] mx-auto opacity-40">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">ML Mode: Mapping {firstName}'s Biometric Patterns...</p>
        </div>
      </div>
    );
  };

  const renderExercise = (ex: Exercise) => {
    // Calculate smart target for this exercise
    const smartTarget = activeSession && ex.name.trim()
      ? calculateSmartTarget(ex.name, history, activeSession.type)
      : null;

    return (
    <div key={ex.id} className="bg-slate-950 rounded-3xl p-5 mb-4 border border-white/10 shadow-xl relative">
      <div className="flex justify-between items-start mb-4">
        <input
          type="text"
          value={ex.name}
          onChange={(e) => updateExerciseName(ex.id, e.target.value)}
          className="flex-1 bg-transparent border-none text-xl font-black text-white focus:ring-0 p-0 placeholder-slate-800"
          placeholder="Enter Machine..."
        />
        <button onClick={() => removeExercise(ex.id)} className="text-slate-700 p-1 hover:text-red-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Smart Targets - only show if exercise has a name */}
      {smartTarget && ex.name.trim() && (
        <SmartTargets target={smartTarget} exerciseName={ex.name} />
      )}
      
      <div className="space-y-3">
        {ex.sets.map((set, idx) => (
          <div key={set.id} className="grid grid-cols-12 gap-2 items-center bg-white/5 rounded-2xl p-3">
            <div className="col-span-1 text-[10px] font-black text-slate-600">#{idx + 1}</div>
            <div className="col-span-6 flex items-center justify-between gap-1">
              <button onClick={() => adjustWeight(ex.id, set.id, -5)} className="bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs active:bg-slate-700">-5</button>
              <div className="flex-1 flex flex-col items-center">
                <input type="number" value={set.weight || ''} onChange={(e) => updateSetField(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)} className="bg-transparent text-center w-full font-black text-lg text-blue-400 focus:outline-none" />
                <span className="text-[8px] text-slate-500 font-bold uppercase -mt-1">kg</span>
              </div>
              <button onClick={() => adjustWeight(ex.id, set.id, 5)} className="bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs active:bg-slate-700">+5</button>
            </div>
            <div className="col-span-4 px-2 border-l border-white/10 flex items-center gap-1">
              <input type="number" value={set.reps || ''} onChange={(e) => updateSetField(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)} className="bg-transparent text-center w-full font-black text-lg text-white focus:outline-none" placeholder="0" />
              <span className="text-[8px] text-slate-500 font-bold uppercase">Reps</span>
            </div>
            <button onClick={() => { setActiveSession(prev => { if (!prev) return null; const updated = { ...prev, exercises: prev.exercises.map(e => e.id === ex.id ? { ...e, sets: e.sets.filter(s => s.id !== set.id) } : e) }; persistActiveSession(updated); return updated; }); }} className="col-span-1 text-red-900/50 font-bold text-center">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => addSet(ex.id)} className="w-full py-4 bg-white/5 text-white/40 rounded-2xl text-xs font-black uppercase tracking-widest mt-4 border border-white/5 transition-all active:bg-white/10">+ ADD SET</button>
    </div>
    );
  };

  const renderActive = () => {
    if (!activeSession) return null;

    // Define muscle group sections for each workout type
    // For Zak's profile (no split_type), use hardcoded sections
    const zakWorkoutSections: Record<string, { name: string; prefix: string; color: string }[]> = {
      [DayType.ChestTriceps]: [
        { name: 'Chest', prefix: 'chest:', color: '#ef4444' },
        { name: 'Triceps', prefix: 'triceps:', color: '#f97316' }
      ],
      [DayType.BackAbs]: [
        { name: 'Back', prefix: 'back:', color: '#3b82f6' },
        { name: 'Abs', prefix: 'abs:', color: '#06b6d4' }
      ],
      [DayType.BicepsShoulders]: [
        { name: 'Biceps', prefix: 'biceps:', color: '#22c55e' },
        { name: 'Shoulders', prefix: 'shoulders:', color: '#84cc16' }
      ],
      [DayType.LegsRearDeltForearms]: [
        { name: 'Legs', prefix: 'legs:', color: '#a855f7' },
        { name: 'Rear Delt', prefix: 'rear delt:', color: '#d946ef' },
        { name: 'Forearms', prefix: 'forearms:', color: '#ec4899' }
      ]
    };

    // Get sections - for users with split_type, use dynamic sections from splitExercises
    let sections: { name: string; prefix: string; color: string }[];

    if (profile?.split_type) {
      // User has a split - get muscle groups dynamically
      const muscleGroups = getMuscleGroupsForWorkoutDay(activeSession.type);
      sections = muscleGroups.map(mg => ({
        name: mg.name,
        prefix: mg.name.toLowerCase() + ':',
        color: mg.color
      }));
    } else {
      // Zak's profile - use hardcoded sections
      sections = zakWorkoutSections[activeSession.type] || [];
    }

    const hasSections = sections.length > 0;

    // Simple check: exercise belongs to section if muscleGroup matches OR name starts with section prefix
    // NO keyword guessing - user decides where exercises go
    const exerciseBelongsToSection = (exercise: { name: string; muscleGroup?: string }, sectionName: string): boolean => {
      const sectionLower = sectionName.toLowerCase();

      // 1. If exercise has muscleGroup set (was added to this section), use that
      if (exercise.muscleGroup) {
        return exercise.muscleGroup.toLowerCase() === sectionLower;
      }

      // 2. Check if name starts with section prefix like "Triceps:" or "Triceps: "
      const nameLower = exercise.name.toLowerCase().trim();
      return nameLower.startsWith(sectionLower + ':') || nameLower.startsWith(sectionLower + ': ');
    };

    // Helper to filter exercises by section
    const getExercisesForSection = (sectionName: string) => {
      return activeSession.exercises.filter(e => exerciseBelongsToSection(e, sectionName));
    };

    // Get exercises that don't match any section
    const getOtherExercises = () => {
      if (!hasSections) return activeSession.exercises;
      return activeSession.exercises.filter(e => {
        // If exercise has muscleGroup set, it belongs to that section
        if (e.muscleGroup) return false;
        // Otherwise check if it matches any section by prefix
        return !sections.some(s => exerciseBelongsToSection(e, s.name));
      });
    };

    const renderSection = (section: { name: string; prefix: string; color: string }) => {
      const sectionExercises = getExercisesForSection(section.name);
      const isExpanded = expandedSections[section.name] ?? false;

      return (
        <div key={section.name} className="border border-white/10 rounded-[2.5rem] overflow-hidden bg-slate-900/20 backdrop-blur-md">
          <button
            onClick={() => setExpandedSections(p => ({ ...p, [section.name]: !p[section.name] }))}
            className="w-full p-6 flex justify-between items-center transition-colors hover:bg-white/5 active:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: section.color }}></div>
              <span className="text-xl font-black italic tracking-tighter uppercase text-white">{section.name}</span>
              <span className="text-xs font-bold text-slate-600">({sectionExercises.length})</span>
            </div>
            <svg className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isExpanded && (
            <div className="p-5 bg-black/40 space-y-4 border-t border-white/10">
              <button
                onClick={() => addExercise(section.name)}
                className="w-full py-4 border border-dashed border-white/10 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-blue-400 transition-colors"
              >
                + Add {section.name} Exercise
              </button>
              {sectionExercises.map(renderExercise)}
              {sectionExercises.length === 0 && (
                <p className="text-slate-700 text-sm italic text-center py-4">No {section.name.toLowerCase()} exercises yet</p>
              )}
            </div>
          )}
        </div>
      );
    };

    const otherExercises = getOtherExercises();

    return (
      <div className="p-6 pb-48 animate-in slide-in-from-bottom-10 duration-500" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
        <div className="flex justify-between items-start mb-8 sticky bg-black/80 ios-blur py-4 z-20 -mx-6 px-6" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('Home')} className="text-white bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:bg-slate-800 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">{activeSession.type}</h2>
              <p className="text-blue-500 font-black text-xl tracking-tight">{formatDuration(timer)}</p>
            </div>
          </div>
          <button onClick={finishSession} disabled={isSaving} className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase tracking-tighter active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">{isSaving ? 'SAVING...' : 'FINISH'}</button>
        </div>

        {hasSections ? (
          <div className="space-y-4">
            {sections.map(renderSection)}
            {otherExercises.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4">Other Exercises</p>
                {otherExercises.map(renderExercise)}
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => addExercise()} className="w-full py-5 border-2 border-dashed border-white/10 text-slate-600 rounded-3xl font-black uppercase tracking-widest text-xs mb-8 hover:border-blue-500 hover:text-blue-500 transition-colors">+ Add Machine</button>
            {activeSession.exercises.map(renderExercise)}
          </>
        )}

        <div className="mt-16 text-center pb-20">
          <button onClick={cancelSession} className="text-red-500/30 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all">Discard Workout</button>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="p-6 pb-24 animate-in fade-in duration-500" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('Home')} className="text-white bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:bg-slate-800">←</button>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Logs</h2>
        </div>
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{history.length} Sessions</div>
      </div>
      {history.length === 0 ? (
        <div className="mt-20 text-center opacity-20"><p className="font-black italic text-2xl mb-2 uppercase">No Data</p></div>
      ) : history.map(s => <SessionCard key={s.id} session={s} onDelete={() => deleteSession(s.id)} onEdit={() => openEditSession(s)} />)}
    </div>
  );

  const renderReport = () => (
    <div className="p-6 pb-24 animate-in fade-in duration-500" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('Home')} className="text-white bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:bg-slate-800">←</button>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">IronMind AI</h2>
        </div>
        <button onClick={fetchAiReport} disabled={isGeneratingReport} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">{isGeneratingReport ? '...' : 'Analyze'}</button>
      </div>
      {isGeneratingReport ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Processing {profile?.name || 'Zak'}'s Trends...</p>
        </div>
      ) : (
        <>
          {aiReport && (
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 mb-8">
              <div className="prose prose-invert prose-sm text-slate-300 whitespace-pre-wrap font-medium leading-relaxed italic">{aiReport}</div>
            </div>
          )}
          {history.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-black italic tracking-tighter text-lg text-white uppercase">Volume by Workout Type</h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest -mt-2 mb-4">Only compare same colors - different workout types have different volume ranges</p>
              {/* Group sessions by type and show mini charts */}
              {(() => {
                const typeColors: Record<string, string> = {
                  'Chest & Triceps': '#ef4444',
                  'Back & Abs': '#3b82f6',
                  'Biceps & Shoulders': '#22c55e',
                  'Legs, Rear Delt & Forearms': '#a855f7'
                };
                const sessionsByType: Record<string, typeof history> = {};
                history.forEach(s => {
                  if (!sessionsByType[s.type]) sessionsByType[s.type] = [];
                  sessionsByType[s.type].push(s);
                });
                return Object.entries(sessionsByType).map(([type, typeSessions]) => {
                  const color = typeColors[type] || '#3b82f6';
                  const chartData = typeSessions.slice().reverse().map(s => ({
                    date: new Date(s.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
                    volume: s.exercises.reduce((sum, e) => sum + e.sets.reduce((ss, st) => ss + (st.weight * st.reps), 0), 0)
                  }));
                  const latestVol = chartData.length > 0 ? chartData[chartData.length - 1].volume : 0;
                  const prevVol = chartData.length > 1 ? chartData[chartData.length - 2].volume : latestVol;
                  const trend = latestVol > prevVol ? '↑' : latestVol < prevVol ? '↓' : '→';
                  const trendColor = latestVol > prevVol ? 'text-green-500' : latestVol < prevVol ? 'text-red-500' : 'text-yellow-500';
                  return (
                    <div key={type} className="bg-slate-950 rounded-2xl p-4 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                          <span className="text-sm font-black uppercase tracking-tight text-white">{type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-black ${trendColor}`}>{trend}</span>
                          <span className="text-sm font-bold text-slate-400">{latestVol.toLocaleString()} kg</span>
                        </div>
                      </div>
                      {chartData.length > 1 ? (
                        <div className="h-20">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id={`color${type.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="volume" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color${type.replace(/\s/g, '')})`} />
                              <XAxis dataKey="date" hide />
                              <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-600 italic">Need 2+ sessions to show trend</p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderEditSession = () => {
    if (!editingSession) return null;
    const volume = editingSession.exercises.reduce((acc, ex) =>
      acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0
    );

    return (
      <div className="p-6 pb-24 animate-in fade-in duration-500" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={cancelEditSession} className="text-white bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:bg-slate-800">←</button>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{editingSession.type}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {new Date(editingSession.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={saveEditedSession} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-tighter text-sm active:scale-95 transition-transform">Save</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900/30 rounded-2xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Volume</p>
            <p className="text-2xl font-black text-blue-500">{volume.toLocaleString()} kg</p>
          </div>
          <div className="bg-slate-900/30 rounded-2xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Duration (mins)</p>
            <input
              type="number"
              value={Math.round((editingSession.duration || 0) / 60)}
              onChange={(e) => updateEditingDuration(parseInt(e.target.value) || 0)}
              className="w-full bg-transparent text-2xl font-black text-white focus:outline-none"
              min="0"
            />
          </div>
        </div>

        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4">Tap X to remove exercises or sets</p>

        {editingSession.exercises.map((ex) => (
          <div key={ex.id} className="bg-slate-950 rounded-3xl p-5 mb-4 border border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-black text-white">{ex.name || 'Unnamed Exercise'}</span>
              <button onClick={() => removeExerciseFromEdit(ex.id)} className="text-red-500 bg-red-950/30 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider active:bg-red-900">Remove</button>
            </div>

            <div className="space-y-2">
              {ex.sets.map((set, idx) => (
                <div key={set.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-600">#{idx + 1}</span>
                    <span className="font-bold text-blue-400">{set.weight} kg</span>
                    <span className="text-slate-500">×</span>
                    <span className="font-bold text-white">{set.reps} reps</span>
                    <span className="text-[10px] text-slate-600">= {set.weight * set.reps} kg</span>
                  </div>
                  <button onClick={() => removeSetFromEdit(ex.id, set.id)} className="text-red-900/50 hover:text-red-500 font-bold text-lg">✕</button>
                </div>
              ))}
              {ex.sets.length === 0 && (
                <p className="text-slate-700 text-sm italic text-center py-2">No sets</p>
              )}
            </div>
          </div>
        ))}

        {editingSession.exercises.length === 0 && (
          <div className="text-center py-12 opacity-30">
            <p className="font-black italic text-xl uppercase">No exercises</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Syncing with IronMind Cloud...</div>
      </div>
    );
  }

  // Show auth view if not logged in
  if (!authUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // Show profile setup if user is logged in but has no profile
  if (needsProfileSetup) {
    return (
      <ProfileSetup
        userId={authUser.id}
        userName={authUser.user_metadata?.name || ''}
        userEmail={authUser.email || ''}
        onComplete={handleProfileComplete}
      />
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto relative bg-black text-white selection:bg-blue-500 overflow-x-hidden">
      {view === 'Home' && renderHome()}
      {view === 'Active' && renderActive()}
      {view === 'History' && renderHistory()}
      {view === 'Report' && renderReport()}
      {view === 'EditSession' && renderEditSession()}
      {view === 'Nutrition' && (
        <NutritionView
          foods={foodLogs}
          waterLogs={waterLogs}
          goals={nutritionGoals}
          onAddFood={addFoodLog}
          onAddWater={addWaterLog}
          onDeleteFood={deleteFoodLog}
          onDeleteWater={deleteWaterLog}
          onBack={() => setView('Home')}
          onScanBarcode={handleScanBarcode}
          onPhotoEstimate={handlePhotoEstimate}
        />
      )}
      {showBarcodeScanner && (
        <BarcodeScanner
          onFoodFound={handleBarcodeFood}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
      {showPhotoEstimator && (
        <PhotoEstimator
          onFoodsFound={handlePhotoFoods}
          onClose={() => setShowPhotoEstimator(false)}
        />
      )}
      {/* Floating session indicator when active session exists but not on Active view */}
      {activeSession && view !== 'Active' && view !== 'EditSession' && (
        <button
          onClick={() => setView('Active')}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 z-50 shadow-xl border border-blue-500/50 animate-pulse"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          <span className="text-xs font-black uppercase tracking-wider">{formatDuration(timer)}</span>
          <span className="text-[10px] font-bold opacity-70">TAP TO RESUME</span>
        </button>
      )}
      {view !== 'EditSession' && (
        <nav className="fixed bottom-6 left-6 right-6 max-w-md mx-auto bg-slate-950/90 ios-blur border border-white/5 h-20 rounded-[40px] safe-bottom flex items-center justify-around z-50 px-4 shadow-2xl">
          <button onClick={() => setView('Home')} className={`p-4 rounded-full transition-all ${view === 'Home' ? 'text-blue-500 scale-110' : 'text-slate-700'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></button>
          <button onClick={() => setView('Nutrition')} className={`p-4 rounded-full transition-all ${view === 'Nutrition' ? 'text-orange-500 scale-110' : 'text-slate-700'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05l-5 2.05L14.5 4 11 5.81 7.5 3 3.99 5.05l1.64 16.48c.1.82.79 1.46 1.63 1.46h1.66c.83 0 1.52-.63 1.63-1.45L11 16.5v-3.69c0-.38.31-.69.69-.69h.62c.38 0 .69.31.69.69v3.69l.45 5.04c.11.82.8 1.45 1.63 1.45zM12 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg></button>
          <button onClick={() => setView('History')} className={`p-4 rounded-full transition-all ${view === 'History' ? 'text-blue-500 scale-110' : 'text-slate-700'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg></button>
          <button onClick={() => setView('Report')} className={`p-4 rounded-full transition-all ${view === 'Report' ? 'text-blue-500 scale-110' : 'text-slate-700'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></button>
          {activeSession && <button onClick={() => setView('Active')} className={`p-4 rounded-full transition-all ${view === 'Active' ? 'text-blue-500 scale-110' : 'text-green-500'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg></button>}
        </nav>
      )}
    </div>
  );
};

export default App;
