-- Add profile customization fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Fueling my learning journey every day 🚀',
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS learning_mood TEXT DEFAULT 'Feeling Curious 😎',
ADD COLUMN IF NOT EXISTS daily_journal TEXT,
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;