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
  },

  // More Proteins
  {
    name: "Cod",
    aliases: ["cod fillet", "white fish"],
    caloriesPer100g: 82,
    proteinPer100g: 18,
    carbsPer100g: 0,
    fatPer100g: 0.7,
    defaultPortionG: 150,
    portionName: "1 fillet"
  },
  {
    name: "Sardines (canned)",
    aliases: ["sardines", "pilchards"],
    caloriesPer100g: 208,
    proteinPer100g: 25,
    carbsPer100g: 0,
    fatPer100g: 11,
    defaultPortionG: 90,
    portionName: "1 can"
  },
  {
    name: "Mackerel",
    aliases: ["smoked mackerel"],
    caloriesPer100g: 305,
    proteinPer100g: 19,
    carbsPer100g: 0,
    fatPer100g: 25,
    defaultPortionG: 120,
    portionName: "1 fillet"
  },
  {
    name: "Pork Loin",
    aliases: ["pork", "pork chop", "pork fillet"],
    caloriesPer100g: 215,
    proteinPer100g: 27,
    carbsPer100g: 0,
    fatPer100g: 11,
    defaultPortionG: 150,
    portionName: "1 chop"
  },
  {
    name: "Bacon",
    aliases: ["bacon rashers", "back bacon", "streaky bacon"],
    caloriesPer100g: 541,
    proteinPer100g: 37,
    carbsPer100g: 0,
    fatPer100g: 42,
    defaultPortionG: 30,
    portionName: "2 rashers"
  },
  {
    name: "Ham",
    aliases: ["cooked ham", "deli ham"],
    caloriesPer100g: 107,
    proteinPer100g: 17,
    carbsPer100g: 1.5,
    fatPer100g: 3.5,
    defaultPortionG: 50,
    portionName: "2 slices"
  },
  {
    name: "Tofu",
    aliases: ["firm tofu", "silken tofu"],
    caloriesPer100g: 76,
    proteinPer100g: 8,
    carbsPer100g: 1.9,
    fatPer100g: 4.8,
    defaultPortionG: 150,
    portionName: "1 serving"
  },
  {
    name: "Chicken Wings",
    aliases: ["wings"],
    caloriesPer100g: 203,
    proteinPer100g: 19,
    carbsPer100g: 0,
    fatPer100g: 14,
    defaultPortionG: 100,
    portionName: "3 wings"
  },
  {
    name: "Edamame",
    aliases: ["soy beans", "soybeans"],
    caloriesPer100g: 122,
    proteinPer100g: 11,
    carbsPer100g: 10,
    fatPer100g: 5,
    defaultPortionG: 100,
    portionName: "1 cup"
  },

  // More Carbs
  {
    name: "Quinoa (cooked)",
    aliases: ["quinoa"],
    caloriesPer100g: 120,
    proteinPer100g: 4.4,
    carbsPer100g: 22,
    fatPer100g: 1.9,
    defaultPortionG: 185,
    portionName: "1 cup cooked"
  },
  {
    name: "Couscous (cooked)",
    aliases: ["couscous"],
    caloriesPer100g: 112,
    proteinPer100g: 3.8,
    carbsPer100g: 23,
    fatPer100g: 0.2,
    defaultPortionG: 175,
    portionName: "1 cup cooked"
  },
  {
    name: "Pitta Bread",
    aliases: ["pita", "pitta"],
    caloriesPer100g: 265,
    proteinPer100g: 9,
    carbsPer100g: 55,
    fatPer100g: 1.2,
    defaultPortionG: 60,
    portionName: "1 pitta"
  },
  {
    name: "Tortilla Wrap",
    aliases: ["wrap", "flour tortilla"],
    caloriesPer100g: 305,
    proteinPer100g: 8,
    carbsPer100g: 52,
    fatPer100g: 7,
    defaultPortionG: 60,
    portionName: "1 wrap"
  },
  {
    name: "Naan Bread",
    aliases: ["naan"],
    caloriesPer100g: 317,
    proteinPer100g: 9,
    carbsPer100g: 50,
    fatPer100g: 9,
    defaultPortionG: 90,
    portionName: "1 naan"
  },
  {
    name: "Chickpeas (cooked)",
    aliases: ["chickpeas", "chick peas", "garbanzo beans"],
    caloriesPer100g: 164,
    proteinPer100g: 8.9,
    carbsPer100g: 27,
    fatPer100g: 2.6,
    defaultPortionG: 150,
    portionName: "1 cup cooked"
  },
  {
    name: "Lentils (cooked)",
    aliases: ["lentils", "red lentils", "green lentils"],
    caloriesPer100g: 116,
    proteinPer100g: 9,
    carbsPer100g: 20,
    fatPer100g: 0.4,
    defaultPortionG: 200,
    portionName: "1 cup cooked"
  },
  {
    name: "Kidney Beans (cooked)",
    aliases: ["kidney beans", "red beans"],
    caloriesPer100g: 127,
    proteinPer100g: 8.7,
    carbsPer100g: 23,
    fatPer100g: 0.5,
    defaultPortionG: 150,
    portionName: "1 cup cooked"
  },
  {
    name: "Corn (sweetcorn)",
    aliases: ["sweetcorn", "corn on the cob", "sweet corn"],
    caloriesPer100g: 86,
    proteinPer100g: 3.3,
    carbsPer100g: 19,
    fatPer100g: 1.4,
    defaultPortionG: 100,
    portionName: "1 cup"
  },
  {
    name: "Bagel",
    aliases: ["bagels"],
    caloriesPer100g: 250,
    proteinPer100g: 10,
    carbsPer100g: 48,
    fatPer100g: 1.5,
    defaultPortionG: 105,
    portionName: "1 bagel"
  },
  {
    name: "Granola",
    aliases: ["muesli"],
    caloriesPer100g: 471,
    proteinPer100g: 10,
    carbsPer100g: 64,
    fatPer100g: 20,
    defaultPortionG: 45,
    portionName: "1 serving"
  },

  // More Dairy
  {
    name: "Skyr",
    aliases: ["icelandic yogurt", "skyr yogurt"],
    caloriesPer100g: 65,
    proteinPer100g: 11,
    carbsPer100g: 4,
    fatPer100g: 0.2,
    defaultPortionG: 150,
    portionName: "1 pot"
  },
  {
    name: "Butter",
    aliases: [],
    caloriesPer100g: 717,
    proteinPer100g: 0.9,
    carbsPer100g: 0.1,
    fatPer100g: 81,
    defaultPortionG: 10,
    portionName: "1 tbsp"
  },
  {
    name: "Cream Cheese",
    aliases: ["philadelphia", "soft cheese"],
    caloriesPer100g: 342,
    proteinPer100g: 5.9,
    carbsPer100g: 4.1,
    fatPer100g: 34,
    defaultPortionG: 30,
    portionName: "2 tbsp"
  },
  {
    name: "Mozzarella",
    aliases: ["mozzarella cheese"],
    caloriesPer100g: 280,
    proteinPer100g: 28,
    carbsPer100g: 2.2,
    fatPer100g: 17,
    defaultPortionG: 125,
    portionName: "1 ball"
  },
  {
    name: "Feta Cheese",
    aliases: ["feta"],
    caloriesPer100g: 264,
    proteinPer100g: 14,
    carbsPer100g: 4.1,
    fatPer100g: 21,
    defaultPortionG: 50,
    portionName: "1 serving"
  },

  // More Fruits
  {
    name: "Mango",
    aliases: ["mangoes"],
    caloriesPer100g: 60,
    proteinPer100g: 0.8,
    carbsPer100g: 15,
    fatPer100g: 0.4,
    defaultPortionG: 165,
    portionName: "1 cup sliced"
  },
  {
    name: "Grapes",
    aliases: ["grape", "red grapes", "green grapes"],
    caloriesPer100g: 67,
    proteinPer100g: 0.6,
    carbsPer100g: 17,
    fatPer100g: 0.4,
    defaultPortionG: 150,
    portionName: "1 cup"
  },
  {
    name: "Pineapple",
    aliases: [],
    caloriesPer100g: 50,
    proteinPer100g: 0.5,
    carbsPer100g: 13,
    fatPer100g: 0.1,
    defaultPortionG: 165,
    portionName: "1 cup chunks"
  },
  {
    name: "Pear",
    aliases: ["pears"],
    caloriesPer100g: 57,
    proteinPer100g: 0.4,
    carbsPer100g: 15,
    fatPer100g: 0.1,
    defaultPortionG: 178,
    portionName: "1 medium"
  },
  {
    name: "Raspberries",
    aliases: ["raspberry"],
    caloriesPer100g: 52,
    proteinPer100g: 1.2,
    carbsPer100g: 12,
    fatPer100g: 0.7,
    defaultPortionG: 123,
    portionName: "1 cup"
  },
  {
    name: "Kiwi",
    aliases: ["kiwifruit", "kiwi fruit"],
    caloriesPer100g: 61,
    proteinPer100g: 1.1,
    carbsPer100g: 15,
    fatPer100g: 0.5,
    defaultPortionG: 76,
    portionName: "1 medium"
  },
  {
    name: "Watermelon",
    aliases: [],
    caloriesPer100g: 30,
    proteinPer100g: 0.6,
    carbsPer100g: 8,
    fatPer100g: 0.2,
    defaultPortionG: 280,
    portionName: "2 cups cubed"
  },
  {
    name: "Dates",
    aliases: ["medjool dates", "date"],
    caloriesPer100g: 277,
    proteinPer100g: 1.8,
    carbsPer100g: 75,
    fatPer100g: 0.2,
    defaultPortionG: 24,
    portionName: "2 dates"
  },

  // More Vegetables
  {
    name: "Tomato",
    aliases: ["tomatoes", "cherry tomatoes"],
    caloriesPer100g: 18,
    proteinPer100g: 0.9,
    carbsPer100g: 3.9,
    fatPer100g: 0.2,
    defaultPortionG: 123,
    portionName: "1 medium"
  },
  {
    name: "Cucumber",
    aliases: [],
    caloriesPer100g: 15,
    proteinPer100g: 0.7,
    carbsPer100g: 3.6,
    fatPer100g: 0.1,
    defaultPortionG: 119,
    portionName: "1 medium"
  },
  {
    name: "Bell Pepper",
    aliases: ["capsicum", "red pepper", "green pepper", "yellow pepper"],
    caloriesPer100g: 31,
    proteinPer100g: 1,
    carbsPer100g: 6,
    fatPer100g: 0.3,
    defaultPortionG: 119,
    portionName: "1 medium"
  },
  {
    name: "Mushrooms",
    aliases: ["mushroom", "button mushrooms"],
    caloriesPer100g: 22,
    proteinPer100g: 3.1,
    carbsPer100g: 3.3,
    fatPer100g: 0.3,
    defaultPortionG: 100,
    portionName: "1 cup"
  },
  {
    name: "Lettuce",
    aliases: ["romaine", "iceberg lettuce", "salad leaves"],
    caloriesPer100g: 15,
    proteinPer100g: 1.4,
    carbsPer100g: 2.9,
    fatPer100g: 0.2,
    defaultPortionG: 47,
    portionName: "1 cup shredded"
  },
  {
    name: "Onion",
    aliases: ["onions", "red onion", "white onion"],
    caloriesPer100g: 40,
    proteinPer100g: 1.1,
    carbsPer100g: 9,
    fatPer100g: 0.1,
    defaultPortionG: 110,
    portionName: "1 medium"
  },
  {
    name: "Peas",
    aliases: ["green peas", "frozen peas"],
    caloriesPer100g: 81,
    proteinPer100g: 5.4,
    carbsPer100g: 14,
    fatPer100g: 0.4,
    defaultPortionG: 80,
    portionName: "1 serving"
  },
  {
    name: "Courgette",
    aliases: ["zucchini"],
    caloriesPer100g: 17,
    proteinPer100g: 1.2,
    carbsPer100g: 3.1,
    fatPer100g: 0.3,
    defaultPortionG: 196,
    portionName: "1 medium"
  },
  {
    name: "Kale",
    aliases: [],
    caloriesPer100g: 49,
    proteinPer100g: 4.3,
    carbsPer100g: 9,
    fatPer100g: 0.9,
    defaultPortionG: 67,
    portionName: "1 cup raw"
  },
  {
    name: "Celery",
    aliases: [],
    caloriesPer100g: 16,
    proteinPer100g: 0.7,
    carbsPer100g: 3,
    fatPer100g: 0.2,
    defaultPortionG: 64,
    portionName: "2 stalks"
  },

  // More Nuts & Seeds
  {
    name: "Walnuts",
    aliases: ["walnut"],
    caloriesPer100g: 654,
    proteinPer100g: 15,
    carbsPer100g: 14,
    fatPer100g: 65,
    defaultPortionG: 30,
    portionName: "1 handful"
  },
  {
    name: "Cashews",
    aliases: ["cashew nuts", "cashew"],
    caloriesPer100g: 553,
    proteinPer100g: 18,
    carbsPer100g: 30,
    fatPer100g: 44,
    defaultPortionG: 30,
    portionName: "1 handful"
  },
  {
    name: "Pistachios",
    aliases: ["pistachio"],
    caloriesPer100g: 562,
    proteinPer100g: 20,
    carbsPer100g: 28,
    fatPer100g: 45,
    defaultPortionG: 30,
    portionName: "1 handful"
  },
  {
    name: "Chia Seeds",
    aliases: ["chia"],
    caloriesPer100g: 486,
    proteinPer100g: 17,
    carbsPer100g: 42,
    fatPer100g: 31,
    defaultPortionG: 15,
    portionName: "1 tbsp"
  },
  {
    name: "Flaxseeds",
    aliases: ["linseed", "flax seeds"],
    caloriesPer100g: 534,
    proteinPer100g: 18,
    carbsPer100g: 29,
    fatPer100g: 42,
    defaultPortionG: 15,
    portionName: "1 tbsp"
  },
  {
    name: "Sunflower Seeds",
    aliases: ["sunflower seed"],
    caloriesPer100g: 584,
    proteinPer100g: 21,
    carbsPer100g: 20,
    fatPer100g: 51,
    defaultPortionG: 30,
    portionName: "1 handful"
  },

  // Oils & Condiments
  {
    name: "Olive Oil",
    aliases: ["extra virgin olive oil", "vegetable oil"],
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    defaultPortionG: 14,
    portionName: "1 tbsp"
  },
  {
    name: "Hummus",
    aliases: [],
    caloriesPer100g: 177,
    proteinPer100g: 7.9,
    carbsPer100g: 14,
    fatPer100g: 9.6,
    defaultPortionG: 100,
    portionName: "2 tbsp"
  },

  // Common Meals
  {
    name: "Porridge with Water",
    aliases: ["oat porridge"],
    caloriesPer100g: 55,
    proteinPer100g: 2,
    carbsPer100g: 10,
    fatPer100g: 1,
    defaultPortionG: 350,
    portionName: "1 bowl"
  },
  {
    name: "Protein Bar",
    aliases: ["quest bar", "protein snack"],
    caloriesPer100g: 380,
    proteinPer100g: 33,
    carbsPer100g: 36,
    fatPer100g: 10,
    defaultPortionG: 60,
    portionName: "1 bar"
  },
  {
    name: "Rice Cakes",
    aliases: ["rice cake"],
    caloriesPer100g: 387,
    proteinPer100g: 8,
    carbsPer100g: 82,
    fatPer100g: 2.8,
    defaultPortionG: 9,
    portionName: "1 cake"
  },

  // Fast Food
  {
    name: "McDonald's Big Mac",
    aliases: ["big mac", "bigmac"],
    caloriesPer100g: 257,
    proteinPer100g: 13,
    carbsPer100g: 24,
    fatPer100g: 12,
    defaultPortionG: 214,
    portionName: "1 burger"
  },
  {
    name: "McDonald's Fries (Large)",
    aliases: ["mcdonalds fries", "mcdonald's chips", "large fries", "large chips"],
    caloriesPer100g: 323,
    proteinPer100g: 3.8,
    carbsPer100g: 44,
    fatPer100g: 14,
    defaultPortionG: 154,
    portionName: "1 large portion"
  },
  {
    name: "McDonald's Fries (Medium)",
    aliases: ["medium fries", "medium chips", "mcdonald's medium fries"],
    caloriesPer100g: 323,
    proteinPer100g: 3.8,
    carbsPer100g: 44,
    fatPer100g: 14,
    defaultPortionG: 114,
    portionName: "1 medium portion"
  },
  {
    name: "McDonald's McChicken Sandwich",
    aliases: ["mcchicken", "mc chicken"],
    caloriesPer100g: 234,
    proteinPer100g: 12,
    carbsPer100g: 26,
    fatPer100g: 9,
    defaultPortionG: 160,
    portionName: "1 sandwich"
  },
  {
    name: "McDonald's Nuggets (6 piece)",
    aliases: ["mcnuggets", "chicken nuggets mcdonalds", "6 nuggets"],
    caloriesPer100g: 260,
    proteinPer100g: 14,
    carbsPer100g: 17,
    fatPer100g: 14,
    defaultPortionG: 101,
    portionName: "6 nuggets"
  },
  {
    name: "KFC Original Chicken",
    aliases: ["kfc chicken", "kfc original", "kfc piece"],
    caloriesPer100g: 240,
    proteinPer100g: 21,
    carbsPer100g: 9,
    fatPer100g: 14,
    defaultPortionG: 130,
    portionName: "1 piece"
  },
  {
    name: "KFC Zinger Burger",
    aliases: ["zinger", "kfc zinger"],
    caloriesPer100g: 256,
    proteinPer100g: 14,
    carbsPer100g: 26,
    fatPer100g: 10,
    defaultPortionG: 185,
    portionName: "1 burger"
  },
  {
    name: "Burger King Whopper",
    aliases: ["whopper"],
    caloriesPer100g: 241,
    proteinPer100g: 12,
    carbsPer100g: 21,
    fatPer100g: 12,
    defaultPortionG: 291,
    portionName: "1 burger"
  },
  {
    name: "Domino's Pizza (Cheese & Tomato)",
    aliases: ["dominos pizza", "cheese pizza", "pizza margherita"],
    caloriesPer100g: 250,
    proteinPer100g: 10,
    carbsPer100g: 33,
    fatPer100g: 8,
    defaultPortionG: 120,
    portionName: "1 slice"
  },
  {
    name: "Domino's Pizza (Pepperoni)",
    aliases: ["pepperoni pizza", "dominos pepperoni"],
    caloriesPer100g: 280,
    proteinPer100g: 12,
    carbsPer100g: 31,
    fatPer100g: 12,
    defaultPortionG: 120,
    portionName: "1 slice"
  },
  {
    name: "Subway 6\" Chicken Teriyaki",
    aliases: ["subway chicken teriyaki", "chicken teriyaki sub"],
    caloriesPer100g: 176,
    proteinPer100g: 14,
    carbsPer100g: 22,
    fatPer100g: 3,
    defaultPortionG: 240,
    portionName: "6 inch sub"
  },
  {
    name: "Fish and Chips",
    aliases: ["fish & chips", "chippy fish and chips"],
    caloriesPer100g: 200,
    proteinPer100g: 10,
    carbsPer100g: 22,
    fatPer100g: 8,
    defaultPortionG: 400,
    portionName: "1 portion"
  },
  {
    name: "Doner Kebab",
    aliases: ["kebab", "donor kebab", "doner meat"],
    caloriesPer100g: 230,
    proteinPer100g: 18,
    carbsPer100g: 10,
    fatPer100g: 14,
    defaultPortionG: 350,
    portionName: "1 portion"
  },
  {
    name: "Shawarma",
    aliases: ["chicken shawarma", "lamb shawarma"],
    caloriesPer100g: 210,
    proteinPer100g: 16,
    carbsPer100g: 12,
    fatPer100g: 11,
    defaultPortionG: 300,
    portionName: "1 wrap"
  },

  // Snacks & Crisps
  {
    name: "Walkers Crisps",
    aliases: ["crisps", "chips", "potato chips", "walkers"],
    caloriesPer100g: 527,
    proteinPer100g: 6,
    carbsPer100g: 55,
    fatPer100g: 31,
    defaultPortionG: 25,
    portionName: "1 bag"
  },
  {
    name: "Pringles",
    aliases: ["pringles original"],
    caloriesPer100g: 536,
    proteinPer100g: 4.5,
    carbsPer100g: 54,
    fatPer100g: 34,
    defaultPortionG: 40,
    portionName: "1 serving"
  },
  {
    name: "Doritos",
    aliases: ["doritos nacho cheese", "doritos cool original"],
    caloriesPer100g: 490,
    proteinPer100g: 7,
    carbsPer100g: 61,
    fatPer100g: 23,
    defaultPortionG: 25,
    portionName: "1 bag"
  },
  {
    name: "Popcorn (salted)",
    aliases: ["popcorn", "salted popcorn"],
    caloriesPer100g: 480,
    proteinPer100g: 9,
    carbsPer100g: 57,
    fatPer100g: 24,
    defaultPortionG: 30,
    portionName: "1 cup"
  },
  {
    name: "Chocolate Digestives",
    aliases: ["chocolate biscuits", "digestive biscuits chocolate"],
    caloriesPer100g: 493,
    proteinPer100g: 6.3,
    carbsPer100g: 63,
    fatPer100g: 24,
    defaultPortionG: 14,
    portionName: "1 biscuit"
  },
  {
    name: "Digestive Biscuits",
    aliases: ["digestives", "plain digestives"],
    caloriesPer100g: 471,
    proteinPer100g: 7,
    carbsPer100g: 66,
    fatPer100g: 20,
    defaultPortionG: 14,
    portionName: "1 biscuit"
  },
  {
    name: "Hobnobs",
    aliases: ["hobnob"],
    caloriesPer100g: 467,
    proteinPer100g: 8,
    carbsPer100g: 63,
    fatPer100g: 20,
    defaultPortionG: 13,
    portionName: "1 biscuit"
  },

  // Chocolate & Sweets
  {
    name: "Milk Chocolate",
    aliases: ["chocolate bar", "cadbury chocolate", "dairy milk"],
    caloriesPer100g: 535,
    proteinPer100g: 7.7,
    carbsPer100g: 59,
    fatPer100g: 30,
    defaultPortionG: 45,
    portionName: "1 bar"
  },
  {
    name: "Dark Chocolate",
    aliases: ["dark choc", "70% chocolate", "85% chocolate"],
    caloriesPer100g: 598,
    proteinPer100g: 5,
    carbsPer100g: 46,
    fatPer100g: 43,
    defaultPortionG: 30,
    portionName: "3 squares"
  },
  {
    name: "Kitkat",
    aliases: ["kit kat"],
    caloriesPer100g: 518,
    proteinPer100g: 6.3,
    carbsPer100g: 63,
    fatPer100g: 27,
    defaultPortionG: 41.5,
    portionName: "1 bar (2 finger)"
  },
  {
    name: "Snickers",
    aliases: ["snickers bar"],
    caloriesPer100g: 488,
    proteinPer100g: 8,
    carbsPer100g: 58,
    fatPer100g: 25,
    defaultPortionG: 52.7,
    portionName: "1 bar"
  },
  {
    name: "Mars Bar",
    aliases: ["mars"],
    caloriesPer100g: 449,
    proteinPer100g: 4.2,
    carbsPer100g: 69,
    fatPer100g: 17,
    defaultPortionG: 51,
    portionName: "1 bar"
  },
  {
    name: "Haribo",
    aliases: ["gummy bears", "jelly sweets", "gummy sweets"],
    caloriesPer100g: 340,
    proteinPer100g: 6.5,
    carbsPer100g: 77,
    fatPer100g: 0.5,
    defaultPortionG: 100,
    portionName: "1 bag"
  },

  // Breakfast Cereals
  {
    name: "Weetabix",
    aliases: ["weetabix biscuits"],
    caloriesPer100g: 362,
    proteinPer100g: 12,
    carbsPer100g: 69,
    fatPer100g: 2,
    defaultPortionG: 38,
    portionName: "2 biscuits"
  },
  {
    name: "Corn Flakes",
    aliases: ["cornflakes", "kellogg's corn flakes"],
    caloriesPer100g: 378,
    proteinPer100g: 7.5,
    carbsPer100g: 84,
    fatPer100g: 0.8,
    defaultPortionG: 30,
    portionName: "1 bowl"
  },
  {
    name: "Coco Pops",
    aliases: ["cocoa pops", "chocolate cereal"],
    caloriesPer100g: 381,
    proteinPer100g: 5.5,
    carbsPer100g: 84,
    fatPer100g: 2.8,
    defaultPortionG: 30,
    portionName: "1 bowl"
  },
  {
    name: "Special K",
    aliases: ["special k cereal"],
    caloriesPer100g: 379,
    proteinPer100g: 15,
    carbsPer100g: 75,
    fatPer100g: 1.5,
    defaultPortionG: 30,
    portionName: "1 bowl"
  },
  {
    name: "Shreddies",
    aliases: [],
    caloriesPer100g: 362,
    proteinPer100g: 10,
    carbsPer100g: 73,
    fatPer100g: 2.1,
    defaultPortionG: 45,
    portionName: "1 bowl"
  },

  // Drinks
  {
    name: "Orange Juice",
    aliases: ["oj", "fresh orange juice"],
    caloriesPer100g: 45,
    proteinPer100g: 0.7,
    carbsPer100g: 10,
    fatPer100g: 0.2,
    defaultPortionG: 200,
    portionName: "1 glass"
  },
  {
    name: "Apple Juice",
    aliases: ["apple juice"],
    caloriesPer100g: 46,
    proteinPer100g: 0.1,
    carbsPer100g: 11,
    fatPer100g: 0.1,
    defaultPortionG: 200,
    portionName: "1 glass"
  },
  {
    name: "Coca-Cola",
    aliases: ["coke", "coca cola", "cola"],
    caloriesPer100g: 42,
    proteinPer100g: 0,
    carbsPer100g: 11,
    fatPer100g: 0,
    defaultPortionG: 330,
    portionName: "1 can"
  },
  {
    name: "Diet Coke",
    aliases: ["diet cola", "coke zero", "pepsi max"],
    caloriesPer100g: 1,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
    defaultPortionG: 330,
    portionName: "1 can"
  },
  {
    name: "Lucozade Sport",
    aliases: ["lucozade", "sports drink"],
    caloriesPer100g: 26,
    proteinPer100g: 0,
    carbsPer100g: 6.4,
    fatPer100g: 0,
    defaultPortionG: 500,
    portionName: "1 bottle"
  },
  {
    name: "Whole Milk (glass)",
    aliases: ["glass of milk"],
    caloriesPer100g: 61,
    proteinPer100g: 3.2,
    carbsPer100g: 4.8,
    fatPer100g: 3.3,
    defaultPortionG: 200,
    portionName: "1 glass"
  },
  {
    name: "Coffee (black)",
    aliases: ["black coffee", "espresso", "americano"],
    caloriesPer100g: 2,
    proteinPer100g: 0.3,
    carbsPer100g: 0,
    fatPer100g: 0,
    defaultPortionG: 240,
    portionName: "1 mug"
  },
  {
    name: "Coffee with Milk",
    aliases: ["flat white", "cappuccino", "latte", "white coffee"],
    caloriesPer100g: 40,
    proteinPer100g: 2,
    carbsPer100g: 3.5,
    fatPer100g: 1.8,
    defaultPortionG: 240,
    portionName: "1 mug"
  },
  {
    name: "Tea with Milk",
    aliases: ["tea", "builder's tea", "cup of tea"],
    caloriesPer100g: 16,
    proteinPer100g: 0.9,
    carbsPer100g: 1.8,
    fatPer100g: 0.6,
    defaultPortionG: 240,
    portionName: "1 mug"
  },
  {
    name: "Smoothie (fruit)",
    aliases: ["fruit smoothie"],
    caloriesPer100g: 60,
    proteinPer100g: 0.7,
    carbsPer100g: 14,
    fatPer100g: 0.3,
    defaultPortionG: 250,
    portionName: "1 bottle"
  },

  // Sauces & Condiments
  {
    name: "Ketchup",
    aliases: ["tomato ketchup", "heinz ketchup", "tomato sauce"],
    caloriesPer100g: 101,
    proteinPer100g: 1.5,
    carbsPer100g: 24,
    fatPer100g: 0.1,
    defaultPortionG: 15,
    portionName: "1 tbsp"
  },
  {
    name: "Mayonnaise",
    aliases: ["mayo", "hellmann's", "full fat mayo"],
    caloriesPer100g: 680,
    proteinPer100g: 1,
    carbsPer100g: 1.3,
    fatPer100g: 75,
    defaultPortionG: 15,
    portionName: "1 tbsp"
  },
  {
    name: "BBQ Sauce",
    aliases: ["bbq sauce", "barbecue sauce"],
    caloriesPer100g: 170,
    proteinPer100g: 1.1,
    carbsPer100g: 40,
    fatPer100g: 0.4,
    defaultPortionG: 30,
    portionName: "2 tbsp"
  },
  {
    name: "Hot Sauce",
    aliases: ["sriracha", "tabasco", "chilli sauce"],
    caloriesPer100g: 35,
    proteinPer100g: 0.5,
    carbsPer100g: 8,
    fatPer100g: 0,
    defaultPortionG: 10,
    portionName: "1 tsp"
  },
  {
    name: "Soy Sauce",
    aliases: ["soya sauce"],
    caloriesPer100g: 53,
    proteinPer100g: 5.5,
    carbsPer100g: 5.6,
    fatPer100g: 0.1,
    defaultPortionG: 15,
    portionName: "1 tbsp"
  },
  {
    name: "Sweet Chilli Sauce",
    aliases: ["sweet chili sauce"],
    caloriesPer100g: 135,
    proteinPer100g: 0.4,
    carbsPer100g: 33,
    fatPer100g: 0.1,
    defaultPortionG: 30,
    portionName: "2 tbsp"
  },
  {
    name: "Ranch Dressing",
    aliases: ["ranch sauce", "ranch dip"],
    caloriesPer100g: 321,
    proteinPer100g: 1,
    carbsPer100g: 7,
    fatPer100g: 32,
    defaultPortionG: 30,
    portionName: "2 tbsp"
  },
  {
    name: "Salad Dressing (Caesar)",
    aliases: ["caesar dressing", "caesar salad dressing"],
    caloriesPer100g: 340,
    proteinPer100g: 2,
    carbsPer100g: 10,
    fatPer100g: 34,
    defaultPortionG: 30,
    portionName: "2 tbsp"
  },
  {
    name: "Honey",
    aliases: [],
    caloriesPer100g: 304,
    proteinPer100g: 0.3,
    carbsPer100g: 82,
    fatPer100g: 0,
    defaultPortionG: 21,
    portionName: "1 tbsp"
  },
  {
    name: "Jam",
    aliases: ["strawberry jam", "raspberry jam", "jelly"],
    caloriesPer100g: 250,
    proteinPer100g: 0.4,
    carbsPer100g: 63,
    fatPer100g: 0.1,
    defaultPortionG: 20,
    portionName: "1 tbsp"
  },
  {
    name: "Nutella",
    aliases: ["chocolate hazelnut spread", "hazelnut spread"],
    caloriesPer100g: 539,
    proteinPer100g: 6.3,
    carbsPer100g: 57,
    fatPer100g: 31,
    defaultPortionG: 30,
    portionName: "2 tbsp"
  },
  {
    name: "Mustard",
    aliases: ["dijon mustard", "wholegrain mustard", "yellow mustard"],
    caloriesPer100g: 60,
    proteinPer100g: 3.7,
    carbsPer100g: 5.3,
    fatPer100g: 3.3,
    defaultPortionG: 10,
    portionName: "1 tsp"
  },

  // Common Meals / Takeaway
  {
    name: "Fried Rice",
    aliases: ["egg fried rice", "chinese fried rice"],
    caloriesPer100g: 163,
    proteinPer100g: 3.6,
    carbsPer100g: 26,
    fatPer100g: 5,
    defaultPortionG: 250,
    portionName: "1 portion"
  },
  {
    name: "Chicken Curry",
    aliases: ["curry", "chicken tikka masala", "indian chicken curry"],
    caloriesPer100g: 150,
    proteinPer100g: 12,
    carbsPer100g: 8,
    fatPer100g: 8,
    defaultPortionG: 300,
    portionName: "1 portion"
  },
  {
    name: "Biryani",
    aliases: ["chicken biryani", "lamb biryani"],
    caloriesPer100g: 168,
    proteinPer100g: 9,
    carbsPer100g: 24,
    fatPer100g: 4,
    defaultPortionG: 350,
    portionName: "1 portion"
  },
  {
    name: "Chow Mein",
    aliases: ["chicken chow mein", "noodles stir fry"],
    caloriesPer100g: 133,
    proteinPer100g: 7,
    carbsPer100g: 18,
    fatPer100g: 3.5,
    defaultPortionG: 300,
    portionName: "1 portion"
  },
  {
    name: "Spaghetti Bolognese",
    aliases: ["bolognese", "spag bol", "pasta bolognese"],
    caloriesPer100g: 131,
    proteinPer100g: 9,
    carbsPer100g: 15,
    fatPer100g: 4,
    defaultPortionG: 400,
    portionName: "1 plate"
  },
  {
    name: "Lasagne",
    aliases: ["lasagna"],
    caloriesPer100g: 148,
    proteinPer100g: 9,
    carbsPer100g: 14,
    fatPer100g: 6,
    defaultPortionG: 400,
    portionName: "1 portion"
  },
  {
    name: "Chilli Con Carne",
    aliases: ["chili con carne", "chilli"],
    caloriesPer100g: 129,
    proteinPer100g: 10,
    carbsPer100g: 12,
    fatPer100g: 4,
    defaultPortionG: 350,
    portionName: "1 bowl"
  },
  {
    name: "Soup (tomato)",
    aliases: ["tomato soup", "heinz tomato soup"],
    caloriesPer100g: 47,
    proteinPer100g: 1.2,
    carbsPer100g: 8.8,
    fatPer100g: 1,
    defaultPortionG: 400,
    portionName: "1 bowl"
  },
  {
    name: "Soup (chicken)",
    aliases: ["chicken soup", "chicken noodle soup"],
    caloriesPer100g: 35,
    proteinPer100g: 2.5,
    carbsPer100g: 4,
    fatPer100g: 1,
    defaultPortionG: 400,
    portionName: "1 bowl"
  },
  {
    name: "Burrito",
    aliases: ["chicken burrito", "beef burrito"],
    caloriesPer100g: 197,
    proteinPer100g: 10,
    carbsPer100g: 26,
    fatPer100g: 6,
    defaultPortionG: 300,
    portionName: "1 burrito"
  },
  {
    name: "Sushi (salmon roll)",
    aliases: ["sushi", "salmon sushi", "maki roll"],
    caloriesPer100g: 150,
    proteinPer100g: 7,
    carbsPer100g: 22,
    fatPer100g: 3,
    defaultPortionG: 170,
    portionName: "6 pieces"
  },
  {
    name: "Scrambled Eggs on Toast",
    aliases: ["eggs on toast"],
    caloriesPer100g: 150,
    proteinPer100g: 9,
    carbsPer100g: 14,
    fatPer100g: 6.5,
    defaultPortionG: 250,
    portionName: "1 plate"
  },
  {
    name: "Full English Breakfast",
    aliases: ["full english", "fry up", "full breakfast"],
    caloriesPer100g: 170,
    proteinPer100g: 10,
    carbsPer100g: 10,
    fatPer100g: 11,
    defaultPortionG: 600,
    portionName: "1 plate"
  },
  {
    name: "Beans on Toast",
    aliases: ["baked beans on toast"],
    caloriesPer100g: 100,
    proteinPer100g: 5,
    carbsPer100g: 17,
    fatPer100g: 1,
    defaultPortionG: 330,
    portionName: "1 plate"
  },
  {
    name: "Cheese on Toast",
    aliases: ["cheese toast", "grilled cheese"],
    caloriesPer100g: 280,
    proteinPer100g: 13,
    carbsPer100g: 26,
    fatPer100g: 14,
    defaultPortionG: 120,
    portionName: "1 serving"
  },
  {
    name: "Chicken Stir Fry",
    aliases: ["stir fry"],
    caloriesPer100g: 120,
    proteinPer100g: 12,
    carbsPer100g: 8,
    fatPer100g: 4.5,
    defaultPortionG: 300,
    portionName: "1 portion"
  },

  // Bread & Bakery
  {
    name: "Croissant",
    aliases: [],
    caloriesPer100g: 406,
    proteinPer100g: 8.2,
    carbsPer100g: 46,
    fatPer100g: 21,
    defaultPortionG: 57,
    portionName: "1 croissant"
  },
  {
    name: "Muffin (blueberry)",
    aliases: ["blueberry muffin", "muffin"],
    caloriesPer100g: 377,
    proteinPer100g: 5.4,
    carbsPer100g: 56,
    fatPer100g: 16,
    defaultPortionG: 113,
    portionName: "1 muffin"
  },
  {
    name: "Pancakes",
    aliases: ["pancake", "american pancakes"],
    caloriesPer100g: 227,
    proteinPer100g: 6.4,
    carbsPer100g: 28,
    fatPer100g: 10,
    defaultPortionG: 150,
    portionName: "3 pancakes"
  },
  {
    name: "Waffle",
    aliases: ["waffles", "belgian waffle"],
    caloriesPer100g: 291,
    proteinPer100g: 7.9,
    carbsPer100g: 37,
    fatPer100g: 14,
    defaultPortionG: 75,
    portionName: "1 waffle"
  },

  // Frozen / Packaged
  {
    name: "Baked Beans",
    aliases: ["heinz beans", "beans"],
    caloriesPer100g: 84,
    proteinPer100g: 4.8,
    carbsPer100g: 15,
    fatPer100g: 0.5,
    defaultPortionG: 200,
    portionName: "half tin"
  },
  {
    name: "Tinned Tomatoes",
    aliases: ["canned tomatoes", "chopped tomatoes"],
    caloriesPer100g: 24,
    proteinPer100g: 1.3,
    carbsPer100g: 4.5,
    fatPer100g: 0.2,
    defaultPortionG: 400,
    portionName: "1 tin"
  },
  {
    name: "Ice Cream (vanilla)",
    aliases: ["ice cream", "vanilla ice cream"],
    caloriesPer100g: 207,
    proteinPer100g: 3.5,
    carbsPer100g: 24,
    fatPer100g: 11,
    defaultPortionG: 100,
    portionName: "2 scoops"
  },
  {
    name: "Frozen Chips",
    aliases: ["oven chips", "frozen fries"],
    caloriesPer100g: 165,
    proteinPer100g: 2.7,
    carbsPer100g: 26,
    fatPer100g: 5.8,
    defaultPortionG: 200,
    portionName: "1 serving"
  },

  // More Vegetables
  {
    name: "Garlic",
    aliases: ["garlic clove"],
    caloriesPer100g: 149,
    proteinPer100g: 6.4,
    carbsPer100g: 33,
    fatPer100g: 0.5,
    defaultPortionG: 10,
    portionName: "3 cloves"
  },
  {
    name: "Ginger",
    aliases: ["fresh ginger"],
    caloriesPer100g: 80,
    proteinPer100g: 1.8,
    carbsPer100g: 18,
    fatPer100g: 0.8,
    defaultPortionG: 10,
    portionName: "1 tsp grated"
  },
  {
    name: "Green Beans",
    aliases: ["french beans", "fine beans"],
    caloriesPer100g: 31,
    proteinPer100g: 1.8,
    carbsPer100g: 7,
    fatPer100g: 0.1,
    defaultPortionG: 80,
    portionName: "1 serving"
  },
  {
    name: "Cauliflower",
    aliases: [],
    caloriesPer100g: 25,
    proteinPer100g: 1.9,
    carbsPer100g: 5,
    fatPer100g: 0.3,
    defaultPortionG: 100,
    portionName: "1 cup"
  },
  {
    name: "Asparagus",
    aliases: [],
    caloriesPer100g: 20,
    proteinPer100g: 2.2,
    carbsPer100g: 3.7,
    fatPer100g: 0.1,
    defaultPortionG: 90,
    portionName: "6 spears"
  },
  {
    name: "Beetroot",
    aliases: ["beets"],
    caloriesPer100g: 43,
    proteinPer100g: 1.6,
    carbsPer100g: 10,
    fatPer100g: 0.2,
    defaultPortionG: 100,
    portionName: "1 serving"
  },

  // More Proteins
  {
    name: "Sausages (pork)",
    aliases: ["sausage", "pork sausage", "banger"],
    caloriesPer100g: 301,
    proteinPer100g: 14,
    carbsPer100g: 8,
    fatPer100g: 25,
    defaultPortionG: 100,
    portionName: "2 sausages"
  },
  {
    name: "Chicken Sausages",
    aliases: ["chicken sausage"],
    caloriesPer100g: 176,
    proteinPer100g: 16,
    carbsPer100g: 10,
    fatPer100g: 8,
    defaultPortionG: 100,
    portionName: "2 sausages"
  },
  {
    name: "Halloumi",
    aliases: ["halloumi cheese", "grilled halloumi"],
    caloriesPer100g: 321,
    proteinPer100g: 26,
    carbsPer100g: 2,
    fatPer100g: 23,
    defaultPortionG: 80,
    portionName: "3 slices"
  },
  {
    name: "Duck Breast",
    aliases: ["duck"],
    caloriesPer100g: 337,
    proteinPer100g: 19,
    carbsPer100g: 0,
    fatPer100g: 29,
    defaultPortionG: 150,
    portionName: "1 breast"
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
