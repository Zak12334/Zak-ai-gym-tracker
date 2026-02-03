# IronMind - AI Gym Tracker

A personal gym tracking app with AI-powered progress analysis.

## Features
- Log workouts (exercises, sets, reps, weights)
- Track by workout type (Chest/Tri, Back/Abs, Biceps, Legs)
- AI-generated monthly strength reports
- Cloud storage via Supabase

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
```
   npm install
```

2. Create a `.env.local` file with:
```
   ANTHROPIC_API_KEY=your-claude-api-key
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run the app:
```
   npm run dev
```

## Deploy

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel settings
4. Deploy

## Setup Supabase

Run this SQL to create tables:
```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  age INTEGER,
  weight REAL,
  height REAL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  date TEXT,
  type TEXT,
  exercises JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
```
