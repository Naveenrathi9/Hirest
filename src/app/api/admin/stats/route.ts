import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseProfileBio } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supabase = getClient();

    // 1. Fetch all profiles dynamically from Supabase
    const { data: profiles, error: profError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Fetch all sessions dynamically from Supabase
    const { data: sessions, error: sessError } = await supabase
      .from("interview_sessions")
      .select("*, interview_feedback(*)")
      .order("created_at", { ascending: false });

    if (profError) {
      console.warn("Profiles fetch note in admin stats:", profError.message);
    }
    if (sessError) {
      console.warn("Sessions fetch note in admin stats:", sessError.message);
    }

    const allSessions = sessions || [];
    const allProfiles = profiles || [];

    // Separate Candidates and Interviewers (exclude admin from candidates list)
    const rawCandidates = allProfiles.filter(
      (p) => p.role === "candidate" || (!p.role && p.email !== "admin@hirest.com")
    );
    const rawInterviewers = allProfiles.filter((p) => p.role === "interviewer");

    const interviewers = rawInterviewers.map((row) => {
      const { approvalStatus, company, experienceYears, contact, gender, domain, skills } = parseProfileBio(row.bio);
      const cleanDomain = domain || (skills && skills[0]) || (row.skills && row.skills[0]) || "Full Stack Software Engineering";
      return {
        id: row.id,
        email: row.email,
        fullName: row.full_name || row.email.split("@")[0],
        headline: row.headline || `${cleanDomain} Professional Interviewer`,
        company: company || row.company || "Tech Professional",
        experienceYears: experienceYears || row.experience_years || 4,
        hourlyRate: row.hourly_rate || 499,
        domain: cleanDomain,
        contact: contact || "+91 98765 43210",
        gender: gender || "Not Specified",
        approvalStatus: approvalStatus || "pending",
        createdAt: row.created_at,
      };
    });

    // Calculate Platform Metrics
    const totalInterviews = allSessions.length;
    const completedSessions = allSessions.filter((s) => s.status === "completed");
    const confirmedSessions = allSessions.filter((s) => s.status === "confirmed" || s.status === "upcoming");
    const pendingSessions = allSessions.filter((s) => s.status === "pending");
    const cancelledSessions = allSessions.filter((s) => s.status === "cancelled");

    // Revenue calculations:
    const completedRevenue = completedSessions.reduce((acc, s) => acc + (Number(s.price) || 499), 0);
    const confirmedRevenue = confirmedSessions.reduce((acc, s) => acc + (Number(s.price) || 499), 0);
    const pipelineRevenue = pendingSessions.reduce((acc, s) => acc + (Number(s.price) || 499), 0);
    const totalRevenue = completedRevenue + confirmedRevenue;

    const approvedInterviewersCount = interviewers.filter((i) => i.approvalStatus === "approved").length;
    const pendingInterviewersCount = interviewers.filter((i) => i.approvalStatus === "pending").length;

    // Attach interview counts to candidates
    const candidatesWithCounts = rawCandidates.map((c) => {
      const candSessions = allSessions.filter((s) => s.candidate_email === c.email || s.candidate_id === c.id);
      return {
        id: c.id,
        email: c.email,
        fullName: c.full_name || c.email.split("@")[0],
        role: "candidate",
        headline: c.headline || "Software Engineering Candidate",
        totalBookings: candSessions.length,
        completedInterviews: candSessions.filter((s) => s.status === "completed").length,
        createdAt: c.created_at,
        status: "Active (Verified)", // Candidates do not need approval
      };
    });

    return NextResponse.json({
      metrics: {
        totalRevenue,
        completedRevenue,
        confirmedRevenue,
        pipelineRevenue,
        totalInterviews,
        completedCount: completedSessions.length,
        confirmedCount: confirmedSessions.length,
        pendingCount: pendingSessions.length,
        cancelledCount: cancelledSessions.length,
        totalCandidates: candidatesWithCounts.length,
        totalInterviewers: interviewers.length,
        approvedInterviewersCount,
        pendingInterviewersCount,
      },
      interviewers,
      candidates: candidatesWithCounts,
      sessions: allSessions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
