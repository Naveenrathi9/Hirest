-- HIREST Database Schema for Supabase

-- 1. Profiles Table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('candidate', 'interviewer', 'admin')) default 'candidate',
  avatar_url text,
  headline text,
  company text,
  experience_years int default 0,
  skills text[] default array[]::text[],
  hourly_rate numeric default 499,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Interview Sessions Table
create table public.interview_sessions (
  id uuid default gen_random_uuid() primary key,
  candidate_id uuid references public.profiles(id) on delete set null,
  interviewer_id uuid references public.profiles(id) on delete set null,
  domain text not null,
  scheduled_at timestamp with time zone not null,
  duration_minutes int default 60,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  meeting_link text,
  notes text,
  price numeric default 499,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Feedback & Evaluation Report Table
create table public.interview_feedback (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.interview_sessions(id) on delete cascade unique,
  technical_rating int check (technical_rating between 1 and 10),
  communication_rating int check (communication_rating between 1 and 10),
  problem_solving_rating int check (problem_solving_rating between 1 and 10),
  strengths text[],
  areas_for_improvement text[],
  detailed_notes text,
  verdict text check (verdict in ('Strong Hire', 'Hire', 'Borderline', 'Needs Improvement')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_feedback enable row level security;

-- Public read for verified profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Sessions policy
create policy "Users can view sessions they participate in" on public.interview_sessions
  for select using (auth.uid() = candidate_id or auth.uid() = interviewer_id);

create policy "Candidates can create session requests" on public.interview_sessions
  for insert with check (auth.uid() = candidate_id);
