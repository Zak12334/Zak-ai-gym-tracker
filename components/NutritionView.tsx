import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FoodLog, WaterLog, NutritionGoals, SavedMeal } from '../types';
import { generateUUID } from '../utils';

// API Food result type - from real food databases (USDA, Open Food Facts)
interface ApiFoodResult {
  id: string;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingSize?: number;
  servingUnit?: string;
  source: 'usda' | 'openfoodfacts';
}

// Calculate nutrition for a given weight
const calculateNutritionFromApi = (food: ApiFoodResult, grams: number) => {
  const multiplier = grams / 100;
  return {
    calories: Math.round(food.caloriesPer100g * multiplier),
    protein: Math.round(food.proteinPer100g * multiplier * 10) / 10,
    carbs: Math.round(food.carbsPer100g * multiplier * 10) / 10,
    fat: Math.round(food.fatPer100g * multiplier * 10) / 10
  };
};

interface NutritionViewProps {
  foods: FoodLog[];
  waterLogs: WaterLog[];
  goals: NutritionGoals;
  savedMeals: SavedMeal[];
  onAddFood: (food: FoodLog) => void;
  onAddWater: (water: WaterLog) => void;
  onDeleteFood: (id: string) => void;
  onDeleteWater: (id: string) => void;
  onSaveMeal: (meal: Omit<SavedMeal, 'id' | 'profile_id' | 'created_at'>) => void;
  onDeleteSavedMeal: (id: string) => void;
  onAddFromSavedMeal: (meal: SavedMeal) => void;
  onBack: () => void;
  onScanBarcode: () => void;
  onPhotoEstimate: () => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  foods,
  waterLogs,
  goals,
  savedMeals,
  onAddFood,
  onAddWater,
  onDeleteFood,
  onDeleteWater,
  onSaveMeal,
  onDeleteSavedMeal,
  onAddFromSavedMeal,
  onBack,
  onScanBarcode,
  onPhotoEstimate
}) => {
  const [quickAddInput, setQuickAddInput] = useState('');
  const [searchResults, setSearchResults] = useState<ApiFoodResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<ApiFoodResult | null>(null);
  const [grams, setGrams] = useState<number>(0);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Date navigation
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    if (direction === 'prev') {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    if (dateStr === today) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Handle keyboard visibility for iOS
  useEffect(() => {
    if (!showQuickAdd) return;

    const handleResize = () => {
      // On iOS, when keyboard opens, visualViewport height decreases
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        setKeyboardVisible(isKeyboard);
      }
    };

    // Small delay to let modal animation complete before focusing
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 350);

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(focusTimer);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [showQuickAdd]);

  // Quick add mode: 'search' | 'saved' | 'manual'
  type QuickAddMode = 'search' | 'saved' | 'manual';
  const [quickAddMode, setQuickAddMode] = useState<QuickAddMode>('saved'); // Default to saved for quick access
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualAmount, setManualAmount] = useState('100');
  const [manualUnit, setManualUnit] = useState<'g' | 'ml'>('g');

  // Calculate daily totals for selected date
  const selectedFoods = foods.filter(f => f.date === selectedDate);
  const selectedWater = waterLogs.filter(w => w.date === selectedDate);

  const totals = {
    calories: selectedFoods.reduce((sum, f) => sum + f.calories, 0),
    protein: selectedFoods.reduce((sum, f) => sum + f.protein, 0),
    carbs: selectedFoods.reduce((sum, f) => sum + f.carbs, 0),
    fat: selectedFoods.reduce((sum, f) => sum + f.fat, 0),
    water: selectedWater.reduce((sum, w) => sum + w.amount, 0)
  };

  // Progress percentages
  const progress = {
    calories: Math.min((totals.calories / goals.calories) * 100, 100),
    protein: Math.min((totals.protein / goals.protein) * 100, 100),
    water: Math.min((totals.water / goals.water) * 100, 100)
  };

  // Calculate weekly stats (last 7 days)
  const getWeeklyStats = () => {
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const dailyData = last7Days.map(date => {
      const dayFoods = foods.filter(f => f.date === date);
      const dayWater = waterLogs.filter(w => w.date === date);
      const calories = dayFoods.reduce((sum, f) => sum + f.calories, 0);
      const protein = dayFoods.reduce((sum, f) => sum + f.protein, 0);
      const water = dayWater.reduce((sum, w) => sum + w.amount, 0);
      return {
        date,
        calories,
        protein,
        water,
        hitCalories: calories >= goals.calories * 0.9,
        hitProtein: protein >= goals.protein * 0.9,
        hitWater: water >= goals.water * 0.9,
        hasData: dayFoods.length > 0 || dayWater.length > 0
      };
    });

    const daysWithData = dailyData.filter(d => d.hasData);
    const avgCalories = daysWithData.length > 0 ? Math.round(daysWithData.reduce((sum, d) => sum + d.calories, 0) / daysWithData.length) : 0;
    const avgProtein = daysWithData.length > 0 ? Math.round(daysWithData.reduce((sum, d) => sum + d.protein, 0) / daysWithData.length) : 0;
    const avgWater = daysWithData.length > 0 ? Math.round(daysWithData.reduce((sum, d) => sum + d.water, 0) / daysWithData.length) : 0;

    // Calculate protein streak (consecutive days hitting 90%+ of goal)
    let proteinStreak = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
      if (dailyData[i].hitProtein) proteinStreak++;
      else break;
    }

    // Calculate calorie streak
    let calorieStreak = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
      if (dailyData[i].hitCalories) calorieStreak++;
      else break;
    }

    return { dailyData, avgCalories, avgProtein, avgWater, proteinStreak, calorieStreak, daysTracked: daysWithData.length };
  };

  const weeklyStats = getWeeklyStats();

  // Handle input change with API search (debounced)
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (quickAddInput.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    // Debounce API calls - wait 400ms after user stops typing
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-food?query=${encodeURIComponent(quickAddInput)}`);

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setSearchResults(data.foods || []);
        setSearchError(null);
      } catch (error) {
        console.error('Food search error:', error);
        setSearchResults([]);
        setSearchError('Search failed. Try again or use manual entry.');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [quickAddInput]);

  const handleQuickAdd = () => {
    // If there are search results, select the first one
    if (searchResults.length > 0) {
      handleSelectFood(searchResults[0]);
      return;
    }
    // Otherwise switch to manual entry mode
    setQuickAddMode('manual');
    setManualName(quickAddInput);
  };

  const handleSelectFood = (food: ApiFoodResult) => {
    setSelectedFood(food);
    // Use serving size if available, otherwise default to 100g
    const defaultGrams = food.servingSize || 100;
    setGrams(defaultGrams);
    setSearchResults([]);
    setQuickAddInput('');
  };

  const handleConfirmFood = () => {
    if (selectedFood && grams > 0) {
      const nutrition = calculateNutritionFromApi(selectedFood, grams);
      const newFood: FoodLog = {
        id: generateUUID(),
        date: today,
        timestamp: Date.now(),
        name: selectedFood.name,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        amount: grams,
        unit: 'g',
        source: 'manual'
      };
      onAddFood(newFood);
      setSelectedFood(null);
      setGrams(0);
      setShowQuickAdd(false);
    }
  };

  const handleAddWater = (amount: number) => {
    const newWater: WaterLog = {
      id: generateUUID(),
      date: today,
      timestamp: Date.now(),
      amount
    };
    onAddWater(newWater);
  };

  // Handle manual food entry
  const handleManualEntry = () => {
    if (!manualName.trim()) return;

    const newFood: FoodLog = {
      id: generateUUID(),
      date: today,
      timestamp: Date.now(),
      name: manualName.trim(),
      calories: parseInt(manualCalories) || 0,
      protein: parseFloat(manualProtein) || 0,
      carbs: parseFloat(manualCarbs) || 0,
      fat: parseFloat(manualFat) || 0,
      amount: parseInt(manualAmount) || 0,
      unit: manualUnit,
      source: 'manual'
    };
    onAddFood(newFood);

    // Reset manual entry form
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setManualAmount('100');
    setManualUnit('g');
    setQuickAddMode('saved');
    setShowQuickAdd(false);
  };

  const resetQuickAdd = () => {
    setShowQuickAdd(false);
    setSelectedFood(null);
    setSearchResults([]);
    setQuickAddInput('');
    setQuickAddMode('saved');
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setManualAmount('100');
    setManualUnit('g');
  };

  return (
    <div className="p-6 pb-40 animate-in fade-in duration-500" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:bg-slate-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Nutrition</h2>
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-slate-900/50 rounded-2xl p-3 mb-6 border border-white/5">
        <button
          onClick={() => navigateDate('prev')}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center active:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-center">
          <p className="font-black text-white text-lg">{formatDateDisplay(selectedDate)}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigateDate('next')}
          disabled={isToday}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isToday ? 'bg-slate-900 text-slate-700' : 'bg-slate-800 text-white active:bg-slate-700'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      {/* Weekly Overview - Mini Calendar Heatmap */}
      <div className="bg-slate-900/30 rounded-2xl p-4 border border-white/5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last 7 Days</h3>
          <div className="flex gap-3">
            {weeklyStats.proteinStreak > 0 && (
              <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                <span className="text-sm">🔥</span> {weeklyStats.proteinStreak} day protein streak
              </span>
            )}
          </div>
        </div>

        {/* Mini Calendar Heatmap */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weeklyStats.dailyData.map((day, i) => {
            const dayOfWeek = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }).charAt(0);
            const isSelected = day.date === selectedDate;
            let bgColor = 'bg-slate-800'; // No data
            if (day.hasData) {
              if (day.hitProtein && day.hitCalories) bgColor = 'bg-green-600';
              else if (day.hitProtein || day.hitCalories) bgColor = 'bg-yellow-600';
              else bgColor = 'bg-red-600/50';
            }
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${bgColor} ${isSelected ? 'ring-2 ring-white' : ''}`}
              >
                <span className="text-[8px] text-slate-400 uppercase">{dayOfWeek}</span>
                <span className="text-xs font-bold text-white">{new Date(day.date).getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Weekly Averages */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-800/50 rounded-xl p-2">
            <p className="text-lg font-black text-orange-400">{weeklyStats.avgCalories}</p>
            <p className="text-[8px] text-slate-500 uppercase">Avg Cal</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-2">
            <p className="text-lg font-black text-blue-400">{weeklyStats.avgProtein}g</p>
            <p className="text-[8px] text-slate-500 uppercase">Avg Protein</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-2">
            <p className="text-lg font-black text-cyan-400">{(weeklyStats.avgWater / 1000).toFixed(1)}L</p>
            <p className="text-[8px] text-slate-500 uppercase">Avg Water</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-3 text-[8px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-600"></span> Hit goals</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-600"></span> Partial</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-600/50"></span> Missed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-800"></span> No data</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Calories */}
        <div className="bg-slate-900/50 rounded-3xl p-4 border border-white/5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Calories</p>
            <span className="text-[10px] text-slate-600">{goals.calories} goal</span>
          </div>
          <p className="text-3xl font-black text-orange-500">{totals.calories}</p>
          <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${progress.calories}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="bg-slate-900/50 rounded-3xl p-4 border border-white/5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protein</p>
            <span className="text-[10px] text-slate-600">{goals.protein}g goal</span>
          </div>
          <p className="text-3xl font-black text-blue-500">{Math.round(totals.protein)}g</p>
          <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progress.protein}%` }}
            />
          </div>
        </div>
      </div>

      {/* Water Tracker */}
      <div className="bg-slate-900/50 rounded-3xl p-5 border border-white/5 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Water Intake</p>
            <p className="text-3xl font-black text-cyan-400">
              {(totals.water / 1000).toFixed(1)}
              <span className="text-lg text-slate-500 font-bold">L</span>
              <span className="text-sm text-slate-600 font-normal"> / {goals.water / 1000}L</span>
            </p>
          </div>
          {/* Percentage circle */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
              <circle
                cx="32" cy="32" r="28"
                stroke="url(#waterGradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${progress.water * 1.76} 176`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-cyan-400">
              {Math.round(progress.water)}%
            </span>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => handleAddWater(250)}
            className="bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all border border-cyan-800/30"
          >
            +250ml
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all border border-cyan-800/30"
          >
            +500ml
          </button>
          <button
            onClick={() => handleAddWater(750)}
            className="bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all border border-cyan-800/30"
          >
            +750ml
          </button>
          <button
            onClick={() => handleAddWater(1000)}
            className="bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all border border-cyan-800/30"
          >
            +1L
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(progress.water, 100)}%` }}
          />
        </div>

        {/* Today's water logs with delete option */}
        {selectedWater.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedWater.slice(0, 6).map((log) => (
              <button
                key={log.id}
                onClick={() => onDeleteWater(log.id)}
                className="bg-slate-800/50 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-900/30 hover:text-red-400 transition-colors group"
              >
                <span>{log.amount >= 1000 ? `${log.amount / 1000}L` : `${log.amount}ml`}</span>
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
            {selectedWater.length > 6 && (
              <span className="text-slate-600 text-xs font-bold px-2 py-1.5">+{selectedWater.length - 6} more</span>
            )}
          </div>
        )}
      </div>

      {/* Add Food Buttons (only show when viewing today) */}
      {isToday ? (
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={onScanBarcode}
            className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="text-[10px] font-black uppercase text-slate-400">Scan</span>
          </button>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-black uppercase text-slate-400">Quick Add</span>
          </button>
          <button
            onClick={onPhotoEstimate}
            className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-black uppercase text-slate-400">Photo</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setSelectedDate(today)}
          className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl p-4 mb-6 font-bold active:bg-blue-600/30 transition-colors"
        >
          Jump to Today to Add Food
        </button>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-end animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className={`w-full bg-slate-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 overflow-y-auto transition-all ${keyboardVisible ? 'max-h-[50vh]' : 'max-h-[85vh]'}`}
            style={{ paddingBottom: keyboardVisible ? '1rem' : '2rem' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black uppercase">
                {quickAddMode === 'saved' ? 'Saved Meals' : quickAddMode === 'manual' ? 'Manual Entry' : 'Quick Add'}
              </h3>
              <button onClick={resetQuickAdd} className="text-slate-500 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Mode Toggle - 3 tabs */}
            <div className="flex gap-1 mb-4 bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setQuickAddMode('saved')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${quickAddMode === 'saved' ? 'bg-green-600 text-white' : 'text-slate-400'}`}
              >
                Saved
              </button>
              <button
                onClick={() => setQuickAddMode('search')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${quickAddMode === 'search' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                Search
              </button>
              <button
                onClick={() => setQuickAddMode('manual')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${quickAddMode === 'manual' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              >
                Manual
              </button>
            </div>

            {/* SAVED MEALS TAB */}
            {quickAddMode === 'saved' && (
              <>
                {savedMeals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🍽️</div>
                    <p className="text-slate-400 font-bold mb-2">No saved meals yet</p>
                    <p className="text-slate-600 text-sm">Save foods from your log to quickly add them later</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {savedMeals.map(meal => (
                      <div
                        key={meal.id}
                        className="bg-slate-800/50 rounded-xl p-3 flex justify-between items-center group"
                      >
                        <button
                          onClick={() => {
                            onAddFromSavedMeal(meal);
                            resetQuickAdd();
                          }}
                          className="flex-1 text-left"
                        >
                          <p className="font-bold text-white">{meal.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {meal.amount}{meal.unit} • {meal.calories} cal • {meal.protein}g protein
                          </p>
                        </button>
                        <button
                          onClick={() => onDeleteSavedMeal(meal.id)}
                          className="p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-slate-600 text-center mt-4">Tap a meal to add it to today's log</p>
              </>
            )}

            {quickAddMode === 'manual' ? (
              /* Manual Entry Mode */
              <>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Enter your own values from the label</p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Food Name</label>
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="e.g., Tuna can"
                      className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-blue-500 mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Calories</label>
                      <input
                        type="number"
                        value={manualCalories}
                        onChange={(e) => setManualCalories(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-orange-400 font-black text-lg placeholder-slate-700 focus:outline-none focus:border-orange-500 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protein (g)</label>
                      <input
                        type="number"
                        value={manualProtein}
                        onChange={(e) => setManualProtein(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-blue-400 font-black text-lg placeholder-slate-700 focus:outline-none focus:border-blue-500 mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Carbs (g)</label>
                      <input
                        type="number"
                        value={manualCarbs}
                        onChange={(e) => setManualCarbs(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-green-400 font-black text-lg placeholder-slate-700 focus:outline-none focus:border-green-500 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fat (g)</label>
                      <input
                        type="number"
                        value={manualFat}
                        onChange={(e) => setManualFat(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-yellow-400 font-black text-lg placeholder-slate-700 focus:outline-none focus:border-yellow-500 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Portion Size</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="100"
                        className="flex-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-white font-bold placeholder-slate-700 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex bg-slate-800 rounded-xl border border-white/10 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setManualUnit('g')}
                          className={`px-4 py-3 font-bold text-sm transition-all ${manualUnit === 'g' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                        >
                          g
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualUnit('ml')}
                          className={`px-4 py-3 font-bold text-sm transition-all ${manualUnit === 'ml' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                        >
                          ml
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleManualEntry}
                  disabled={!manualName.trim()}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-transform mt-4"
                >
                  Add Food
                </button>
              </>
            ) : quickAddMode === 'search' && !selectedFood ? (
              /* Search Mode - Real Food Database */
              <>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Search real food database (USDA + Open Food Facts)</p>
                <p className="text-[9px] text-green-500/70 mb-3">Accurate nutrition data like MyFitnessPal</p>
                <input
                  ref={inputRef}
                  type="text"
                  value={quickAddInput}
                  onChange={(e) => setQuickAddInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  placeholder="Search any food..."
                  className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-blue-500 mb-3"
                />

                {/* Loading State */}
                {isSearching && (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-slate-400 text-sm">Searching food database...</span>
                  </div>
                )}

                {/* Error State */}
                {searchError && !isSearching && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-3">
                    <p className="text-red-400 text-sm">{searchError}</p>
                  </div>
                )}

                {/* Search Results */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
                    {searchResults.map(food => (
                      <button
                        key={food.id}
                        onClick={() => handleSelectFood(food)}
                        className="w-full bg-slate-800/50 rounded-xl p-3 flex justify-between items-center active:bg-slate-700 transition-colors"
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-bold text-white text-sm truncate">{food.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                              food.source === 'usda' ? 'bg-green-900/50 text-green-400' : 'bg-orange-900/50 text-orange-400'
                            }`}>
                              {food.source === 'usda' ? 'USDA' : 'OFF'}
                            </span>
                            <span className="text-[10px] text-slate-500">per 100g</span>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-sm font-bold text-orange-400">{food.caloriesPer100g} cal</p>
                          <p className="text-[10px] text-blue-400">{food.proteinPer100g}g P • {food.carbsPer100g}g C • {food.fatPer100g}g F</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {!isSearching && !searchError && quickAddInput.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-slate-400 text-sm mb-2">No results found for "{quickAddInput}"</p>
                    <button
                      onClick={() => {
                        setQuickAddMode('manual');
                        setManualName(quickAddInput);
                      }}
                      className="text-blue-400 text-sm font-bold"
                    >
                      Enter nutrition manually instead
                    </button>
                  </div>
                )}

                <button
                  onClick={handleQuickAdd}
                  disabled={!quickAddInput || isSearching}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-transform"
                >
                  {searchResults.length > 0 ? 'Select First Result' : 'Search'}
                </button>
              </>
            ) : quickAddMode === 'search' && selectedFood ? (
              <>
                <div className="bg-slate-800 rounded-2xl p-4 mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-xl text-white mb-1 flex-1">{selectedFood.name}</p>
                    <span className={`text-[8px] px-2 py-1 rounded font-bold shrink-0 ${
                      selectedFood.source === 'usda' ? 'bg-green-900/50 text-green-400' : 'bg-orange-900/50 text-orange-400'
                    }`}>
                      {selectedFood.source === 'usda' ? 'USDA' : 'Open Food Facts'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Per 100g: {selectedFood.caloriesPer100g} cal / {selectedFood.proteinPer100g}g protein / {selectedFood.carbsPer100g}g carbs / {selectedFood.fatPer100g}g fat</p>
                </div>

                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Amount (grams)</p>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setGrams(g => Math.max(0, g - 25))}
                    className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl active:bg-slate-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={grams}
                    onChange={(e) => setGrams(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-center text-2xl font-black text-white focus:outline-none"
                  />
                  <button
                    onClick={() => setGrams(g => g + 25)}
                    className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl active:bg-slate-700"
                  >
                    +
                  </button>
                </div>

                {/* Quick portion buttons */}
                <div className="flex gap-2 mb-4">
                  {selectedFood.servingSize && (
                    <button
                      onClick={() => setGrams(selectedFood.servingSize!)}
                      className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400 active:bg-slate-700"
                    >
                      {selectedFood.servingSize}{selectedFood.servingUnit || 'g'}
                    </button>
                  )}
                  <button
                    onClick={() => setGrams(50)}
                    className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400 active:bg-slate-700"
                  >
                    50g
                  </button>
                  <button
                    onClick={() => setGrams(100)}
                    className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400 active:bg-slate-700"
                  >
                    100g
                  </button>
                  <button
                    onClick={() => setGrams(150)}
                    className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400 active:bg-slate-700"
                  >
                    150g
                  </button>
                  <button
                    onClick={() => setGrams(200)}
                    className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400 active:bg-slate-700"
                  >
                    200g
                  </button>
                </div>

                {/* Preview */}
                {grams > 0 && (
                  <div className="bg-slate-800/50 rounded-xl p-3 mb-4 grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-black text-orange-400">{calculateNutritionFromApi(selectedFood, grams).calories}</p>
                      <p className="text-[8px] text-slate-500 uppercase">cal</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-blue-400">{calculateNutritionFromApi(selectedFood, grams).protein}g</p>
                      <p className="text-[8px] text-slate-500 uppercase">protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-green-400">{calculateNutritionFromApi(selectedFood, grams).carbs}g</p>
                      <p className="text-[8px] text-slate-500 uppercase">carbs</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-yellow-400">{calculateNutritionFromApi(selectedFood, grams).fat}g</p>
                      <p className="text-[8px] text-slate-500 uppercase">fat</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFood(null)}
                    className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-wider active:scale-95 transition-transform"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmFood}
                    disabled={grams <= 0}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-transform"
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Macros breakdown */}
      {selectedFoods.length > 0 && (
        <div className="bg-slate-900/30 rounded-2xl p-4 border border-white/5 mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Macro Breakdown</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-green-400">{Math.round(totals.carbs)}g</p>
              <p className="text-[10px] text-slate-500 uppercase">Carbs</p>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-400">{Math.round(totals.protein)}g</p>
              <p className="text-[10px] text-slate-500 uppercase">Protein</p>
            </div>
            <div>
              <p className="text-2xl font-black text-yellow-400">{Math.round(totals.fat)}g</p>
              <p className="text-[10px] text-slate-500 uppercase">Fat</p>
            </div>
          </div>
        </div>
      )}

      {/* Food Log for Selected Date */}
      <div className="mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">{isToday ? "Today's Log" : formatDateDisplay(selectedDate) + "'s Log"}</h3>
        {selectedFoods.length === 0 ? (
          <div className="bg-slate-900/30 rounded-2xl p-8 text-center">
            <p className="text-slate-700 font-bold italic">No food logged yet</p>
            <p className="text-[10px] text-slate-800 mt-1">Tap Quick Add to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedFoods.map(food => {
              const isAlreadySaved = savedMeals.some(m => m.name === food.name && m.amount === (food.amount || 0) && m.calories === food.calories);
              return (
                <div key={food.id} className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">{food.name}</p>
                    <p className="text-[10px] text-slate-500">{food.amount || food.grams}{food.unit || 'g'} • {food.source}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-orange-400">{food.calories} cal</p>
                      <p className="text-[10px] text-blue-400">{food.protein}g protein</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!isAlreadySaved) {
                          onSaveMeal({
                            name: food.name,
                            calories: food.calories,
                            protein: food.protein,
                            carbs: food.carbs,
                            fat: food.fat,
                            amount: food.amount || 0,
                            unit: food.unit || 'g'
                          });
                        }
                      }}
                      disabled={isAlreadySaved}
                      className={`p-1.5 transition-colors ${isAlreadySaved ? 'text-green-500' : 'text-slate-700 hover:text-green-500 active:scale-95'}`}
                      title={isAlreadySaved ? 'Already saved' : 'Save for quick access'}
                    >
                      <svg className="w-4 h-4" fill={isAlreadySaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteFood(food.id)}
                      className="text-red-900/50 hover:text-red-500 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
