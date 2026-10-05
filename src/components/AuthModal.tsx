"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, User, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  initialRole?: "candidate" | "interviewer";
  onSuccess?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  initialRole = "candidate",
  onSuccess,
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [role, setRole] = useState<"candidate" | "interviewer">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Additional Interviewer Registration fields
  const [company, setCompany] = useState("");
  const [experienceYears, setExperienceYears] = useState("4");
  const [contact, setContact] = useState("");
  const [gender, setGender] = useState("Male");
  const [domain, setDomain] = useState("Full Stack Software Engineering");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setMessage(null);
      setPassword("");
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const completeAuthAndRedirect = (userData: { id?: string; email: string; fullName: string; role: "candidate" | "interviewer" }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hirest_user", JSON.stringify(userData));
      window.dispatchEvent(new Event("hirest_user_updated"));
    }
    if (onSuccess) onSuccess(userData);
    onClose();

    // Redirect to respective dashboard
    if (userData.role === "interviewer") {
      router.push("/dashboard/interviewer");
    } else {
      router.push("/dashboard/candidate");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Basic client validations
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      setLoading(false);
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setMessage({ type: "error", text: "Please enter your full name." });
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? {
              email: email.trim(),
              password,
              fullName: fullName.trim(),
              role,
              company: company.trim(),
              experienceYears,
              contact: contact.trim(),
              gender,
              domain,
            }
          : { email: email.trim(), password, role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || (mode === "signup" ? "Failed to create account." : "Failed to sign in."),
        });
        setLoading(false);
        return;
      }

      // Success
      const authenticatedUser = data.user;
      setMessage({
        type: "success",
        text: mode === "signup"
          ? `Welcome to Hirest, ${authenticatedUser.fullName}! Account created. Redirecting...`
          : `Welcome back, ${authenticatedUser.fullName}! Signing you in...`,
      });

      setTimeout(() => {
        completeAuthAndRedirect(authenticatedUser);
      }, 600);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Network error. Please check your connection and try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-8 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-baseline">
              <span className="text-2xl font-extrabold text-blue-600">Hi</span>
              <span className="text-2xl font-extrabold text-slate-900">rest</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5"></span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Secure Auth
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            {mode === "signup" ? "Create your Hirest account" : "Sign in to Hirest"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "signup"
              ? "Join India's premier online mock interview platform."
              : "Enter your credentials to access your live dashboard."}
          </p>

          {/* Mode Switch Tabs (Login / Sign Up) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "login" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "signup" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4 overflow-y-auto flex-1 pr-6">
          
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between ${
                  role === "candidate"
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Candidate</span>
                {role === "candidate" && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
              <button
                type="button"
                onClick={() => setRole("interviewer")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between ${
                  role === "interviewer"
                    ? "border-teal-600 bg-teal-50/50 text-teal-700 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Interviewer</span>
                {role === "interviewer" && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Full Name (Sign Up only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              {mode === "signup" && (
                <span className="text-[10px] text-slate-500">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Detailed Interviewer Registration Fields (Sign Up only) */}
          {mode === "signup" && role === "interviewer" && (
            <div className="space-y-3.5 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                  Interviewer Profile Details
                </span>
                <span className="text-[11px] text-slate-400">• Verified by Admin</span>
              </div>

              {/* Primary Interview Domain */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Domain / Expertise
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-600"
                >
                  <option value="Full Stack Software Engineering">Full Stack Software Engineering</option>
                  <option value="Frontend (React / Next.js / Web)">Frontend (React / Next.js / Web)</option>
                  <option value="Backend (Node / Python / Java)">Backend (Node / Python / Java)</option>
                  <option value="DSA & Problem Solving">DSA &amp; Problem Solving</option>
                  <option value="System Design & Scalability">System Design &amp; Scalability</option>
                  <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                  <option value="Product Management & Behavioral">Product Management &amp; Behavioral</option>
                </select>
              </div>

              {/* Company & Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current / Past Company
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Microsoft, TCS"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Years of Experience
                  </label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="2">2+ Years</option>
                    <option value="4">4+ Years</option>
                    <option value="6">6+ Years</option>
                    <option value="8">8+ Years</option>
                    <option value="10">10+ Years (Lead / Staff)</option>
                  </select>
                </div>
              </div>

              {/* Contact / Phone & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact / Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                ℹ️ Note: Interviewer accounts are reviewed and confirmed by the Administrator before being activated in the candidate directory.
              </div>
            </div>
          )}

          {/* Error / Success Feedback Banner */}
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-fade-in ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              )}
              <span className="leading-snug">{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>
                  {mode === "signup"
                    ? `Create ${role === "candidate" ? "Candidate" : "Interviewer"} Account`
                    : `Sign In to ${role === "candidate" ? "Candidate" : "Interviewer"} Dashboard`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Passwords are cryptographically salted &amp; hashed.</span>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};
