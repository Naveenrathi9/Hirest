"use client";

import { supabase } from "./supabase";

export interface SessionItem {
  id: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  interviewerName: string;
  interviewerEmail: string;
  domain: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "upcoming" | "in-progress" | "completed";
  price: number;
  meetingLink?: string;
  notes?: string;
  feedback?: {
    technicalScore: number;
    communicationScore: number;
    problemSolvingScore: number;
    strengths: string[];
    improvements: string[];
    verdict: "Strong Hire" | "Hire" | "Borderline" | "Needs Improvement";
    detailedNotes: string;
    completedAt: string;
  };
}

export interface AvailabilitySlot {
  id: string;
  day: number;
  time: string;
  enabled: boolean;
}

// Generate valid UUID for Supabase compatibility
export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c01",
    candidateName: "Rohit Verma",
    candidateEmail: "rohit.verma@example.com",
    interviewerName: "Amit Sharma",
    interviewerEmail: "amit.sharma@example.com",
    domain: "Frontend Developer (React / Next.js) • TCS Track",
    scheduledDate: "Today",
    scheduledTime: "10:00 AM - 10:45 AM",
    status: "upcoming",
    price: 499,
    notes: "Candidate requested special focus on React 18 hooks & SSR performance.",
  },
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c02",
    candidateName: "Sneha Patel",
    candidateEmail: "sneha.patel@example.com",
    interviewerName: "Amit Sharma",
    interviewerEmail: "amit.sharma@example.com",
    domain: "Data Analyst & SQL • Accenture Track",
    scheduledDate: "Today",
    scheduledTime: "12:00 PM - 12:45 PM",
    status: "upcoming",
    price: 499,
  },
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c03",
    candidateName: "Arjun Mehta",
    candidateEmail: "arjun.mehta@example.com",
    interviewerName: "Amit Sharma",
    interviewerEmail: "amit.sharma@example.com",
    domain: "SDE-II System Design • Microsoft Track",
    scheduledDate: "Tomorrow",
    scheduledTime: "11:00 AM - 11:45 AM",
    status: "upcoming",
    price: 499,
  },
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c04",
    candidateName: "Rohit Verma",
    candidateEmail: "rohit.verma@example.com",
    interviewerName: "Priya Singh",
    interviewerEmail: "priya.singh@example.com",
    domain: "Frontend Developer • Tech Mahindra Track",
    scheduledDate: "Sep 10, 2026",
    scheduledTime: "04:00 PM - 04:45 PM",
    status: "completed",
    price: 499,
    feedback: {
      technicalScore: 9,
      communicationScore: 8,
      problemSolvingScore: 9,
      strengths: [
        "Clean component composition",
        "Good React performance awareness",
        "Strong semantic HTML",
      ],
      improvements: [
        "Practice edge cases for async cancellation",
        "Deepen Webpack/bundler internals",
      ],
      verdict: "Strong Hire",
      detailedNotes:
        "Rohit demonstrated exemplary React state architecture and answered tricky closure questions with ease.",
      completedAt: "Sep 10, 2026",
    },
  },
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c05",
    candidateName: "Rohit Verma",
    candidateEmail: "rohit.verma@example.com",
    interviewerName: "Sneha Patel",
    interviewerEmail: "sneha.patel@example.com",
    domain: "Data Analyst • Accenture Track",
    scheduledDate: "Sep 04, 2026",
    scheduledTime: "02:00 PM - 02:45 PM",
    status: "completed",
    price: 499,
    feedback: {
      technicalScore: 9,
      communicationScore: 9,
      problemSolvingScore: 8,
      strengths: [
        "Strong SQL window functions",
        "Clear and articulate communication",
      ],
      improvements: ["Explain trade-offs faster in initial 5 minutes"],
      verdict: "Strong Hire",
      detailedNotes:
        "Exceptional analytical depth. Confident problem decomposition.",
      completedAt: "Sep 04, 2026",
    },
  },
];

