import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FoodLog } from '../types';
import { generateUUID } from '../utils';

interface BarcodeScannerProps {
  onFoodFound: (food: FoodLog) => void;
  onClose: () => void;
}

interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  nutriments?: Record<string, number>;
  serving_size?: string;
  quantity?: string;
  image_front_url?: string;
  image_url?: string;
}

// Helper to extract nutrition value from various possible keys
const getNutrient = (nutriments: Record<string, number> | undefined, ...keys: string[]): number => {
  if (!nutriments) return 0;
  for (const key of keys) {
    if (nutriments[key] !== undefined && nutriments[key] !== null) {
      return nutriments[key];
    }
  }
  return 0;
};

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onFoodFound, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [rawNutrients, setRawNutrients] = useState<{ cal: number; protein: number; carbs: number; fat: number }>({ cal: 0, protein: 0, carbs: 0, fat: 0 });
  const [grams, setGrams] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      scannerRef.current = new Html5Qrcode("barcode-reader");
      setIsScanning(true);
      setError(null);

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
        },
        onScanSuccess,
        () => {}
      );
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError("Camera access denied. Please allow camera permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Ignore
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (barcode: string) => {
    await stopScanner();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      console.log("Open Food Facts response:", data); // Debug

      if (data.status === 1 && data.product) {
        const p = data.product;
        setProduct(p);

        // Extract nutrients - try multiple possible property names
        const cal = getNutrient(p.nutriments,
          'energy-kcal_100g',
          'energy-kcal',
          'energy_100g',
          'energy'
        );
        // If energy is in kJ, convert to kcal
        let calories = cal;
        if (cal > 1000) {
          // Likely in kJ, convert
          calories = Math.round(cal / 4.184);
        }

        const protein = getNutrient(p.nutriments,
          'proteins_100g',
          'proteins',
          'protein_100g',
          'protein'
        );
        const carbs = getNutrient(p.nutriments,
          'carbohydrates_100g',
          'carbohydrates',
          'carbs_100g',
          'carbs'
        );
        const fat = getNutrient(p.nutriments,
          'fat_100g',
          'fat',
          'fats_100g',
          'fats'
        );

        setRawNutrients({ cal: calories, protein, carbs, fat });

        // Try to get serving size
        if (p.serving_size) {
          const match = p.serving_size.match(/(\d+)\s*g/i);
          if (match) {
            setGrams(parseInt(match[1]));
          }
        }
      } else {
        setError("Product not found. Try Quick Add instead.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to look up product. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!product) return;

    const multiplier = grams / 100;
    const today = new Date().toISOString().split('T')[0];

    const foodLog: FoodLog = {
      id: generateUUID(),
      date: today,
      timestamp: Date.now(),
      name: product.product_name || 'Unknown Product',
      calories: Math.round(rawNutrients.cal * multiplier),
      protein: Math.round(rawNutrients.protein * multiplier * 10) / 10,
      carbs: Math.round(rawNutrients.carbs * multiplier * 10) / 10,
      fat: Math.round(rawNutrients.fat * multiplier * 10) / 10,
      grams: grams,
      source: 'barcode'
    };

    onFoodFound(foodLog);
  };

  const handleRescan = async () => {
    setProduct(null);
    setRawNutrients({ cal: 0, protein: 0, carbs: 0, fat: 0 });
    setError(null);
    setGrams(100);
    await startScanner();
  };

  const calculated = {
    cal: Math.round(rawNutrients.cal * grams / 100),
    protein: Math.round(rawNutrients.protein * grams / 100 * 10) / 10,
    carbs: Math.round(rawNutrients.carbs * grams / 100 * 10) / 10,
    fat: Math.round(rawNutrients.fat * grams / 100 * 10) / 10,
  };

  return (
    <div className="fixed inset-0 bg-black z-[70] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black border-b border-white/10">
        <h2 className="text-xl font-black uppercase text-white">Scan Barcode</h2>
        <button onClick={onClose} className="text-white bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!product ? (
          <div className="flex flex-col items-center justify-center min-h-full p-6">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Looking up product...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-400 font-bold mb-6">{error}</p>
                <button
                  onClick={handleRescan}
                  className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div
                  id="barcode-reader"
                  className="w-full"
                  style={{ minHeight: '300px' }}
                />
                <p className="text-slate-500 text-sm mt-6 text-center">
                  Point camera at product barcode
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 pb-32">
            {/* Product Name */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-white mb-1">
                {product.product_name || 'Unknown Product'}
              </h3>
              {product.brands && (
                <p className="text-slate-500 text-sm">{product.brands}</p>
              )}
              {product.quantity && (
                <p className="text-slate-600 text-xs mt-1">{product.quantity}</p>
              )}
            </div>

            {/* Per 100g */}
            <div className="bg-slate-900 rounded-2xl p-4 mb-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Per 100g</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xl font-black text-orange-400">{rawNutrients.cal}</p>
                  <p className="text-[10px] text-slate-500 uppercase">cal</p>
                </div>
                <div>
                  <p className="text-xl font-black text-blue-400">{rawNutrients.protein}g</p>
                  <p className="text-[10px] text-slate-500 uppercase">protein</p>
                </div>
                <div>
                  <p className="text-xl font-black text-green-400">{rawNutrients.carbs}g</p>
                  <p className="text-[10px] text-slate-500 uppercase">carbs</p>
                </div>
                <div>
                  <p className="text-xl font-black text-yellow-400">{rawNutrients.fat}g</p>
                  <p className="text-[10px] text-slate-500 uppercase">fat</p>
                </div>
              </div>
            </div>

            {/* No nutrition data warning */}
            {rawNutrients.cal === 0 && rawNutrients.protein === 0 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <p className="text-yellow-400 text-sm font-bold">No nutrition data available for this product in the database.</p>
                <p className="text-yellow-600 text-xs mt-1">Try Quick Add to enter manually.</p>
              </div>
            )}

            {/* Amount selector */}
            <div className="mb-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Your Portion (grams)</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGrams(g => Math.max(10, g - 25))}
                  className="bg-slate-800 w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl active:bg-slate-700"
                >
                  -
                </button>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-4 text-center text-3xl font-black text-white focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={() => setGrams(g => g + 25)}
                  className="bg-slate-800 w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl active:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick portions */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <button onClick={() => setGrams(50)} className="bg-slate-800 py-3 rounded-xl text-sm font-bold text-slate-400 active:bg-slate-700">50g</button>
              <button onClick={() => setGrams(100)} className="bg-slate-800 py-3 rounded-xl text-sm font-bold text-slate-400 active:bg-slate-700">100g</button>
              <button onClick={() => setGrams(150)} className="bg-slate-800 py-3 rounded-xl text-sm font-bold text-slate-400 active:bg-slate-700">150g</button>
              <button onClick={() => setGrams(200)} className="bg-slate-800 py-3 rounded-xl text-sm font-bold text-slate-400 active:bg-slate-700">200g</button>
            </div>

            {/* Calculated totals */}
            <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-4 mb-6">
              <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-3">Your Portion ({grams}g)</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-2xl font-black text-orange-400">{calculated.cal}</p>
                  <p className="text-[10px] text-slate-500 uppercase">cal</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-blue-400">{calculated.protein}g</p>
                  <p className="text-[10px] text-slate-500 uppercase">protein</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-green-400">{calculated.carbs}g</p>
                  <p className="text-[10px] text-slate-500 uppercase">carbs</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-yellow-400">{calculated.fat}g</p>
                  <p className="text-[10px] text-slate-500 uppercase">fat</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRescan}
                className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-wider active:scale-95 transition-transform"
              >
                Scan Another
              </button>
              <button
                onClick={handleConfirm}
                disabled={grams <= 0}
                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-transform"
              >
                Add Food
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
