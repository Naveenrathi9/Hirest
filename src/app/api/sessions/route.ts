import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*, interview_feedback(*)")
      .order("created_at", { ascending: false });

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
    let candidateId = body.candidate_id || null;
    if (!candidateId && body.candidate_email) {
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", body.candidate_email)
          .maybeSingle();
        if (prof?.id) candidateId = prof.id;
      } catch {}
    }

    const { data, error } = await supabase
      .from("interview_sessions")
      .insert({
        id: body.id,
        candidate_id: candidateId,
        domain: body.domain,
        scheduled_at: body.scheduled_at || new Date().toISOString(),
        duration_minutes: body.duration_minutes || 60,
        price: body.price || 499,
        notes: body.notes,
        meeting_link: body.meeting_link || `https://hirest.live/room/${body.id || "live"}`,
        status: body.status === "completed" ? "completed" : "confirmed",
        candidate_name: body.candidate_name,
        candidate_email: body.candidate_email,
        interviewer_name: body.interviewer_name || "Amit Sharma",
        interviewer_email: body.interviewer_email || "amit.sharma@example.com",
        scheduled_date: body.scheduled_date,
        scheduled_time: body.scheduled_time,
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ session: data?.[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
