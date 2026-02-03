
import React, { useState, useEffect, useRef } from 'react';
import { WorkoutSession, DayType, Exercise, Set, UserProfile } from './types';
import { getWorkoutForToday, generateUUID, formatDuration } from './utils';
import { DEFAULT_EXERCISES } from './constants';
import { SessionCard } from './components/SessionCard';
import { generateMonthlyReport } from './services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import supabase from './supabaseClient';

type View = 'Home' | 'Active' | 'History' | 'Report';

const Onboarding: React.FC<{ onComplete: (profile: any) => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('6.0'); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && weight && height) {
      const profileData = {
        name,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height)
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Check connection.");
      } else {
        onComplete(data);
      }
    }
  };

  const heightOptions = [];
  for (let feet = 3; feet <= 6; feet++) {
    const maxInches = (feet === 6) ? 7 : 11;
    for (let inches = 0; inches <= maxInches; inches++) {
      const decimalValue = (feet + inches / 12).toFixed(2);
      heightOptions.push({
        label: `${feet}'${inches}"`,
        value: decimalValue
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black animate-in fade-in duration-700">
      <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-2 text-center">Zak's IronMind</h1>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Initializing Logical Core</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Name</label>
          <input 
            required
            type="text" 
            placeholder="e.g. Zak"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white placeholder-slate-700 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Age</label>
            <input 
              required
              type="number" 
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white placeholder-slate-700 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Weight (kg)</label>
            <input 
              required
              type="number" 
              step="0.1"
              placeholder="85.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white placeholder-slate-700 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Height</label>
          <div className="relative">
            <select
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
            >
              {heightOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
        </div>
        
        <button 
          type="submit"
          className="w-full fire-button py-5 rounded-3xl font-black uppercase tracking-widest text-white mt-4"
        >
          Finalize Profile
        </button>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('Home');
  const [profile, setProfile] = useState<any | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [timer, setTimer] = useState(0);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ "Back": false, "Abs": false });
  const [isLoading, setIsLoading] = useState(true);
  
  const [preferredMachines, setPreferredMachines] = useState<Record<string, string[]>>({});
  const timerRef = useRef<number | null>(null);

  // Helper to persist active session to localStorage
  const persistActiveSession = (session: WorkoutSession | null) => {
    if (session) {
      localStorage.setItem('activeSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('activeSession');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

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

      // Load Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        // Load Sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('date', { ascending: false });

        if (sessionData) {
          setHistory(sessionData);
          // Reconstruct preferred machines from history
          const machines: Record<string, string[]> = {};
          sessionData.forEach((s: any) => {
            if (!machines[s.type]) {
              machines[s.type] = s.exercises.map((e: any) => e.name);
            }
          });
          setPreferredMachines(machines);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

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
    const type = getWorkoutForToday();
    const userDefined = preferredMachines[type];
    const initialExerciseNames = (userDefined && userDefined.length > 0) 
      ? userDefined 
      : DEFAULT_EXERCISES[type as DayType] || [];

    const initialExercises = initialExerciseNames.map(name => {
      return {
        id: generateUUID(),
        name,
        sets: []  // Start fresh - don't pre-fill sets from previous sessions
      };
    });

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
    setExpandedSections({ "Back": false, "Abs": false });
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

  const addExercise = (prefix: string = "") => {
    setActiveSession(prev => {
      if (!prev) return null;
      const newEx = {
        id: generateUUID(),
        name: prefix ? `${prefix}: ` : '',
        sets: []
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
    if (!activeSession || !profile) return;
    
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
    } else {
      setHistory(prev => [data, ...prev]);
      // Update preferred machines cache
      const namesUsed = activeSession.exercises.map(e => e.name.trim()).filter(n => n !== "");
      if (namesUsed.length > 0) {
        setPreferredMachines(prev => ({ ...prev, [activeSession.type]: namesUsed }));
      }
      setActiveSession(null);
      persistActiveSession(null);
      setTimer(0);
      setView('Home');
    }
  };

  const fetchAiReport = async () => {
    if (history.length < 8) {
      alert(`Zak, IronMind needs at least 8 sessions (2 weeks) to identify progression patterns. Progress: ${history.length}/8`);
      return;
    }
    setIsGeneratingReport(true);
    setView('Report');
    const report = await generateMonthlyReport(history, profile);
    setAiReport(report);
    setIsGeneratingReport(false);
  };

  const renderHome = () => {
    const todayWorkout = getWorkoutForToday();
    const firstName = profile?.name || 'Zak';
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] p-8 text-center animate-in fade-in duration-500">
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

  const renderExercise = (ex: Exercise) => (
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

  const renderActive = () => {
    if (!activeSession) return null;
    const isBackAbsDay = activeSession.type === DayType.BackAbs;
    
    const backEx = activeSession.exercises.filter(e => e.name.toLowerCase().includes('back:'));
    const absEx = activeSession.exercises.filter(e => e.name.toLowerCase().includes('abs:'));
    const otherEx = activeSession.exercises.filter(e => !e.name.toLowerCase().includes('back:') && !e.name.toLowerCase().includes('abs:'));

    return (
      <div className="p-6 pb-48 animate-in slide-in-from-bottom-10 duration-500">
        <div className="flex justify-between items-start mb-8 sticky top-0 bg-black/80 ios-blur py-4 z-20 -mx-6 px-6">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">{activeSession.type}</h2>
            <p className="text-blue-500 font-black text-2xl tracking-tight">{formatDuration(timer)}</p>
          </div>
          <button onClick={finishSession} className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase tracking-tighter active:scale-95 transition-transform">FINISH</button>
        </div>

        {!isBackAbsDay && (
          <button onClick={() => addExercise()} className="w-full py-5 border-2 border-dashed border-white/10 text-slate-600 rounded-3xl font-black uppercase tracking-widest text-xs mb-8 hover:border-blue-500 hover:text-blue-500 transition-colors">+ Add Machine</button>
        )}

        {isBackAbsDay ? (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-[2.5rem] overflow-hidden bg-slate-900/20 backdrop-blur-md">
              <button onClick={() => setExpandedSections(p => ({ ...p, Back: !p.Back }))} className="w-full p-6 flex justify-between items-center transition-colors hover:bg-white/5 active:bg-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xl font-black italic tracking-tighter uppercase text-white">Back</span>
                </div>
                <svg className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${expandedSections['Back'] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections['Back'] && (
                <div className="p-5 bg-black/40 space-y-4 border-t border-white/10">
                  <button onClick={() => addExercise("Back")} className="w-full py-4 border border-dashed border-white/10 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-blue-400 transition-colors">+ Add Back Machine</button>
                  {backEx.map(renderExercise)}
                </div>
              )}
            </div>

            <div className="border border-white/10 rounded-[2.5rem] overflow-hidden bg-slate-900/20 backdrop-blur-md">
              <button onClick={() => setExpandedSections(p => ({ ...p, Abs: !p.Abs }))} className="w-full p-6 flex justify-between items-center transition-colors hover:bg-white/5 active:bg-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xl font-black italic tracking-tighter uppercase text-white">Abs</span>
                </div>
                <svg className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${expandedSections['Abs'] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections['Abs'] && (
                <div className="p-5 bg-black/40 space-y-4 border-t border-white/10">
                  <button onClick={() => addExercise("Abs")} className="w-full py-4 border border-dashed border-white/10 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-blue-400 transition-colors">+ Add Abs Machine</button>
                  {absEx.map(renderExercise)}
                </div>
              )}
            </div>
            {otherEx.map(renderExercise)}
          </div>
        ) : (
          activeSession.exercises.map(renderExercise)
        )}

        <div className="mt-16 text-center pb-20">
          <button onClick={cancelSession} className="text-red-500/30 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all">Discard Workout</button>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="p-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('Home')} className="text-white bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:bg-slate-800">←</button>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Logs</h2>
        </div>
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{history.length} Sessions</div>
      </div>
      {history.length === 0 ? (
        <div className="mt-20 text-center opacity-20"><p className="font-black italic text-2xl mb-2 uppercase">No Data</p></div>
      ) : history.map(s => <SessionCard key={s.id} session={s} onDelete={() => deleteSession(s.id)} />)}
    </div>
  );

  const renderReport = () => (
    <div className="p-6 pb-24 animate-in fade-in duration-500">
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
            <div className="bg-slate-950 rounded-3xl p-6 border border-white/5 h-64">
              <h3 className="font-black italic tracking-tighter text-lg mb-4 text-white uppercase">Overall Load</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.slice().reverse().map(s => ({
                  date: new Date(s.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
                  volume: s.exercises.reduce((sum, e) => sum + e.sets.reduce((ss, st) => ss + (st.weight * st.reps), 0), 0)
                }))}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111827" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#000000', borderRadius: '12px', border: '1px solid #1e293b' }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Syncing with IronMind Cloud...</div>
      </div>
    );
  }

  if (!profile) return <Onboarding onComplete={(p) => setProfile(p)} />;

  return (
    <div className="min-h-screen max-w-md mx-auto relative bg-black text-white selection:bg-blue-500 overflow-x-hidden">
      {view === 'Home' && renderHome()}
      {view === 'Active' && renderActive()}
      {view === 'History' && renderHistory()}
      {view === 'Report' && renderReport()}
      {view !== 'Active' && (
        <nav className="fixed bottom-6 left-6 right-6 max-w-md mx-auto bg-slate-950/90 ios-blur border border-white/5 h-20 rounded-[40px] safe-bottom flex items-center justify-around z-50 px-4 shadow-2xl">
          <button onClick={() => setView('Home')} className={`p-4 rounded-full transition-all ${view === 'Home' ? 'text-blue-500 scale-110' : 'text-slate-700'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></button>
          <button onClick={() => setView('History')} className={`p-4 rounded-full transition-all ${view === 'History' ? 'text-blue-500 scale-110' : 'text-slate-700'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg></button>
          <button onClick={() => setView('Report')} className={`p-4 rounded-full transition-all ${view === 'Report' ? 'text-blue-500 scale-110' : 'text-slate-700'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></button>
        </nav>
      )}
    </div>
  );
};

export default App;