const INITIAL_SLOTS: AvailabilitySlot[] = [
  { id: "slot-1", day: 10, time: "09:00 AM - 10:00 AM", enabled: true },
  { id: "slot-2", day: 10, time: "10:00 AM - 11:00 AM", enabled: true },
  { id: "slot-3", day: 10, time: "11:00 AM - 12:00 PM", enabled: false },
  { id: "slot-4", day: 10, time: "02:00 PM - 03:00 PM", enabled: true },
  { id: "slot-5", day: 10, time: "04:00 PM - 05:00 PM", enabled: true },
];

// Local storage synchronous reader (instant initial render)
export const getStoredSessions = (): SessionItem[] => {
  if (typeof window === "undefined") return INITIAL_SESSIONS;
  try {
    const data = localStorage.getItem("hirest_sessions");
    if (!data) {
      localStorage.setItem("hirest_sessions", JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SESSIONS;
  }
};

export const saveStoredSessions = (sessions: SessionItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hirest_sessions", JSON.stringify(sessions));
    window.dispatchEvent(new Event("hirest_data_updated"));
  }
};

export const getStoredSlots = (): AvailabilitySlot[] => {
  if (typeof window === "undefined") return INITIAL_SLOTS;
  try {
    const data = localStorage.getItem("hirest_slots");
    if (!data) {
      localStorage.setItem("hirest_slots", JSON.stringify(INITIAL_SLOTS));
      return INITIAL_SLOTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SLOTS;
  }
};

export const saveStoredSlots = (slots: AvailabilitySlot[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hirest_slots", JSON.stringify(slots));
    window.dispatchEvent(new Event("hirest_data_updated"));
  }

  // Attempt sync to Supabase availability_slots table
  try {
    if (typeof window !== "undefined") {
      fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slots: slots.map((s) => ({
            id: s.id,
            day: s.day,
            time: s.time,
            enabled: s.enabled,
          })),
        }),
      }).catch(() => {});
    }

    supabase
      .from("availability_slots")
      .upsert(
        slots.map((s) => ({
          id: s.id,
          day: s.day,
          time: s.time,
          enabled: s.enabled,
        }))
      )
      .then(({ error }) => {
        if (error) {
          console.warn("Supabase availability_slots sync note:", error.message);
        } else {
          console.log("Supabase availability_slots synced successfully.");
        }
      });
  } catch (e) {
    // Graceful offline fallback
  }
};

