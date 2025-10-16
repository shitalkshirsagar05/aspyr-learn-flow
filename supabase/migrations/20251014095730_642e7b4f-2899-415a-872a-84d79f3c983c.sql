-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for courses (public read access)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  USING (true);

-- Create modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for modules (public read access)
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules"
  ON public.modules FOR SELECT
  USING (true);

-- Create completions table to track user progress
CREATE TABLE public.completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS for completions
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON public.completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON public.completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
  ON public.completions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample courses
INSERT INTO public.courses (title, description, category, icon, color) VALUES
  ('Frontend Basics', 'Master the fundamentals of modern frontend development', 'Development', 'Code', '#7A1CAC'),
  ('Backend Essentials', 'Build powerful server-side applications', 'Development', 'Server', '#2E073F'),
  ('UI Magic', 'Create stunning user interfaces and experiences', 'Design', 'Palette', '#CB9DF0');

-- Insert sample modules for Frontend Basics
INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'HTML & CSS Fundamentals', 'Learn the building blocks of web pages', 1, '2h 30m' FROM public.courses WHERE title = 'Frontend Basics';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'JavaScript Essentials', 'Master the language of the web', 2, '3h 15m' FROM public.courses WHERE title = 'Frontend Basics';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'React Components', 'Build interactive UIs with React', 3, '4h 00m' FROM public.courses WHERE title = 'Frontend Basics';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'State Management', 'Handle complex application state', 4, '2h 45m' FROM public.courses WHERE title = 'Frontend Basics';

-- Insert sample modules for Backend Essentials
INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'Node.js Basics', 'Server-side JavaScript fundamentals', 1, '3h 00m' FROM public.courses WHERE title = 'Backend Essentials';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'REST APIs', 'Design and build RESTful services', 2, '3h 30m' FROM public.courses WHERE title = 'Backend Essentials';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'Database Design', 'Structure and optimize your data', 3, '2h 50m' FROM public.courses WHERE title = 'Backend Essentials';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'Authentication & Security', 'Secure your applications', 4, '3h 20m' FROM public.courses WHERE title = 'Backend Essentials';

-- Insert sample modules for UI Magic
INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'Design Principles', 'Learn the fundamentals of great design', 1, '2h 00m' FROM public.courses WHERE title = 'UI Magic';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'Color Theory', 'Master the psychology of color', 2, '1h 45m' FROM public.courses WHERE title = 'UI Magic';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'Typography & Layout', 'Create visual hierarchy', 3, '2h 30m' FROM public.courses WHERE title = 'UI Magic';

INSERT INTO public.modules (course_id, title, description, order_index, duration) 
SELECT id, 'Animations & Micro-interactions', 'Bring your designs to life', 4, '3h 15m' FROM public.courses WHERE title = 'UI Magic';