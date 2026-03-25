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
