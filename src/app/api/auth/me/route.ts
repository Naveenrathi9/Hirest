import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { verifySessionToken, parseProfileBio } from "@/lib/auth";

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token =
      cookieStore.get("hirest_admin_session")?.value ||
      cookieStore.get("hirest_session")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Refresh from Supabase to get latest profile updates
    const supabase = getClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", payload.email)
      .maybeSingle();

    const dbProfile = profile as any;
    const parsed = parseProfileBio(dbProfile?.bio);

    const effectiveRole = (
      dbProfile?.role === "admin" || payload.email === "admin@hirest.com"
        ? "admin"
        : dbProfile?.role || payload.role
    ) as "candidate" | "interviewer" | "admin";

    const effectiveApprovalStatus =
      parsed.approvalStatus ||
      payload.approvalStatus ||
      (effectiveRole === "interviewer" ? "pending" : "approved");

    const effectiveCompany = parsed.company || dbProfile?.company || payload.company;
    const effectiveExperience = parsed.experienceYears || dbProfile?.experience_years || payload.experienceYears;
    const effectiveDomain = parsed.domain || (parsed.skills && parsed.skills[0]) || payload.domain || "Full Stack Software Engineering";
    const effectiveContact = parsed.contact || payload.contact;
    const effectiveGender = parsed.gender || payload.gender;

    const user = {
      id: profile?.id || payload.id,
      email: profile?.email || payload.email,
      fullName: profile?.full_name || payload.fullName,
      role: effectiveRole,
      approvalStatus: effectiveApprovalStatus,
      headline: profile?.headline,
      bio: parsed.bioText,
      company: effectiveCompany,
      experienceYears: effectiveExperience,
      domain: effectiveDomain,
      contact: effectiveContact,
      gender: effectiveGender,
    };

    return NextResponse.json({ authenticated: true, user });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, user: null, error: err.message }, { status: 500 });
  }
}
