import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

const isValidUUID = (str: any): boolean =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const interviewerEmail = searchParams.get("interviewer_email");
    const candidateEmail = searchParams.get("candidate_email");
    const status = searchParams.get("status");

    const supabase = getClient();
    let query = supabase
      .from("interview_sessions")
      .select("*, interview_feedback(*)")
      .order("created_at", { ascending: false });

    if (interviewerEmail) {
      query = query.eq("interviewer_email", interviewerEmail);
    }
    if (candidateEmail) {
      query = query.eq("candidate_email", candidateEmail);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ sessions: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getClient();

    // 1. Look up candidate_id from profiles if not provided
    let candidateId = isValidUUID(body.candidate_id) ? body.candidate_id : null;
    if (!candidateId && body.candidate_email) {
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", body.candidate_email)
          .maybeSingle();
        if (prof?.id && isValidUUID(prof.id)) candidateId = prof.id;
      } catch {}
    }

    // 2. Look up interviewer_id from profiles if not provided
    let interviewerId = isValidUUID(body.interviewer_id) ? body.interviewer_id : null;
    if (!interviewerId && body.interviewer_email) {
      try {
        const { data: intProf } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", body.interviewer_email)
          .maybeSingle();
        if (intProf?.id && isValidUUID(intProf.id)) interviewerId = intProf.id;
      } catch {}
    }

    const sessionId = isValidUUID(body.id)
      ? body.id
      : crypto.randomUUID();

    const initialStatus = body.status || "pending";
    const scheduledAt = body.scheduled_at || new Date().toISOString();

    const { data, error } = await supabase
      .from("interview_sessions")
      .insert({
        id: sessionId,
        candidate_id: candidateId,
        interviewer_id: interviewerId,
        domain: body.domain || "Full Stack Software Engineering",
        scheduled_at: scheduledAt,
        duration_minutes: body.duration_minutes || 60,
        price: body.price || 499,
        notes: body.notes || "",
        meeting_link: body.meeting_link || `https://hirest.live/room/${sessionId}`,
        status: initialStatus,
        candidate_name: body.candidate_name || "Candidate",
        candidate_email: body.candidate_email || "candidate@example.com",
        interviewer_name: body.interviewer_name || "Interviewer",
        interviewer_email: body.interviewer_email || "interviewer@hirest.com",
        scheduled_date: body.scheduled_date || "Upcoming",
        scheduled_time: body.scheduled_time || "10:00 AM",
      })
      .select();

    if (error) {
      console.warn("Session insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ session: data?.[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Session ID and status required" }, { status: 400 });
    }

    const supabase = getClient();
    const { data, error } = await supabase
      .from("interview_sessions")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, session: data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
