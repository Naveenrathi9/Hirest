import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getClient();

    // 1. Mark session as completed
    await supabase
      .from("interview_sessions")
      .update({ status: "completed" })
      .eq("id", body.sessionId);

    // 2. Upsert feedback
    const { data, error } = await supabase
      .from("interview_feedback")
      .upsert(
        {
          session_id: body.sessionId,
          technical_rating: body.technicalRating,
          communication_rating: body.communicationRating,
          problem_solving_rating: body.problemSolvingRating,
          strengths: body.strengths,
          areas_for_improvement: body.areasForImprovement,
          detailed_notes: body.detailedNotes,
          verdict: body.verdict,
        },
        { onConflict: "session_id" }
      )
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ feedback: data?.[0] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
