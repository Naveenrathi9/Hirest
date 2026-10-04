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
      .select("id, email, full_name, role, headline, avatar_url, bio")
      .eq("email", payload.email)
      .maybeSingle();

    const { bioText } = parseProfileBio(profile?.bio);

    const user = {
      id: profile?.id || payload.id,
      email: profile?.email || payload.email,
      fullName: profile?.full_name || payload.fullName,
      role: (profile?.role || payload.role) as "candidate" | "interviewer",
      headline: profile?.headline,
      bio: bioText,
    };

    return NextResponse.json({ authenticated: true, user });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, user: null, error: err.message }, { status: 500 });
  }
}
