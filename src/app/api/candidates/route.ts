import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const supabase = getClient();

    if (email) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (data) {
        return NextResponse.json({ profile: data });
      }
    }

    const { data: allProfiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    return NextResponse.json({ profiles: allProfiles || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getClient();

    const email = body.email;
    const fullName = body.fullName || body.full_name || email.split("@")[0];
    const role = body.role || "candidate";

    // 1. Try saving to profiles table
    let savedProfile = null;
    try {
      const profileId = body.id || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : undefined);
      const profilePayload: Record<string, any> = {
        email,
        full_name: fullName,
        role,
        headline: body.targetRole || body.headline || "Candidate",
        bio: body.location || body.bio || "",
      };
      if (profileId) profilePayload.id = profileId;

      const { data, error } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "email" })
        .select();

      if (!error && data) {
        savedProfile = data[0];
      } else if (error) {
        console.warn("Profiles upsert note:", error.message);
      }
    } catch (e: any) {
      console.warn("Profiles save exception:", e.message);
    }

    // 2. Try saving to candidates table if exists
    try {
      await supabase.from("candidates").upsert(
        {
          email,
          full_name: fullName,
          role,
          phone: body.phone,
          location: body.location,
          target_role: body.targetRole,
        },
        { onConflict: "email" }
      );
    } catch {
      // optional fallback
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          email,
          fullName,
          role,
          phone: body.phone,
          location: body.location,
          targetRole: body.targetRole,
        },
        profile: savedProfile,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
