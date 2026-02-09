import React, { useState, useRef } from 'react';
import { FoodLog } from '../types';
import { generateUUID } from '../utils';

interface PhotoEstimatorProps {
  onFoodsFound: (foods: FoodLog[]) => void;
  onClose: () => void;
}

interface EstimatedFood {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  selected: boolean;
}

export const PhotoEstimator: React.FC<PhotoEstimatorProps> = ({ onFoodsFound, onClose }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedFoods, setEstimatedFoods] = useState<EstimatedFood[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      await analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64DataUrl: string) => {
    setIsAnalyzing(true);
    setError(null);
    setEstimatedFoods([]);

    try {
      // Extract just the base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = base64DataUrl.split(',')[1];

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64Data })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze image');
      }

      const data = await response.json();

      if (data.foods && Array.isArray(data.foods)) {
        setEstimatedFoods(data.foods.map((f: any) => ({ ...f, selected: true })));
      } else {
        setError('Could not identify foods in this image. Try a clearer photo.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFood = (index: number) => {
    setEstimatedFoods(prev => prev.map((f, i) =>
      i === index ? { ...f, selected: !f.selected } : f
    ));
  };

  const handleConfirm = () => {
    const today = new Date().toISOString().split('T')[0];
    const selectedFoods: FoodLog[] = estimatedFoods
      .filter(f => f.selected)
      .map(f => ({
        id: generateUUID(),
        date: today,
        timestamp: Date.now(),
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        amount: f.grams,
        unit: 'g' as const,
        source: 'ai' as const
      }));

    onFoodsFound(selectedFoods);
  };

  const handleRetake = () => {
    setImagePreview(null);
    setEstimatedFoods([]);
    setError(null);
  };

  const totalSelected = estimatedFoods.filter(f => f.selected).reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    protein: acc.protein + f.protein,
    carbs: acc.carbs + f.carbs,
    fat: acc.fat + f.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header - with safe area for iPhone notch/dynamic island */}
      <div className="flex justify-between items-center px-4 pb-4 bg-black/80" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <h2 className="text-xl font-black uppercase text-white">Photo Estimate</h2>
        <button onClick={onClose} className="text-slate-400 p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex-1 p-6 overflow-auto">
        {!imagePreview ? (
          /* Photo capture options */
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center mb-8">
              <svg className="w-20 h-20 text-purple-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-xl font-black text-white mb-2">Snap Your Meal</h3>
              <p className="text-slate-500 text-sm">AI will estimate calories & macros</p>
            </div>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full max-w-xs bg-purple-600 text-white py-4 px-6 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              Take Photo
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xs bg-slate-800 text-white py-4 px-6 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choose from Gallery
            </button>

            <p className="text-[10px] text-slate-600 text-center mt-4 max-w-xs">
              Works best with clear, well-lit photos of your meal from above
            </p>
          </div>
        ) : isAnalyzing ? (
          /* Analyzing state */
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-6">
              <img
                src={imagePreview}
                alt="Meal"
                className="w-48 h-48 object-cover rounded-2xl opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Analyzing your meal...</p>
            <p className="text-slate-600 text-xs mt-2">AI is identifying foods and estimating portions</p>
          </div>
        ) : error ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-400 font-bold mb-4 text-center">{error}</p>
            <button
              onClick={handleRetake}
              className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* Results */
          <>
            {/* Image preview */}
            <div className="relative mb-6">
              <img
                src={imagePreview}
                alt="Meal"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <button
                onClick={handleRetake}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Estimated foods */}
            <div className="mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Detected Foods</h3>
              <p className="text-[10px] text-slate-600 mb-3">Tap to select/deselect items</p>

              <div className="space-y-2">
                {estimatedFoods.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleFood(idx)}
                    className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all ${
                      food.selected
                        ? 'bg-purple-900/30 border border-purple-500/50'
                        : 'bg-slate-900/50 border border-white/5 opacity-50'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-white">{food.name}</p>
                      <p className="text-[10px] text-slate-500">~{food.grams}g estimated</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-400">{food.calories} cal</p>
                      <p className="text-[10px] text-blue-400">{food.protein}g protein</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            {estimatedFoods.some(f => f.selected) && (
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 mb-6">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Selected Totals</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xl font-black text-orange-400">{totalSelected.calories}</p>
                    <p className="text-[8px] text-slate-500 uppercase">cal</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-blue-400">{Math.round(totalSelected.protein)}g</p>
                    <p className="text-[8px] text-slate-500 uppercase">protein</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-green-400">{Math.round(totalSelected.carbs)}g</p>
                    <p className="text-[8px] text-slate-500 uppercase">carbs</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-yellow-400">{Math.round(totalSelected.fat)}g</p>
                    <p className="text-[8px] text-slate-500 uppercase">fat</p>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-700 text-center mb-6 italic">
              AI estimates are approximate. Actual values may vary by ±20%
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-wider active:scale-95 transition-transform"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                disabled={!estimatedFoods.some(f => f.selected)}
                className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-transform"
              >
                Add Selected
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
