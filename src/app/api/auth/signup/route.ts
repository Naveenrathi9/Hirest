import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword, createSessionToken, serializeProfileBio } from "@/lib/auth";

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, role = "candidate" } = body;

    // 1. Validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (fullName || cleanEmail.split("@")[0] || "User").trim();
    const validRole = role === "interviewer" ? "interviewer" : "candidate";

    const supabase = getClient();

    // 2. Check if user already exists in Supabase
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 400 }
      );
    }

    // 3. Hash password securely
    const authData = hashPassword(password);
    const userId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "user-" + Date.now();

    const serializedBio = serializeProfileBio("India", authData);

    // 4. Insert into Supabase profiles
    const newProfile = {
      id: userId,
      email: cleanEmail,
      full_name: cleanName,
      role: validRole,
      headline:
        validRole === "candidate"
          ? "Software Engineering Candidate"
          : "Verified Industry Professional Interviewer",
      bio: serializedBio,
      hourly_rate: 499,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert(newProfile)
      .select()
      .single();

    if (insertError) {
      console.error("Supabase profile insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create account in database. " + insertError.message },
        { status: 500 }
      );
    }

    const savedUser = inserted || newProfile;

    // 5. Generate secure session token
    const userSession = {
      id: savedUser.id,
      email: savedUser.email,
      fullName: savedUser.full_name,
      role: validRole as "candidate" | "interviewer",
    };

    const token = createSessionToken(userSession);

    // 6. Set secure HTTP cookie
    const response = NextResponse.json({
      success: true,
      user: userSession,
      message: `Account created successfully. Welcome, ${savedUser.full_name}!`,
    });

    response.cookies.set({
      name: "hirest_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
