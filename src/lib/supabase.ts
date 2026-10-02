import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProfileRole = 'candidate' | 'interviewer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: ProfileRole;
  avatar_url?: string;
  headline?: string;
  company?: string;
  experience_years?: number;
  skills?: string[];
  hourly_rate?: number;
  created_at?: string;
}

export interface InterviewSession {
  id: string;
  candidate_id: string;
  interviewer_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  domain: string;
  notes?: string;
  meeting_link?: string;
  feedback?: {
    technical_score: number;
    communication_score: number;
    problem_solving_score: number;
    strengths: string[];
    improvements: string[];
    overall_comments: string;
  };
}
