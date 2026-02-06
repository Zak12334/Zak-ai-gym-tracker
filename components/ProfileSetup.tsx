import React, { useState } from 'react';
import supabase from '../supabaseClient';

interface ProfileSetupProps {
  userId: string;
  userName: string;
  userEmail: string;
  onComplete: (profile: any) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ userId, userName, userEmail, onComplete }) => {
  const [name, setName] = useState(userName || '');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('5.75'); // 5'9"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heightOptions = [];
  for (let feet = 3; feet <= 6; feet++) {
    const maxInches = (feet === 6) ? 11 : 11;
    for (let inches = 0; inches <= maxInches; inches++) {
      const decimalValue = (feet + inches / 12).toFixed(2);
      heightOptions.push({
        label: `${feet}'${inches}"`,
        value: decimalValue
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !age || !weight || !height) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const profileData = {
      user_id: userId,
      email: userEmail,
      name: name.trim(),
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height)
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black animate-in fade-in duration-700">
      <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-2 text-center">Welcome</h1>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Complete Your Profile</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full fire-button py-5 rounded-3xl font-black uppercase tracking-widest text-white mt-4 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Start Training'}
        </button>
      </form>
    </div>
  );
};
