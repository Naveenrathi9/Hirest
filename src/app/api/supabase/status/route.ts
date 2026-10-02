import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({
      configured: false,
      message: "Supabase credentials missing in .env.local",
    });
  }

  // Use service role if provided, otherwise anon key
  const client = createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });

  try {
    const { data: sessions, error: sessErr, count } = await client
      .from("interview_sessions")
      .select("id, domain, status", { count: "exact" });

    return NextResponse.json({
      configured: true,
      url: supabaseUrl,
      hasServiceRole: !!serviceRoleKey,
      sessionsCount: count ?? sessions?.length ?? 0,
      sessionsError: sessErr ? sessErr.message : null,
      status: sessErr ? "rls_notice" : "connected",
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: true,
      error: err.message,
    });
  }
}