// Async Supabase Fetch Engine
export const fetchSessionsFromSupabase = async (): Promise<SessionItem[]> => {
  try {
    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*, interview_feedback(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch note:", error.message);
      return getStoredSessions();
    }

    if (data && data.length > 0) {
      const mapped: SessionItem[] = data.map((row: any) => {
        const fb = Array.isArray(row.interview_feedback)
          ? row.interview_feedback[0]
          : row.interview_feedback;

        return {
          id: row.id,
          candidateId: row.candidate_id || undefined,
          candidateName: row.candidate_name || "Rohit Verma",
          candidateEmail: row.candidate_email || "rohit.verma@example.com",
          interviewerName: row.interviewer_name || "Amit Sharma",
          interviewerEmail: row.interviewer_email || "amit.sharma@example.com",
          domain: row.domain || "Technical Mock Interview",
          scheduledDate:
            row.scheduled_date ||
            (row.scheduled_at
              ? new Date(row.scheduled_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Upcoming"),
          scheduledTime:
            row.scheduled_time ||
            (row.scheduled_at
              ? new Date(row.scheduled_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "10:00 AM - 10:45 AM"),
          status: row.status === "completed" ? "completed" : "upcoming",
          price: Number(row.price) || 499,
          meetingLink: row.meeting_link || `https://hirest.live/room/${row.id}`,
          notes: row.notes || undefined,
          feedback: fb
            ? {
                technicalScore: fb.technical_rating || 9,
                communicationScore: fb.communication_rating || 8,
                problemSolvingScore: fb.problem_solving_rating || 9,
                strengths: fb.strengths || [],
                improvements: fb.areas_for_improvement || [],
                verdict: fb.verdict || "Strong Hire",
                detailedNotes: fb.detailed_notes || "",
                completedAt: fb.created_at
                  ? new Date(fb.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently",
              }
            : undefined,
        };
      });

      // Update local cache and notify listeners
      saveStoredSessions(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase session fetch exception:", err);
  }
  return getStoredSessions();
};

export const fetchSlotsFromSupabase = async (): Promise<AvailabilitySlot[]> => {
  try {
    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .order("day", { ascending: true });

    if (error) {
      console.warn("Supabase slots fetch note:", error.message);
      return getStoredSlots();
    }

    if (data && data.length > 0) {
      const mapped: AvailabilitySlot[] = data.map((row: any) => ({
        id: row.id,
        day: row.day,
        time: row.time,
        enabled: row.enabled ?? true,
      }));
      saveStoredSlots(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Supabase slots fetch exception:", err);
  }
  return getStoredSlots();
};

export const addInterviewSession = (
  newSession: Omit<SessionItem, "id" | "status">
): SessionItem => {
  const current = getStoredSessions();
  const validId = generateUUID();

  const session: SessionItem = {
    ...newSession,
    id: validId,
    status: "upcoming",
  };

  // Optimistic local update
  const updated = [session, ...current];
  saveStoredSessions(updated);

  // Sync to Supabase interview_sessions table
  try {
    const payload: Record<string, any> = {
      id: validId,
      candidate_id: session.candidateId || null,
      domain: session.domain,
      scheduled_at: new Date().toISOString(),
      duration_minutes: 60,
      price: session.price,
      notes: session.notes,
      meeting_link: session.meetingLink || `https://hirest.live/room/${validId}`,
      status: "confirmed",
      candidate_name: session.candidateName,
      candidate_email: session.candidateEmail,
      interviewer_name: session.interviewerName || "Amit Sharma",
      interviewer_email: session.interviewerEmail || "amit.sharma@example.com",
      scheduled_date: session.scheduledDate,
      scheduled_time: session.scheduledTime,
    };

    // 1. Try server-side API route
    if (typeof window !== "undefined") {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    // 2. Client-side direct Supabase fallback
    supabase
      .from("interview_sessions")
      .insert(payload)
      .then(({ error, data }) => {
        if (error) {
          console.warn("Supabase interview_sessions insert note:", error.message);
        } else {
          console.log("Supabase interview session stored successfully in PostgreSQL:", data);
        }
      });
  } catch (e) {
    console.warn("Supabase session insert catch error:", e);
  }

  return session;
};

export const completeInterviewSession = (
  sessionId: string,
  feedback: SessionItem["feedback"]
) => {
  const current = getStoredSessions();
  const updated = current.map((s) => {
    if (s.id === sessionId) {
      return {
        ...s,
        status: "completed" as const,
        feedback,
      };
    }
    return s;
  });
  saveStoredSessions(updated);

  // Sync update to Supabase
  try {
    // 1. Server API
    if (typeof window !== "undefined" && feedback) {
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          technicalRating: feedback.technicalScore,
          communicationRating: feedback.communicationScore,
          problemSolvingRating: feedback.problemSolvingScore,
          strengths: feedback.strengths,
          areasForImprovement: feedback.improvements,
          detailedNotes: feedback.detailedNotes,
          verdict: feedback.verdict,
        }),
      }).catch(() => {});
    }

    // 2. Client-side direct Supabase update
    supabase
      .from("interview_sessions")
      .update({ status: "completed" })
      .eq("id", sessionId)
      .then(({ error }) => {
        if (error) console.warn("Supabase session status update note:", error.message);
      });

    if (feedback) {
      supabase
        .from("interview_feedback")
        .upsert(
          {
            session_id: sessionId,
            technical_rating: feedback.technicalScore,
            communication_rating: feedback.communicationScore,
            problem_solving_rating: feedback.problemSolvingScore,
            strengths: feedback.strengths,
            areas_for_improvement: feedback.improvements,
            detailed_notes: feedback.detailedNotes,
            verdict: feedback.verdict,
          },
          { onConflict: "session_id" }
        )
        .then(({ error }) => {
          if (error) console.warn("Supabase interview_feedback insert note:", error.message);
          else console.log("Supabase interview_feedback recorded successfully in PostgreSQL.");
        });
    }
  } catch (e) {
    console.warn("Supabase completeInterviewSession catch:", e);
  }
};
