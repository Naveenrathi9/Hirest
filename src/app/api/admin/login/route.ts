import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSessionToken, verifyPassword, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter both administrator email and password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getClient();

    // 1. Fetch administrator record directly from PostgreSQL database
    let { data: adminProfile, error: queryError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .eq("role", "admin")
      .maybeSingle();

    if (queryError) {
      console.warn("Admin query note:", queryError.message);
    }

    // 2. Auto-seed administrator into database if not yet present for admin@hirest.com
    if (!adminProfile && cleanEmail === "admin@hirest.com") {
      const initialAuth = hashPassword("admin123");
      const bioPayload = JSON.stringify({
        bioText: "Master Platform Administrator",
        auth: initialAuth,
        approvalStatus: "approved",
        role: "admin",
        updatedAt: new Date().toISOString(),
      });

      const { data: createdAdmin, error: insertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: "a0000000-0000-4000-8000-000000000001",
            email: "admin@hirest.com",
            full_name: "Hirest Master Administrator",
            role: "admin",
            headline: "Platform Master Administrator",
            bio: bioPayload,
          },
          { onConflict: "email" }
        )
        .select()
        .single();

      if (!insertError && createdAdmin) {
        adminProfile = createdAdmin;
      }
    }

    if (!adminProfile) {
      return NextResponse.json(
        { error: "Administrator account not found in database. Access denied." },
        { status: 401 }
      );
    }

    // 3. Verify password against database credentials
    let passwordMatched = false;
    try {
      const bioObj = JSON.parse(adminProfile.bio || "{}");
      if (bioObj?.auth?.hash && bioObj?.auth?.salt) {
        passwordMatched = verifyPassword(password, bioObj.auth);
      } else {
        // Fallback for default password if auth object wasn't serialized
        passwordMatched = password === "admin123";
      }
    } catch {
      passwordMatched = password === "admin123";
    }

    if (!passwordMatched) {
      return NextResponse.json(
        { error: "Invalid password for administrator account. Please check your credentials." },
        { status: 401 }
      );
    }

    const adminUser = {
      id: adminProfile.id,
      email: adminProfile.email,
      fullName: adminProfile.full_name || "Hirest Master Admin",
      role: "admin" as const,
      approvalStatus: "approved" as const,
    };

    const token = createSessionToken(adminUser);

    const response = NextResponse.json({
      success: true,
      admin: adminUser,
      message: "Admin authentication verified against database. Access granted.",
    });

    // Set secure admin session cookie
    response.cookies.set({
      name: "hirest_admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    response.cookies.set({
      name: "hirest_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
