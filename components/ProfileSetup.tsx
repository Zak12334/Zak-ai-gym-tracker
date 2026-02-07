import React, { useState } from 'react';
import supabase from '../supabaseClient';
import { SplitType, PRESET_SPLITS, Gender, ActivityLevel, ACTIVITY_LEVELS } from '../types';
import { calculateNutritionGoals } from '../utils';

interface ProfileSetupProps {
  userId: string;
  userName: string;
  userEmail: string;
  onComplete: (profile: any) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ userId, userName, userEmail, onComplete }) => {
  const [step, setStep] = useState<'profile' | 'split' | 'day'>('profile');

  // Profile fields
  const [name, setName] = useState(userName || '');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('5.75'); // 5'9"
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('active'); // Default for gym users

  // Split fields
  const [splitType, setSplitType] = useState<SplitType>('ppl');
  const [customDays, setCustomDays] = useState<string[]>(['Day 1', 'Day 2', 'Day 3']);
  const [customRestPattern, setCustomRestPattern] = useState(3);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heightOptions = [];
  for (let feet = 4; feet <= 6; feet++) {
    const maxInches = (feet === 6) ? 11 : 11;
    for (let inches = 0; inches <= maxInches; inches++) {
      const decimalValue = (feet + inches / 12).toFixed(2);
      heightOptions.push({
        label: `${feet}'${inches}"`,
        value: decimalValue
      });
    }
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !weight || !height) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setStep('split');
  };

  const handleSplitSubmit = () => {
    setStep('day');
  };

  const getCurrentSplitDays = (): string[] => {
    if (splitType === 'custom') {
      return customDays;
    }
    return PRESET_SPLITS[splitType].days;
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);

    const splitDays = getCurrentSplitDays();
    const restPattern = splitType === 'custom' ? customRestPattern : PRESET_SPLITS[splitType].restPattern;

    // Calculate personalized nutrition goals
    const nutritionGoals = calculateNutritionGoals(
      parseFloat(weight),
      parseFloat(height),
      parseInt(age),
      gender,
      activityLevel
    );

    const profileData = {
      user_id: userId,
      email: userEmail,
      name: name.trim(),
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      gender: gender,
      activity_level: activityLevel,
      calorie_goal: nutritionGoals.tdee,
      protein_goal: nutritionGoals.protein,
      split_type: splitType,
      split_days: splitDays,
      split_rest_pattern: restPattern,
      split_current_day_index: currentDayIndex,
      split_start_date: new Date().toISOString().split('T')[0]
    };

    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (insertError) {
      console.error("Error saving profile:", insertError);
      setError("Failed to save profile. Please try again.");
      setLoading(false);
    } else {
      onComplete(data);
    }
  };

  const addCustomDay = () => {
    if (customDays.length < 7) {
      setCustomDays([...customDays, `Day ${customDays.length + 1}`]);
    }
  };

  const removeCustomDay = (index: number) => {
    if (customDays.length > 1) {
      setCustomDays(customDays.filter((_, i) => i !== index));
    }
  };

  const updateCustomDay = (index: number, value: string) => {
    const updated = [...customDays];
    updated[index] = value;
    setCustomDays(updated);
  };

  // Step 1: Profile Details
  if (step === 'profile') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black animate-in fade-in duration-700">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-2 text-center">Welcome</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Step 1: Your Details</p>

        <form onSubmit={handleProfileSubmit} className="w-full max-w-xs space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4">
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Name</label>
            <input
              required
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white placeholder-slate-700 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Gender selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Gender</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`p-4 rounded-2xl border font-bold transition-all ${
                  gender === 'male'
                    ? 'bg-blue-900/30 border-blue-500 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/30'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`p-4 rounded-2xl border font-bold transition-all ${
                  gender === 'female'
                    ? 'bg-pink-900/30 border-pink-500 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/30'
                }`}
              >
                Female
              </button>
            </div>
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
                placeholder="75"
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Activity Level</label>
            <div className="relative">
              <select
                required
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
              >
                {(Object.keys(ACTIVITY_LEVELS) as ActivityLevel[]).map((level) => (
                  <option key={level} value={level} className="bg-slate-900 text-white">
                    {ACTIVITY_LEVELS[level].label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 ml-1 mt-1">
              {ACTIVITY_LEVELS[activityLevel].description}
            </p>
          </div>

          <button
            type="submit"
            className="w-full fire-button py-5 rounded-3xl font-black uppercase tracking-widest text-white mt-4"
          >
            Next: Choose Split
          </button>
        </form>
      </div>
    );
  }

  // Step 2: Choose Split
  if (step === 'split') {
    return (
      <div className="flex flex-col items-center min-h-screen p-8 bg-black animate-in fade-in duration-500">
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2 text-center">Choose Your Split</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">Step 2: Workout Routine</p>

        <div className="w-full max-w-xs space-y-3">
          {/* Preset splits */}
          {(Object.keys(PRESET_SPLITS) as Array<Exclude<SplitType, 'custom'>>).map((key) => {
            const split = PRESET_SPLITS[key];
            return (
              <button
                key={key}
                onClick={() => setSplitType(key)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  splitType === key
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-slate-900/50 border-white/10 hover:border-white/30'
                }`}
              >
                <p className="font-black text-white">{split.name}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {split.days.join(' → ')} → Rest
                </p>
              </button>
            );
          })}

          {/* Custom option */}
          <button
            onClick={() => setSplitType('custom')}
            className={`w-full p-4 rounded-2xl border text-left transition-all ${
              splitType === 'custom'
                ? 'bg-purple-900/30 border-purple-500'
                : 'bg-slate-900/50 border-white/10 hover:border-white/30'
            }`}
          >
            <p className="font-black text-white">Custom Split</p>
            <p className="text-[10px] text-slate-500 mt-1">Build your own routine</p>
          </button>

          {/* Custom split builder */}
          {splitType === 'custom' && (
            <div className="bg-slate-900/30 rounded-2xl p-4 border border-purple-500/30 space-y-3 mt-4">
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Your Days</p>

              {customDays.map((day, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={day}
                    onChange={(e) => updateCustomDay(idx, e.target.value)}
                    placeholder={`Day ${idx + 1}`}
                    className="flex-1 bg-slate-800 border border-white/10 rounded-xl p-3 font-bold text-white placeholder-slate-700 focus:outline-none focus:border-purple-500"
                  />
                  {customDays.length > 1 && (
                    <button
                      onClick={() => removeCustomDay(idx)}
                      className="text-red-500/50 hover:text-red-500 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {customDays.length < 7 && (
                <button
                  onClick={addCustomDay}
                  className="w-full py-2 border border-dashed border-white/20 text-slate-500 rounded-xl text-sm font-bold hover:border-purple-500 hover:text-purple-400 transition-colors"
                >
                  + Add Day
                </button>
              )}

              <div className="pt-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rest after every</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={customRestPattern}
                    onChange={(e) => setCustomRestPattern(parseInt(e.target.value) || 1)}
                    className="w-20 bg-slate-800 border border-white/10 rounded-xl p-2 text-center font-bold text-white focus:outline-none"
                  />
                  <span className="text-slate-500 text-sm">workout days</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('profile')}
              className="flex-1 bg-slate-800 py-4 rounded-2xl font-black uppercase tracking-widest text-slate-400"
            >
              Back
            </button>
            <button
              onClick={handleSplitSubmit}
              className="flex-1 fire-button py-4 rounded-2xl font-black uppercase tracking-widest text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: What day are you on?
  if (step === 'day') {
    const splitDays = getCurrentSplitDays();

    return (
      <div className="flex flex-col items-center min-h-screen p-8 bg-black animate-in fade-in duration-500">
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2 text-center">Today's Workout</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">Step 3: Where are you in your rotation?</p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4 mb-4 w-full max-w-xs">
            <p className="text-red-400 text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="w-full max-w-xs space-y-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mb-2">
            What are you training today?
          </p>

          {splitDays.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentDayIndex(idx)}
              className={`w-full p-4 rounded-2xl border text-center transition-all ${
                currentDayIndex === idx
                  ? 'bg-green-900/30 border-green-500'
                  : 'bg-slate-900/50 border-white/10 hover:border-white/30'
              }`}
            >
              <p className="font-black text-white text-lg">{day}</p>
            </button>
          ))}

          <button
            onClick={() => setCurrentDayIndex(-1)}
            className={`w-full p-4 rounded-2xl border text-center transition-all ${
              currentDayIndex === -1
                ? 'bg-slate-700/30 border-slate-500'
                : 'bg-slate-900/50 border-white/10 hover:border-white/30'
            }`}
          >
            <p className="font-black text-slate-400">Rest Day</p>
          </button>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('split')}
              className="flex-1 bg-slate-800 py-4 rounded-2xl font-black uppercase tracking-widest text-slate-400"
            >
              Back
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="flex-1 fire-button py-4 rounded-2xl font-black uppercase tracking-widest text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Start Training'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
