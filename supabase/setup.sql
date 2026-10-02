-- ========================================================
-- HIREST SUPABASE SCHEMA & PUBLIC ACCESS SETUP
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/utzsymssvzqdqmdzotag/sql/new
-- ========================================================

-- 1. Ensure columns exist on public.interview_sessions
alter table if exists public.interview_sessions 
  add column if not exists candidate_name text,
  add column if not exists candidate_email text,
  add column if not exists interviewer_name text,
  add column if not exists interviewer_email text,
  add column if not exists scheduled_date text,
  add column if not exists scheduled_time text;

-- Make foreign key columns nullable
alter table if exists public.interview_sessions 
  alter column candidate_id drop not null,
  alter column interviewer_id drop not null;

-- Update status check constraint to accept upcoming & in-progress
alter table if exists public.interview_sessions drop constraint if exists interview_sessions_status_check;
alter table if exists public.interview_sessions add constraint interview_sessions_status_check 
  check (status in ('pending', 'confirmed', 'upcoming', 'in-progress', 'completed', 'cancelled'));

-- 2. Drop foreign key constraint on profiles so any candidate can be stored directly
alter table if exists public.profiles drop constraint if exists profiles_id_fkey;
alter table if exists public.profiles alter column id set default gen_random_uuid();

-- 3. Dedicated candidates table (optional backup)
create table if not exists public.candidates (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  full_name text not null,
  role text default 'candidate',
  phone text,
  location text,
  target_role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Availability slots table
create table if not exists public.availability_slots (
  id text primary key,
  day int not null default 10,
  time text not null,
  enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Disable Row Level Security (RLS) to allow direct read & write without email confirmation
alter table public.interview_sessions disable row level security;
alter table public.interview_feedback disable row level security;
alter table public.profiles disable row level security;
alter table public.candidates disable row level security;
alter table public.availability_slots disable row level security;

-- 6. Backfill existing candidate profiles from interview_sessions
insert into public.profiles (id, email, full_name, role)
select gen_random_uuid(), candidate_email, candidate_name, 'candidate'
from (
  select distinct candidate_email, candidate_name
  from public.interview_sessions
  where candidate_email is not null
) s
on conflict (email) do nothing;

-- 7. Link candidate_id in interview_sessions to profiles
update public.interview_sessions s
set candidate_id = p.id
from public.profiles p
where s.candidate_email = p.email
  and s.candidate_id is null;
