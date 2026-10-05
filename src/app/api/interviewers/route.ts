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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true"; // Admin view requests all interviewers
    const requestedDomain = searchParams.get("domain")?.trim(); // Candidate domain filter

    const supabase = getClient();
    const { data: dbProfiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "interviewer")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase interviewers query note:", error.message);
    }

    const dbInterviewers = (dbProfiles || []).map((row: any) => {
      const {
        approvalStatus,
        company,
        experienceYears,
        skills,
        hourlyRate,
        contact,
        gender,
        domain,
      } = parseProfileBio(row.bio);

      const effectiveStatus = approvalStatus || "pending";
      const primaryDomain = domain || (skills && skills[0]) || "Full Stack Software Engineering";
      const domainList = Array.from(new Set([primaryDomain, ...(skills || [])]));

      return {
        id: row.id,
        fullName: row.full_name || row.email.split("@")[0],
        email: row.email,
        headline: row.headline || `${primaryDomain} Professional Interviewer`,
        company: company || row.company || "Technology Professional",
        experienceYears: experienceYears || row.experience_years || 4,
        rating: 4.9,
        reviewsCount: 15,
        hourlyRate: hourlyRate || row.hourly_rate || 499,
        domain: primaryDomain,
        domains: domainList,
        contact: contact || "+91 98765 43210",
        gender: gender || "Not Specified",
        avatarUrl: row.avatar_url,
        approvalStatus: effectiveStatus,
        createdAt: row.created_at,
      };
    });

    let allInterviewers = dbInterviewers;

    if (!showAll) {
      // Candidates ONLY see approved interviewers
      allInterviewers = allInterviewers.filter((i) => i.approvalStatus === "approved");

      // If a specific domain was selected by the candidate, filter by domain
      if (requestedDomain) {
        const queryClean = requestedDomain.toLowerCase();
        const domainMatches = allInterviewers.filter(
          (i) =>
            i.domain.toLowerCase().includes(queryClean) ||
            i.domains.some((d) => d.toLowerCase().includes(queryClean)) ||
            (i.headline && i.headline.toLowerCase().includes(queryClean))
        );
        allInterviewers = domainMatches;
      }
    }

    return NextResponse.json({ interviewers: allInterviewers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
