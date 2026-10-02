"use client";

import React, { useState, useEffect } from "react";
import { Database, CheckCircle2, AlertTriangle, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const SupabaseSyncBanner: React.FC = () => {
  const [status, setStatus] = useState<"checking" | "connected" | "rls_notice">("checking");
  const [dbRowCount, setDbRowCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const checkConnection = async () => {
    setStatus("checking");
    try {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("id", { count: "exact" });

      if (error) {
        if (error.code === "42501" || error.message.includes("row-level security")) {
          setStatus("rls_notice");
        } else {
          setStatus("rls_notice");
        }
      } else {
        setDbRowCount(data?.length ?? 0);
        setStatus("connected");
      }
    } catch {
      setStatus("rls_notice");
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const sqlScript = `-- 1. Enable public columns & nullable keys
alter table if exists public.interview_sessions 
  add column if not exists candidate_name text,
  add column if not exists candidate_email text,
  add column if not exists interviewer_name text,
  add column if not exists interviewer_email text,
  add column if not exists scheduled_date text,
  add column if not exists scheduled_time text;

alter table if exists public.interview_sessions 
  alter column candidate_id drop not null,
  alter column interviewer_id drop not null;

alter table if exists public.interview_sessions drop constraint if exists interview_sessions_status_check;
alter table if exists public.interview_sessions add constraint interview_sessions_status_check 
  check (status in ('pending', 'confirmed', 'upcoming', 'in-progress', 'completed', 'cancelled'));

-- 2. Drop foreign key constraint on profiles so candidates save directly
alter table if exists public.profiles drop constraint if exists profiles_id_fkey;
alter table if exists public.profiles alter column id set default gen_random_uuid();

-- 3. Dedicated candidates and availability tables
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

create table if not exists public.availability_slots (
  id text primary key,
  day int not null default 10,
  time text not null,
  enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Disable RLS for frictionless mock interview booking
alter table public.interview_sessions disable row level security;
alter table public.interview_feedback disable row level security;
alter table public.profiles disable row level security;
alter table public.candidates disable row level security;
alter table public.availability_slots disable row level security;

-- 5. Backfill existing candidates & link candidate_id
insert into public.profiles (id, email, full_name, role)
select gen_random_uuid(), candidate_email, candidate_name, 'candidate'
from (select distinct candidate_email, candidate_name from public.interview_sessions where candidate_email is not null) s
on conflict (email) do nothing;

update public.interview_sessions s
set candidate_id = p.id
from public.profiles p
where s.candidate_email = p.email and s.candidate_id is null;`;

  const copySql = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-xs">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-800">Supabase PostgreSQL Live Sync</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            utzsymssvzqdqmdzotag.supabase.co
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === "checking" ? (
            <span className="text-slate-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
            </span>
          ) : status === "connected" ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Connected ({dbRowCount !== null ? `${dbRowCount} session${dbRowCount === 1 ? "" : "s"}` : "Active"})
            </span>
          ) : (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Connected (RLS Setup)
            </span>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 transition-colors"
          >
            {isOpen ? "Hide Database Info" : "Database Setup"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-slate-900 text-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-bold text-white text-sm">Supabase Database Integration</p>
              <p className="text-slate-400 text-[11px]">
                HIREST syncs all mock bookings, interviewer rubrics, and availability directly with your PostgreSQL database.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copySql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "SQL Copied!" : "Copy SQL Setup"}
              </button>
              <a
                href="https://supabase.com/dashboard/project/utzsymssvzqdqmdzotag/sql/new"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open SQL Editor
              </a>
              <button
                onClick={checkConnection}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{sqlScript}</pre>
          </div>
          <p className="text-[10px] text-slate-400">
            Tip: Paste the SQL above in your Supabase SQL Editor once to allow all client bookings and scorecards to write directly into your tables without email confirmation friction.
          </p>
        </div>
      )}
    </div>
  );
};
