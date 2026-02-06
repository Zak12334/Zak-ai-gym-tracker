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
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
  };
  serving_size?: string;
  quantity?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onFoodFound, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [grams, setGrams] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      if (!containerRef.current) return;

      scannerRef.current = new Html5Qrcode("barcode-reader");
      setIsScanning(true);
      setError(null);

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0
        },
        onScanSuccess,
        () => {} // Ignore scan errors
      );
    } catch (err: any) {
      setError("Camera access denied. Please allow camera permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Ignore stop errors
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (barcode: string) => {
    await stopScanner();
    setIsLoading(true);
    setError(null);

    try {
      // Fetch from Open Food Facts API
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        setProduct(data.product);
        // Try to parse serving size for default grams
        if (data.product.serving_size) {
          const match = data.product.serving_size.match(/(\d+)\s*g/i);
          if (match) {
            setGrams(parseInt(match[1]));
          }
        }
      } else {
        setError("Product not found in database. Try Quick Add instead.");
      }
    } catch (err) {
      setError("Failed to fetch product info. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!product || !product.nutriments) return;

    const multiplier = grams / 100;
    const today = new Date().toISOString().split('T')[0];

    const foodLog: FoodLog = {
      id: generateUUID(),
      date: today,
      timestamp: Date.now(),
      name: product.product_name || 'Unknown Product',
      calories: Math.round((product.nutriments['energy-kcal_100g'] || 0) * multiplier),
      protein: Math.round((product.nutriments['proteins_100g'] || 0) * multiplier * 10) / 10,
      carbs: Math.round((product.nutriments['carbohydrates_100g'] || 0) * multiplier * 10) / 10,
      fat: Math.round((product.nutriments['fat_100g'] || 0) * multiplier * 10) / 10,
      grams: grams,
      source: 'barcode'
    };

    onFoodFound(foodLog);
  };

  const handleRescan = async () => {
    setProduct(null);
    setError(null);
    await startScanner();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/80">
        <h2 className="text-xl font-black uppercase text-white">Scan Barcode</h2>
        <button onClick={onClose} className="text-slate-400 p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scanner or Product Display */}
      {!product ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Looking up product...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 font-bold mb-4">{error}</p>
              <button
                onClick={handleRescan}
                className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div
                id="barcode-reader"
                ref={containerRef}
                className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-slate-900"
              />
              <p className="text-slate-500 text-sm mt-4 text-center">
                Point camera at barcode
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-auto">
          {/* Product Info */}
          <div className="bg-slate-900 rounded-3xl p-6 mb-6">
            <h3 className="text-2xl font-black text-white mb-2">{product.product_name || 'Unknown Product'}</h3>
            {product.quantity && (
              <p className="text-slate-500 text-sm mb-4">{product.quantity}</p>
            )}

            {/* Per 100g info */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Per 100g</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-black text-orange-400">{product.nutriments?.['energy-kcal_100g'] || 0}</p>
                  <p className="text-[8px] text-slate-500 uppercase">cal</p>
                </div>
                <div>
                  <p className="text-lg font-black text-blue-400">{product.nutriments?.['proteins_100g'] || 0}g</p>
                  <p className="text-[8px] text-slate-500 uppercase">protein</p>
                </div>
                <div>
                  <p className="text-lg font-black text-green-400">{product.nutriments?.['carbohydrates_100g'] || 0}g</p>
                  <p className="text-[8px] text-slate-500 uppercase">carbs</p>
                </div>
                <div>
                  <p className="text-lg font-black text-yellow-400">{product.nutriments?.['fat_100g'] || 0}g</p>
                  <p className="text-[8px] text-slate-500 uppercase">fat</p>
                </div>
              </div>
            </div>

            {/* Amount selector */}
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

            {/* Quick portions */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setGrams(100)} className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400">100g</button>
              <button onClick={() => setGrams(150)} className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400">150g</button>
              <button onClick={() => setGrams(200)} className="flex-1 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-400">200g</button>
            </div>

            {/* Calculated totals */}
            {grams > 0 && product.nutriments && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-2">Your portion ({grams}g)</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xl font-black text-orange-400">
                      {Math.round((product.nutriments['energy-kcal_100g'] || 0) * grams / 100)}
                    </p>
                    <p className="text-[8px] text-slate-500 uppercase">cal</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-blue-400">
                      {Math.round((product.nutriments['proteins_100g'] || 0) * grams / 100 * 10) / 10}g
                    </p>
                    <p className="text-[8px] text-slate-500 uppercase">protein</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-green-400">
                      {Math.round((product.nutriments['carbohydrates_100g'] || 0) * grams / 100 * 10) / 10}g
                    </p>
                    <p className="text-[8px] text-slate-500 uppercase">carbs</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-yellow-400">
                      {Math.round((product.nutriments['fat_100g'] || 0) * grams / 100 * 10) / 10}g
                    </p>
                    <p className="text-[8px] text-slate-500 uppercase">fat</p>
                  </div>
                </div>
              </div>
            )}
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
  );
};
