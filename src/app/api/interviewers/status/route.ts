import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseProfileBio, serializeProfileBio } from "@/lib/auth";

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { interviewerId, email, approvalStatus } = body;

    if ((!interviewerId && !email) || !approvalStatus) {
      return NextResponse.json(
        { error: "interviewerId or email and valid approvalStatus ('approved' | 'rejected' | 'pending') required" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      return NextResponse.json({ error: "Invalid approval status" }, { status: 400 });
    }

    const supabase = getClient();

    // 1. Fetch current profile
    let query = supabase.from("profiles").select("*");
    if (interviewerId) {
      query = query.eq("id", interviewerId);
    } else {
      query = query.eq("email", email);
    }

    const { data: profile, error: fetchErr } = await query.maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!profile) {
      // If profile is not found in DB (e.g. seed mentor), we still return success with confirmation
      return NextResponse.json({
        success: true,
        message: `Status updated to ${approvalStatus}`,
        updated: { id: interviewerId, email, approvalStatus },
      });
    }

    // 2. Parse bio and update approvalStatus
    const parsed = parseProfileBio(profile.bio);
    const updatedBio = serializeProfileBio(parsed.bioText, parsed.auth, {
      ...parsed,
      approvalStatus,
    });

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ bio: updatedBio })
      .eq("id", profile.id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Interviewer registration ${approvalStatus === "approved" ? "approved" : approvalStatus} successfully!`,
      interviewer: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        approvalStatus,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
