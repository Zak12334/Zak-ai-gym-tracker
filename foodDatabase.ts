// Common foods database - calories and protein per 100g
// Used for quick add when users know the quantity

export interface FoodItem {
  name: string;
  aliases: string[];  // Alternative names/spellings
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultPortionG: number;  // Typical portion size
  portionName: string;  // e.g., "1 breast", "1 egg", "1 cup cooked"
}

export const FOOD_DATABASE: FoodItem[] = [
  // Proteins
  {
    name: "Chicken Breast",
    aliases: ["chicken", "grilled chicken", "chicken fillet"],
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    defaultPortionG: 150,
    portionName: "1 breast"
  },
  {
    name: "Chicken Thigh",
    aliases: ["chicken thighs", "thigh"],
    caloriesPer100g: 209,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatPer100g: 11,
    defaultPortionG: 120,
    portionName: "1 thigh"
  },
  {
    name: "Eggs",
    aliases: ["egg", "boiled egg", "fried egg", "scrambled eggs"],
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatPer100g: 11,
    defaultPortionG: 50,
    portionName: "1 egg"
  },
  {
    name: "Beef Mince",
    aliases: ["ground beef", "minced beef", "mince"],
    caloriesPer100g: 250,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatPer100g: 15,
    defaultPortionG: 150,
    portionName: "1 serving"
  },
  {
    name: "Beef Steak",
    aliases: ["steak", "sirloin", "ribeye"],
    caloriesPer100g: 271,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatPer100g: 18,
    defaultPortionG: 200,
    portionName: "1 steak"
  },
  {
    name: "Salmon",
    aliases: ["salmon fillet", "grilled salmon"],
    caloriesPer100g: 208,
    proteinPer100g: 20,
    carbsPer100g: 0,
    fatPer100g: 13,
    defaultPortionG: 150,
    portionName: "1 fillet"
  },
  {
    name: "Tuna (canned)",
    aliases: ["tuna", "canned tuna", "tuna chunks"],
    caloriesPer100g: 116,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatPer100g: 1,
    defaultPortionG: 100,
    portionName: "1 can drained"
  },
  {
    name: "Prawns",
    aliases: ["shrimp", "king prawns"],
    caloriesPer100g: 99,
    proteinPer100g: 24,
    carbsPer100g: 0.2,
    fatPer100g: 0.3,
    defaultPortionG: 100,
    portionName: "1 serving"
  },
  {
    name: "Turkey Breast",
    aliases: ["turkey", "turkey slices"],
    caloriesPer100g: 135,
    proteinPer100g: 30,
    carbsPer100g: 0,
    fatPer100g: 1,
    defaultPortionG: 150,
    portionName: "1 breast"
  },
  {
    name: "Lamb",
    aliases: ["lamb chop", "lamb leg"],
    caloriesPer100g: 294,
    proteinPer100g: 25,
    carbsPer100g: 0,
    fatPer100g: 21,
    defaultPortionG: 150,
    portionName: "1 serving"
  },

  // Carbs
  {
    name: "White Rice (cooked)",
    aliases: ["rice", "white rice", "basmati", "jasmine rice"],
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28,
    fatPer100g: 0.3,
    defaultPortionG: 200,
    portionName: "1 cup cooked"
  },
  {
    name: "Brown Rice (cooked)",
    aliases: ["brown rice", "wholegrain rice"],
    caloriesPer100g: 112,
    proteinPer100g: 2.6,
    carbsPer100g: 24,
    fatPer100g: 0.9,
    defaultPortionG: 200,
    portionName: "1 cup cooked"
  },
  {
    name: "Pasta (cooked)",
    aliases: ["pasta", "spaghetti", "penne", "fusilli"],
    caloriesPer100g: 131,
    proteinPer100g: 5,
    carbsPer100g: 25,
    fatPer100g: 1.1,
    defaultPortionG: 200,
    portionName: "1 cup cooked"
  },
  {
    name: "Bread (white)",
    aliases: ["bread", "white bread", "toast"],
    caloriesPer100g: 265,
    proteinPer100g: 9,
    carbsPer100g: 49,
    fatPer100g: 3.2,
    defaultPortionG: 30,
    portionName: "1 slice"
  },
  {
    name: "Bread (wholemeal)",
    aliases: ["wholemeal bread", "brown bread", "whole wheat bread"],
    caloriesPer100g: 247,
    proteinPer100g: 13,
    carbsPer100g: 41,
    fatPer100g: 3.4,
    defaultPortionG: 30,
    portionName: "1 slice"
  },
  {
    name: "Oats",
    aliases: ["oatmeal", "porridge", "rolled oats"],
    caloriesPer100g: 389,
    proteinPer100g: 17,
    carbsPer100g: 66,
    fatPer100g: 7,
    defaultPortionG: 40,
    portionName: "1 serving dry"
  },
  {
    name: "Potato",
    aliases: ["potatoes", "baked potato", "boiled potato"],
    caloriesPer100g: 77,
    proteinPer100g: 2,
    carbsPer100g: 17,
    fatPer100g: 0.1,
    defaultPortionG: 200,
    portionName: "1 medium"
  },
  {
    name: "Sweet Potato",
    aliases: ["sweet potatoes"],
    caloriesPer100g: 86,
    proteinPer100g: 1.6,
    carbsPer100g: 20,
    fatPer100g: 0.1,
    defaultPortionG: 200,
    portionName: "1 medium"
  },

  // Dairy
  {
    name: "Milk (whole)",
    aliases: ["milk", "whole milk", "full fat milk"],
    caloriesPer100g: 61,
    proteinPer100g: 3.2,
    carbsPer100g: 4.8,
    fatPer100g: 3.3,
    defaultPortionG: 250,
    portionName: "1 glass"
  },
  {
    name: "Milk (semi-skimmed)",
    aliases: ["semi skimmed milk", "2% milk"],
    caloriesPer100g: 50,
    proteinPer100g: 3.4,
    carbsPer100g: 4.8,
    fatPer100g: 1.8,
    defaultPortionG: 250,
    portionName: "1 glass"
  },
  {
    name: "Greek Yogurt",
    aliases: ["greek yoghurt", "yogurt", "yoghurt"],
    caloriesPer100g: 97,
    proteinPer100g: 9,
    carbsPer100g: 3.6,
    fatPer100g: 5,
    defaultPortionG: 150,
    portionName: "1 pot"
  },
  {
    name: "Cheese (cheddar)",
    aliases: ["cheese", "cheddar"],
    caloriesPer100g: 402,
    proteinPer100g: 25,
    carbsPer100g: 1.3,
    fatPer100g: 33,
    defaultPortionG: 30,
    portionName: "1 slice"
  },
  {
    name: "Cottage Cheese",
    aliases: [],
    caloriesPer100g: 98,
    proteinPer100g: 11,
    carbsPer100g: 3.4,
    fatPer100g: 4.3,
    defaultPortionG: 100,
    portionName: "1 serving"
  },

  // Fruits
  {
    name: "Banana",
    aliases: ["bananas"],
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23,
    fatPer100g: 0.3,
    defaultPortionG: 120,
    portionName: "1 medium"
  },
  {
    name: "Apple",
    aliases: ["apples"],
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 14,
    fatPer100g: 0.2,
    defaultPortionG: 180,
    portionName: "1 medium"
  },
  {
    name: "Orange",
    aliases: ["oranges"],
    caloriesPer100g: 47,
    proteinPer100g: 0.9,
    carbsPer100g: 12,
    fatPer100g: 0.1,
    defaultPortionG: 150,
    portionName: "1 medium"
  },
  {
    name: "Strawberries",
    aliases: ["strawberry"],
    caloriesPer100g: 32,
    proteinPer100g: 0.7,
    carbsPer100g: 8,
    fatPer100g: 0.3,
    defaultPortionG: 150,
    portionName: "1 cup"
  },
  {
    name: "Blueberries",
    aliases: ["blueberry"],
    caloriesPer100g: 57,
    proteinPer100g: 0.7,
    carbsPer100g: 14,
    fatPer100g: 0.3,
    defaultPortionG: 150,
    portionName: "1 cup"
  },

  // Vegetables
  {
    name: "Broccoli",
    aliases: [],
    caloriesPer100g: 34,
    proteinPer100g: 2.8,
    carbsPer100g: 7,
    fatPer100g: 0.4,
    defaultPortionG: 100,
    portionName: "1 cup"
  },
  {
    name: "Spinach",
    aliases: [],
    caloriesPer100g: 23,
    proteinPer100g: 2.9,
    carbsPer100g: 3.6,
    fatPer100g: 0.4,
    defaultPortionG: 30,
    portionName: "1 cup raw"
  },
  {
    name: "Carrots",
    aliases: ["carrot"],
    caloriesPer100g: 41,
    proteinPer100g: 0.9,
    carbsPer100g: 10,
    fatPer100g: 0.2,
    defaultPortionG: 80,
    portionName: "1 medium"
  },
  {
    name: "Avocado",
    aliases: ["avocados"],
    caloriesPer100g: 160,
    proteinPer100g: 2,
    carbsPer100g: 9,
    fatPer100g: 15,
    defaultPortionG: 150,
    portionName: "1 whole"
  },

  // Nuts & Seeds
  {
    name: "Almonds",
    aliases: ["almond"],
    caloriesPer100g: 579,
    proteinPer100g: 21,
    carbsPer100g: 22,
    fatPer100g: 50,
    defaultPortionG: 30,
    portionName: "1 handful"
  },
  {
    name: "Peanuts",
    aliases: ["peanut"],
    caloriesPer100g: 567,
    proteinPer100g: 26,
    carbsPer100g: 16,
    fatPer100g: 49,
    defaultPortionG: 30,
    portionName: "1 handful"
  },
  {
    name: "Peanut Butter",
    aliases: ["pb"],
    caloriesPer100g: 588,
    proteinPer100g: 25,
    carbsPer100g: 20,
    fatPer100g: 50,
    defaultPortionG: 32,
    portionName: "2 tbsp"
  },

  // Supplements
  {
    name: "Whey Protein",
    aliases: ["protein shake", "protein powder", "whey"],
    caloriesPer100g: 400,
    proteinPer100g: 80,
    carbsPer100g: 10,
    fatPer100g: 5,
    defaultPortionG: 30,
    portionName: "1 scoop"
  },
  {
    name: "Creatine",
    aliases: [],
    caloriesPer100g: 0,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
    defaultPortionG: 5,
    portionName: "1 scoop"
  }
];

