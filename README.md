# IronMind - AI Gym Tracker

A comprehensive gym and nutrition tracking app with AI-powered insights, multi-user authentication, and personalized goals.

## Features

### Workout Tracking
- Log exercises with sets, reps, and weights
- Customizable workout splits (PPL, Bro Split, Upper/Lower, Full Body, or Custom)
- Smart Targets: AI-powered weight/rep recommendations based on your history
- Session timer with persistence (survives browser refresh)
- Edit and delete past workout sessions
- Default exercise suggestions for each workout type

### Nutrition Tracking
- Manual food logging with calories, protein, carbs, and fat
- Barcode scanning for quick food entry
- AI photo estimation - snap a pic of your meal
- Water intake tracking
- Personalized calorie and protein goals calculated from your stats (Mifflin-St Jeor formula)

### AI Analysis
- Monthly strength reports analyzing your progression
- Plateau detection with deload recommendations
- Trend analysis (progressing, maintaining, regressing)

### Multi-User Support
- Email/password authentication
- Google OAuth sign-in
- Per-user data isolation with Row Level Security
- Session persistence across browser restarts

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```env
ANTHROPIC_API_KEY=your-claude-api-key
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run the development server:
```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Supabase Setup

### 1. Create Tables

```sql
-- Profiles table (with all fields)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL,
  age INTEGER,
  weight REAL,
  height REAL,
  gender TEXT,
  activity_level TEXT,
  calorie_goal INTEGER,
  protein_goal INTEGER,
  split_type TEXT,
  split_days TEXT[],
  split_rest_pattern INTEGER,
  split_current_day_index INTEGER,
  split_start_date DATE,
  ramadan_mode BOOLEAN DEFAULT false,
  ramadan_start DATE,
  ramadan_end DATE,
  ramadan_recovery_weeks INTEGER DEFAULT 2,
  custom_calorie_goal INTEGER,
  custom_protein_goal REAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workout sessions
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT,
  start_time BIGINT,
  end_time BIGINT,
  duration INTEGER,
  type TEXT,
  exercises JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Food logs
CREATE TABLE food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT,
  timestamp BIGINT,
  name TEXT,
  calories INTEGER,
  protein REAL,
  carbs REAL,
  fat REAL,
  grams REAL,
  unit TEXT DEFAULT 'g',
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Water logs
CREATE TABLE water_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT,
  timestamp BIGINT,
  amount INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Sessions: users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Food logs: users can only access their own logs
CREATE POLICY "Users can view own food logs" ON food_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food logs" ON food_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own food logs" ON food_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Water logs: users can only access their own logs
CREATE POLICY "Users can view own water logs" ON water_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water logs" ON water_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own water logs" ON water_logs
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Enable Google OAuth (Optional)

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URL to Google Cloud Console

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth, Database, RLS)
- **AI:** Claude API (Anthropic)
- **Build:** Vite
- **Deploy:** Vercel

## License

MIT
