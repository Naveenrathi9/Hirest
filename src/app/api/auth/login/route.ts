import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifyPassword,
  hashPassword,
  createSessionToken,
  parseProfileBio,
  serializeProfileBio,
} from "@/lib/auth";

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    // 1. Validate inputs
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Please enter your password." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getClient();

    // 2. Fetch user profile from Supabase
    const { data: userProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchError) {
      console.error("Supabase user fetch error:", fetchError);
      return NextResponse.json({ error: "Database error while verifying account." }, { status: 500 });
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: "No account found with this email. Please check your spelling or sign up." },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const { bioText, auth } = parseProfileBio(userProfile.bio);

    if (auth) {
      // User has stored password hash - enforce cryptographic verification!
      const isValid = verifyPassword(password, auth);
      if (!isValid) {
        return NextResponse.json(
          { error: "Incorrect password. Please verify your credentials and try again." },
          { status: 401 }
        );
      }
    } else {
      // Legacy account without password hash yet - automatically initialize and secure credentials!
      if (password.length >= 6) {
        const newAuth = hashPassword(password);
        const updatedBio = serializeProfileBio(bioText, newAuth);
        await supabase
          .from("profiles")
          .update({ bio: updatedBio })
          .eq("id", userProfile.id);
      }
    }

    // Determine target role (prefer profile role, or requested role if matched)
    const effectiveRole = (userProfile.role || role || "candidate") as "candidate" | "interviewer";

    // 4. Generate secure session token
    const userSession = {
      id: userProfile.id,
      email: userProfile.email,
      fullName: userProfile.full_name || cleanEmail.split("@")[0],
      role: effectiveRole,
    };

    const token = createSessionToken(userSession);

    // 5. Set secure HTTP session cookie
    const response = NextResponse.json({
      success: true,
      user: userSession,
      message: `Welcome back, ${userSession.fullName}!`,
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
    console.error("Login API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
