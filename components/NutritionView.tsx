import React, { useState, useRef, useEffect } from 'react';
import { FoodLog, WaterLog, NutritionGoals } from '../types';
import { FOOD_DATABASE, searchFood, calculateNutrition, parseNaturalInput, FoodItem } from '../foodDatabase';
import { generateUUID } from '../utils';

interface NutritionViewProps {
  foods: FoodLog[];
  waterLogs: WaterLog[];
  goals: NutritionGoals;
  onAddFood: (food: FoodLog) => void;
  onAddWater: (water: WaterLog) => void;
  onDeleteFood: (id: string) => void;
  onDeleteWater: (id: string) => void;
  onBack: () => void;
  onScanBarcode: () => void;
  onPhotoEstimate: () => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  foods,
  waterLogs,
  goals,
  onAddFood,
  onAddWater,
  onDeleteFood,
  onDeleteWater,
  onBack,
  onScanBarcode,
  onPhotoEstimate
}) => {
  const [quickAddInput, setQuickAddInput] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState<number>(0);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Manual entry states
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualAmount, setManualAmount] = useState('100');
  const [manualUnit, setManualUnit] = useState<'g' | 'ml'>('g');

  // Calculate daily totals
  const today = new Date().toISOString().split('T')[0];
  const todayFoods = foods.filter(f => f.date === today);
  const todayWater = waterLogs.filter(w => w.date === today);

  const totals = {
    calories: todayFoods.reduce((sum, f) => sum + f.calories, 0),
    protein: todayFoods.reduce((sum, f) => sum + f.protein, 0),
    carbs: todayFoods.reduce((sum, f) => sum + f.carbs, 0),
    fat: todayFoods.reduce((sum, f) => sum + f.fat, 0),
    water: todayWater.reduce((sum, w) => sum + w.amount, 0)
  };

  // Progress percentages
  const progress = {
    calories: Math.min((totals.calories / goals.calories) * 100, 100),
    protein: Math.min((totals.protein / goals.protein) * 100, 100),
    water: Math.min((totals.water / goals.water) * 100, 100)
  };

  // Handle input change with search
  useEffect(() => {
    if (quickAddInput.length > 1) {
      const results = searchFood(quickAddInput);
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [quickAddInput]);

  const handleQuickAdd = () => {
    const parsed = parseNaturalInput(quickAddInput);
    if (parsed && parsed.food) {
      const nutrition = calculateNutrition(parsed.food, parsed.grams);
      const newFood: FoodLog = {
        id: generateUUID(),
        date: today,
        timestamp: Date.now(),
        name: parsed.food.name,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        amount: parsed.grams,
        unit: 'g',
        source: 'manual'
      };
      onAddFood(newFood);
      setQuickAddInput('');
      setShowQuickAdd(false);
      setSearchResults([]);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setGrams(food.defaultPortionG);
    setSearchResults([]);
    setQuickAddInput('');
  };

  const handleConfirmFood = () => {
    if (selectedFood && grams > 0) {
      const nutrition = calculateNutrition(selectedFood, grams);
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
    setIsManualMode(false);
    setShowQuickAdd(false);
  };

  const resetQuickAdd = () => {
    setShowQuickAdd(false);
    setSelectedFood(null);
    setSearchResults([]);
    setQuickAddInput('');
    setIsManualMode(false);
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setManualAmount('100');
    setManualUnit('g');
  };

  return (
    <div className="p-6 pb-40 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 active:bg-slate-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Nutrition</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
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
      <div className="bg-slate-900/50 rounded-3xl p-4 border border-white/5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Water</p>
            <p className="text-2xl font-black text-cyan-400">{(totals.water / 1000).toFixed(1)}L <span className="text-sm text-slate-600">/ {goals.water / 1000}L</span></p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAddWater(250)}
              className="bg-cyan-900/30 text-cyan-400 px-3 py-2 rounded-xl text-xs font-black active:scale-95 transition-transform"
            >
              +250ml
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="bg-cyan-900/30 text-cyan-400 px-3 py-2 rounded-xl text-xs font-black active:scale-95 transition-transform"
            >
              +500ml
            </button>
          </div>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progress.water}%` }}
          />
        </div>
        {/* Water drops visualization */}
        <div className="flex gap-1 mt-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-6 rounded-full transition-all duration-300 ${
                totals.water >= ((i + 1) * (goals.water / 8))
                  ? 'bg-cyan-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Add Food Buttons */}
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

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-end animate-in fade-in duration-200">
          <div className="w-full max-h-[85vh] bg-slate-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black uppercase">{isManualMode ? 'Manual Entry' : 'Quick Add'}</h3>
              <button onClick={resetQuickAdd} className="text-slate-500 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsManualMode(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!isManualMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Search Food
              </button>
              <button
                onClick={() => setIsManualMode(true)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isManualMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Enter Values
              </button>
            </div>

            {isManualMode ? (
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
            ) : !selectedFood ? (
              /* Search Mode */
              <>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Type food with amount (e.g., "250g chicken" or "2 eggs")</p>
                <input
                  ref={inputRef}
                  type="text"
                  value={quickAddInput}
                  onChange={(e) => setQuickAddInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  placeholder="250g chicken breast..."
                  className="w-full bg-slate-800 border border-white/10 rounded-2xl p-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-blue-500 mb-3"
                  autoFocus
                />

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {searchResults.map(food => (
                      <button
                        key={food.name}
                        onClick={() => handleSelectFood(food)}
                        className="w-full bg-slate-800/50 rounded-xl p-3 flex justify-between items-center active:bg-slate-700 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-white text-left">{food.name}</p>
                          <p className="text-[10px] text-slate-500">{food.portionName} = {food.defaultPortionG}g</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-orange-400">{food.caloriesPer100g} cal</p>
                          <p className="text-[10px] text-blue-400">{food.proteinPer100g}g protein</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleQuickAdd}
                  disabled={!quickAddInput}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-transform"
                >
                  Add Food
                </button>
              </>
            ) : (
              <>
                <div className="bg-slate-800 rounded-2xl p-4 mb-4">
                  <p className="font-black text-xl text-white mb-1">{selectedFood.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Per 100g: {selectedFood.caloriesPer100g} cal / {selectedFood.proteinPer100g}g protein</p>
                </div>

                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Amount (grams)</p>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setGrams(g => Math.max(0, g - 50))}
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
                    onClick={() => setGrams(g => g + 50)}
                    className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl active:bg-slate-700"
                  >
                    +
                  </button>
                </div>

                {/* Quick portion buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setGrams(selectedFood.defaultPortionG)}
                    className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400 active:bg-slate-700"
                  >
                    {selectedFood.portionName}
                  </button>
                  <button
                    onClick={() => setGrams(100)}
                    className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400 active:bg-slate-700"
                  >
                    100g
                  </button>
                  <button
                    onClick={() => setGrams(selectedFood.defaultPortionG * 2)}
                    className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400 active:bg-slate-700"
                  >
                    2x portion
                  </button>
                </div>

                {/* Preview */}
                {grams > 0 && (
                  <div className="bg-slate-800/50 rounded-xl p-3 mb-4 grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-black text-orange-400">{calculateNutrition(selectedFood, grams).calories}</p>
                      <p className="text-[8px] text-slate-500 uppercase">cal</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-blue-400">{calculateNutrition(selectedFood, grams).protein}g</p>
                      <p className="text-[8px] text-slate-500 uppercase">protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-green-400">{calculateNutrition(selectedFood, grams).carbs}g</p>
                      <p className="text-[8px] text-slate-500 uppercase">carbs</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-yellow-400">{calculateNutrition(selectedFood, grams).fat}g</p>
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
            )}
          </div>
        </div>
      )}

      {/* Today's Food Log */}
      <div className="mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Today's Log</h3>
        {todayFoods.length === 0 ? (
          <div className="bg-slate-900/30 rounded-2xl p-8 text-center">
            <p className="text-slate-700 font-bold italic">No food logged yet</p>
            <p className="text-[10px] text-slate-800 mt-1">Tap Quick Add to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayFoods.map(food => (
              <div key={food.id} className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{food.name}</p>
                  <p className="text-[10px] text-slate-500">{food.amount || food.grams}{food.unit || 'g'} • {food.source}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-orange-400">{food.calories} cal</p>
                    <p className="text-[10px] text-blue-400">{food.protein}g protein</p>
                  </div>
                  <button
                    onClick={() => onDeleteFood(food.id)}
                    className="text-red-900/50 hover:text-red-500 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Macros breakdown */}
      {todayFoods.length > 0 && (
        <div className="bg-slate-900/30 rounded-2xl p-4 border border-white/5">
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
    </div>
  );
};
