"use client";

import { supabase } from "./supabase";

export interface SessionItem {
  id: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  interviewerId?: string;
  interviewerName: string;
  interviewerEmail: string;
  domain: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "pending" | "confirmed" | "upcoming" | "in-progress" | "completed" | "cancelled";
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

export interface InterviewerItem {
  id: string;
  fullName: string;
  email: string;
  headline: string;
  company: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  domain?: string;
  domains: string[];
  contact?: string;
  gender?: string;
  avatarUrl?: string;
  approvalStatus: "pending" | "approved" | "rejected";
}

export interface AvailabilitySlot {
  id: string;
  day: number;
  time: string;
  enabled: boolean;
}

export const INITIAL_INTERVIEWERS: InterviewerItem[] = [];

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

const INITIAL_SESSIONS: SessionItem[] = [];

const INITIAL_SLOTS: AvailabilitySlot[] = [];

// Local storage synchronous reader (instant initial render)
export const getStoredSessions = (): SessionItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("hirest_sessions");
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s: any) =>
        s.interviewerEmail !== "amit.sharma@example.com" &&
        s.interviewerEmail !== "priya.singh@example.com" &&
        s.candidateEmail !== "rohit.verma@example.com" &&
        s.candidateEmail !== "sneha.patel@example.com" &&
        s.candidateEmail !== "arjun.mehta@example.com"
    );
  } catch {
    return [];
  }
};

export const saveStoredSessions = (sessions: SessionItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hirest_sessions", JSON.stringify(sessions));
    window.dispatchEvent(new Event("hirest_data_updated"));
  }
};

export const getStoredSlots = (): AvailabilitySlot[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("hirest_slots");
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
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
          candidateName:
            row.candidate_name ||
            (row.candidate_email ? row.candidate_email.split("@")[0] : "Candidate"),
          candidateEmail: row.candidate_email || "candidate@hirest.com",
          interviewerId: row.interviewer_id || undefined,
          interviewerName: row.interviewer_name || "Interviewer",
          interviewerEmail: row.interviewer_email || "interviewer@hirest.com",
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
          status: (row.status as SessionItem["status"]) || "pending",
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
  newSession: Omit<SessionItem, "id" | "status"> & { status?: SessionItem["status"] }
): SessionItem => {
  const current = getStoredSessions();
  const validId = generateUUID();

  // Booking requests from candidates default to "pending" awaiting interviewer acceptance
  const sessionStatus = newSession.status || "pending";

  const session: SessionItem = {
    ...newSession,
    id: validId,
    status: sessionStatus,
  };

  // Optimistic local update
  const updated = [session, ...current];
  saveStoredSessions(updated);

  // Sync to Supabase interview_sessions table
  try {
    const isValidUUIDStr = (str: any) =>
      typeof str === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

    const payload: Record<string, any> = {
      id: validId,
      candidate_id: isValidUUIDStr(session.candidateId) ? session.candidateId : null,
      interviewer_id: isValidUUIDStr(session.interviewerId) ? session.interviewerId : null,
      domain: session.domain,
      scheduled_at: new Date().toISOString(),
      duration_minutes: 60,
      price: session.price,
      notes: session.notes,
      meeting_link: session.meetingLink || `https://hirest.live/room/${validId}`,
      status: sessionStatus,
      candidate_name: session.candidateName,
      candidate_email: session.candidateEmail,
      interviewer_name: session.interviewerName || "Interviewer",
      interviewer_email: session.interviewerEmail || "interviewer@hirest.com",
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

export const updateSessionStatus = (
  sessionId: string,
  newStatus: SessionItem["status"]
) => {
  const current = getStoredSessions();
  const updated = current.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s));
  saveStoredSessions(updated);

  try {
    if (typeof window !== "undefined") {
      fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, status: newStatus }),
      }).catch(() => {});
    }

    supabase
      .from("interview_sessions")
      .update({ status: newStatus })
      .eq("id", sessionId)
      .then(({ error }) => {
        if (error) console.warn("Supabase updateSessionStatus note:", error.message);
      });
  } catch (e) {
    console.warn("updateSessionStatus exception:", e);
  }
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

// Interviewers local cache & API sync
export const getStoredInterviewers = (): InterviewerItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("hirest_interviewers");
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i: any) =>
        i.email !== "amit.sharma@example.com" &&
        i.email !== "priya.singh@example.com" &&
        i.email !== "vikram.malhotra@example.com" &&
        i.email !== "ananya.roy@example.com" &&
        !i.id?.startsWith("mentor-")
    );
  } catch {
    return [];
  }
};

export const saveStoredInterviewers = (interviewers: InterviewerItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hirest_interviewers", JSON.stringify(interviewers));
    window.dispatchEvent(new Event("hirest_interviewers_updated"));
  }
};

export const fetchInterviewers = async (
  showAll = false,
  domain?: string
): Promise<InterviewerItem[]> => {
  try {
    const params = new URLSearchParams();
    if (showAll) params.set("all", "true");
    if (domain) params.set("domain", domain);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/interviewers${queryString}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.interviewers && Array.isArray(data.interviewers)) {
        if (!domain && !showAll) {
          saveStoredInterviewers(data.interviewers);
        }
        return data.interviewers;
      }
    }
  } catch (e) {
    console.warn("fetchInterviewers note:", e);
  }
  return getStoredInterviewers().filter((i) => (showAll ? true : i.approvalStatus === "approved"));
};

export const updateInterviewerApprovalStatus = async (
  id: string,
  email: string,
  approvalStatus: "approved" | "rejected" | "pending"
) => {
  const current = getStoredInterviewers();
  const updated = current.map((item) =>
    item.id === id || item.email.toLowerCase() === email.toLowerCase()
      ? { ...item, approvalStatus }
      : item
  );
  saveStoredInterviewers(updated);

  try {
    await fetch("/api/interviewers/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewerId: id, email, approvalStatus }),
    });
  } catch (e) {
    console.warn("updateInterviewerApprovalStatus note:", e);
  }
};
