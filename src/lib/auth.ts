import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "hirest-secure-jwt-token-secret-salt-2026";
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

export interface StoredAuthData {
  salt: string;
  hash: string;
  iterations: number;
  digest: string;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName: string;
  role: "candidate" | "interviewer" | "admin";
  approvalStatus?: "pending" | "approved" | "rejected";
  company?: string;
  experienceYears?: number;
  domain?: string;
  contact?: string;
  gender?: string;
}

export interface SessionTokenPayload extends AuthSessionUser {
  iat: number;
  exp: number;
}

/**
 * Hash a password securely using PBKDF2 with SHA-512 and a random 16-byte salt
 */
export function hashPassword(password: string): StoredAuthData {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt + AUTH_SECRET, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");

  return {
    salt,
    hash,
    iterations: PBKDF2_ITERATIONS,
    digest: PBKDF2_DIGEST,
  };
}

/**
 * Verify a plain password against stored salt and hash in constant time
 */
export function verifyPassword(password: string, authData: StoredAuthData): boolean {
  if (!password || !authData || !authData.salt || !authData.hash) {
    return false;
  }

  const iterations = authData.iterations || PBKDF2_ITERATIONS;
  const digest = authData.digest || PBKDF2_DIGEST;

  const hashToTest = crypto
    .pbkdf2Sync(password, authData.salt + AUTH_SECRET, iterations, PBKDF2_KEYLEN, digest)
    .toString("hex");

  try {
    const a = Buffer.from(hashToTest, "hex");
    const b = Buffer.from(authData.hash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Create a signed, tamper-proof session token (HMAC-SHA256)
 */
export function createSessionToken(user: AuthSessionUser, expiresInSeconds = 7 * 24 * 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    ...user,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const payload: SessionTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Parse metadata / bio safely to retrieve credentials, approval status, and user bio text
 */
export function parseProfileBio(rawBio: string | null | undefined): {
  bioText: string;
  auth: StoredAuthData | null;
  approvalStatus?: "pending" | "approved" | "rejected";
  company?: string;
  experienceYears?: number;
  skills?: string[];
  hourlyRate?: number;
  contact?: string;
  gender?: string;
  domain?: string;
} {
  if (!rawBio) return { bioText: "", auth: null };

  try {
    const parsed = JSON.parse(rawBio);
    if (parsed && typeof parsed === "object") {
      return {
        bioText: typeof parsed.bioText === "string" ? parsed.bioText : "",
        auth: parsed.auth || null,
        approvalStatus: parsed.approvalStatus,
        company: parsed.company,
        experienceYears: parsed.experienceYears,
        skills: Array.isArray(parsed.skills) ? parsed.skills : undefined,
        hourlyRate: typeof parsed.hourlyRate === "number" ? parsed.hourlyRate : undefined,
        contact: parsed.contact,
        gender: parsed.gender,
        domain: parsed.domain,
      };
    }
  } catch {
    // rawBio is a plain text bio
  }

  return { bioText: rawBio, auth: null };
}

/**
 * Serialize metadata / bio including credentials and approval status
 */
export function serializeProfileBio(
  bioText: string,
  auth: StoredAuthData | null,
  extra?: {
    approvalStatus?: "pending" | "approved" | "rejected";
    company?: string;
    experienceYears?: number;
    skills?: string[];
    hourlyRate?: number;
    contact?: string;
    gender?: string;
    domain?: string;
  }
): string {
  if (!auth && !extra) return bioText || "";
  return JSON.stringify({
    bioText: bioText || "",
    auth,
    approvalStatus: extra?.approvalStatus,
    company: extra?.company,
    experienceYears: extra?.experienceYears,
    skills: extra?.skills,
    hourlyRate: extra?.hourlyRate,
    contact: extra?.contact,
    gender: extra?.gender,
    domain: extra?.domain,
    updatedAt: new Date().toISOString(),
  });
}
