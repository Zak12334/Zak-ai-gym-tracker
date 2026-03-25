// Food Search API - searches real food databases for accurate nutrition data
// Uses USDA FoodData Central (if API key available) + Open Food Facts (free, no key)

interface FoodSearchResult {
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

interface USDAFood {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
}

interface OpenFoodFactsProduct {
  _id: string;
  product_name?: string;
  brands?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
  };
  serving_size?: string;
}

// USDA nutrient IDs
const NUTRIENT_IDS = {
  ENERGY: 1008,      // Energy (kcal)
  PROTEIN: 1003,     // Protein
  FAT: 1004,         // Total lipid (fat)
  CARBS: 1005,       // Carbohydrate, by difference
};

async function searchUSDA(query: string, apiKey: string): Promise<FoodSearchResult[]> {
  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=15&dataType=Foundation,SR Legacy,Branded`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      console.error('USDA API error:', response.status);
      return [];
    }

    const data = await response.json();
    const foods: USDAFood[] = data.foods || [];

    return foods.map((food): FoodSearchResult => {
      const getNutrient = (id: number): number => {
        const nutrient = food.foodNutrients.find(n => n.nutrientId === id);
        return nutrient?.value || 0;
      };

      const brandPart = food.brandName || food.brandOwner;
      const name = brandPart
        ? `${food.description} (${brandPart})`
        : food.description;

      return {
        id: `usda_${food.fdcId}`,
        name: name,
        brand: brandPart,
        caloriesPer100g: Math.round(getNutrient(NUTRIENT_IDS.ENERGY)),
        proteinPer100g: Math.round(getNutrient(NUTRIENT_IDS.PROTEIN) * 10) / 10,
        carbsPer100g: Math.round(getNutrient(NUTRIENT_IDS.CARBS) * 10) / 10,
        fatPer100g: Math.round(getNutrient(NUTRIENT_IDS.FAT) * 10) / 10,
        servingSize: food.servingSize,
        servingUnit: food.servingSizeUnit,
        source: 'usda'
      };
    }).filter(f => f.caloriesPer100g > 0 || f.proteinPer100g > 0);
  } catch (error) {
    console.error('USDA search error:', error);
    return [];
  }
}

async function searchOpenFoodFacts(query: string): Promise<FoodSearchResult[]> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&fields=_id,product_name,brands,nutriments,serving_size`,
      { headers: { 'User-Agent': 'IronMind-GymTracker/1.0' } }
    );

    if (!response.ok) {
      console.error('Open Food Facts API error:', response.status);
      return [];
    }

    const data = await response.json();
    const products: OpenFoodFactsProduct[] = data.products || [];

    return products
      .filter(p => p.product_name && p.nutriments)
      .map((product): FoodSearchResult => {
        const nutriments = product.nutriments!;

        // Handle energy - prefer kcal, convert from kJ if needed
        let calories = nutriments['energy-kcal_100g'] || 0;
        if (!calories && nutriments['energy_100g']) {
          // Convert kJ to kcal (1 kcal = 4.184 kJ)
          calories = Math.round(nutriments['energy_100g'] / 4.184);
        }

        const name = product.brands
          ? `${product.product_name} (${product.brands})`
          : product.product_name!;

        // Parse serving size if available
        let servingSize: number | undefined;
        let servingUnit: string | undefined;
        if (product.serving_size) {
          const match = product.serving_size.match(/(\d+(?:\.\d+)?)\s*(g|ml|oz)?/i);
          if (match) {
            servingSize = parseFloat(match[1]);
            servingUnit = match[2] || 'g';
          }
        }

        return {
          id: `off_${product._id}`,
          name: name,
          brand: product.brands,
          caloriesPer100g: Math.round(calories),
          proteinPer100g: Math.round((nutriments['proteins_100g'] || 0) * 10) / 10,
          carbsPer100g: Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10,
          fatPer100g: Math.round((nutriments['fat_100g'] || 0) * 10) / 10,
          servingSize,
          servingUnit,
          source: 'openfoodfacts'
        };
      })
      .filter(f => f.caloriesPer100g > 0 || f.proteinPer100g > 0);
  } catch (error) {
    console.error('Open Food Facts search error:', error);
    return [];
  }
}

export default async function handler(req: any, res: any) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  const searchQuery = query.trim();
  const usdaApiKey = process.env.USDA_API_KEY;

  try {
    // Search both APIs in parallel for best results
    const searchPromises: Promise<FoodSearchResult[]>[] = [
      searchOpenFoodFacts(searchQuery)
    ];

    // Add USDA search if API key is available
    if (usdaApiKey) {
      searchPromises.unshift(searchUSDA(searchQuery, usdaApiKey));
    }

    const results = await Promise.all(searchPromises);

    // Combine results - USDA first (more accurate for raw foods), then Open Food Facts
    let combinedResults: FoodSearchResult[] = [];

    if (usdaApiKey) {
      // USDA results first
      combinedResults = [...results[0], ...results[1]];
    } else {
      combinedResults = results[0];
    }

    // Remove duplicates by similar name (case insensitive)
    const seen = new Set<string>();
    const uniqueResults = combinedResults.filter(food => {
      const key = food.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Limit to top 20 results
    const finalResults = uniqueResults.slice(0, 20);

    return res.status(200).json({
      foods: finalResults,
      sources: usdaApiKey ? ['usda', 'openfoodfacts'] : ['openfoodfacts'],
      total: finalResults.length
    });
  } catch (error: any) {
    console.error('Food search error:', error);
    return res.status(500).json({ error: 'Failed to search foods. Please try again.' });
  }
}