// Helper function to search foods
export const searchFood = (query: string): FoodItem[] => {
  const q = query.toLowerCase().trim();
  return FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(q) ||
    food.aliases.some(alias => alias.toLowerCase().includes(q))
  );
};

// Helper to calculate nutrition for a given weight
export const calculateNutrition = (food: FoodItem, grams: number) => {
  const multiplier = grams / 100;
  return {
    calories: Math.round(food.caloriesPer100g * multiplier),
    protein: Math.round(food.proteinPer100g * multiplier * 10) / 10,
    carbs: Math.round(food.carbsPer100g * multiplier * 10) / 10,
    fat: Math.round(food.fatPer100g * multiplier * 10) / 10
  };
};

// Parse natural language input like "250g chicken" or "2 eggs"
export const parseNaturalInput = (input: string): { food: FoodItem | null; grams: number; quantity: number } | null => {
  const text = input.toLowerCase().trim();

  // Pattern: "250g chicken" or "250 g chicken" or "250 grams chicken"
  const gramsMatch = text.match(/(\d+)\s*(?:g|grams?)\s+(.+)/i);
  if (gramsMatch) {
    const grams = parseInt(gramsMatch[1]);
    const foodQuery = gramsMatch[2];
    const foods = searchFood(foodQuery);
    if (foods.length > 0) {
      return { food: foods[0], grams, quantity: 1 };
    }
  }

  // Pattern: "2 eggs" or "3 bananas"
  const quantityMatch = text.match(/(\d+)\s+(.+)/i);
  if (quantityMatch) {
    const quantity = parseInt(quantityMatch[1]);
    const foodQuery = quantityMatch[2];
    const foods = searchFood(foodQuery);
    if (foods.length > 0) {
      const food = foods[0];
      return { food, grams: food.defaultPortionG * quantity, quantity };
    }
  }

  // Just food name - use default portion
  const foods = searchFood(text);
  if (foods.length > 0) {
    const food = foods[0];
    return { food, grams: food.defaultPortionG, quantity: 1 };
  }

  return null;
};
