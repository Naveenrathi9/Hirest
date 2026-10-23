"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LiveInterviewRoom } from "@/components/LiveInterviewRoom";
import { ArrowLeft, Video, ShieldCheck, UserCheck, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { getStoredSessions, fetchSessionsFromSupabase, SessionItem } from "@/lib/store";

export default function DirectMeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "";

  const [session, setSession] = useState<SessionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    email: string;
    fullName?: string;
    role: "candidate" | "interviewer" | "admin";
  } | null>(null);

  // Load user & session
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        // 1. Identify current user
        let user: any = null;
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            user = data.user;
          }
        } catch {}

        if (!user && typeof window !== "undefined") {
          const local = localStorage.getItem("hirest_user");
          if (local) {
            try {
              user = JSON.parse(local);
            } catch {}
          }
        }

        if (!isCancelled && user) {
          setCurrentUser(user);
        }

        // 2. Fetch session from Supabase / store
        const stored = getStoredSessions();
        const foundLocal = stored.find((s) => s.id === sessionId);
        if (foundLocal && !isCancelled) {
          setSession(foundLocal);
        }

        const remoteSessions = await fetchSessionsFromSupabase();
        const foundRemote = remoteSessions.find((s) => s.id === sessionId);
        if (foundRemote && !isCancelled) {
          setSession(foundRemote);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [sessionId]);

  // Determine user role in this session
  const isInterviewer =
    currentUser?.role === "interviewer" ||
    (session && currentUser && session.interviewerEmail?.toLowerCase() === currentUser.email?.toLowerCase());

  const userRole: "candidate" | "interviewer" = isInterviewer ? "interviewer" : "candidate";

  const currentUserName =
    currentUser?.fullName || currentUser?.email?.split("@")[0] || (userRole === "interviewer" ? "Interviewer" : "Candidate");

  const remoteUserName =
    userRole === "interviewer"
      ? session?.candidateName || "Candidate"
      : session?.interviewerName || "Verified Interviewer";

  const handleReturn = () => {
    if (userRole === "interviewer") {
      router.push("/dashboard/interviewer");
    } else {
      router.push("/dashboard/candidate");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={handleReturn}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-base font-bold text-white tracking-tight">
                {session?.domain || "1-on-1 Mock Interview Room"}
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Room #{sessionId.slice(0, 8)} • Meeting with <span className="text-slate-200 font-semibold">{remoteUserName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>You: <strong className="text-white capitalize">{currentUserName} ({userRole})</strong></span>
          </div>

          <button
            onClick={handleReturn}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Exit to Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col">
        <div className="flex-1 w-full flex items-center justify-center">
          <LiveInterviewRoom
            sessionId={sessionId}
            currentUserRole={userRole}
            currentUserName={currentUserName}
            remoteUserName={remoteUserName}
            domain={session?.domain}
            scheduledDate={session?.scheduledDate}
            scheduledTime={session?.scheduledTime}
            onEndCall={handleReturn}
          />
        </div>
      </main>
    </div>
  );
}
