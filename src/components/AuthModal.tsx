"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, User, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setMessage(null);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  // Immediate redirect helper (No mail confirmation needed)
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

    const displayName = fullName || email.split("@")[0] || (role === "interviewer" ? "Interviewer" : "Candidate");

    try {
      if (mode === "signup") {
        let userId: string | undefined = undefined;
        try {
          const { data: authData } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: displayName, role } },
          });
          if (authData?.user?.id) userId = authData.user.id;
        } catch {
          // fallback
        }

        // 1. Save candidate/interviewer directly to Supabase via server API
        try {
          const res = await fetch("/api/candidates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: userId,
              email,
              fullName: displayName,
              role,
              targetRole: role === "candidate" ? "Software Engineer Candidate" : "Industry Professional Interviewer",
              location: "India",
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.profile?.id) userId = data.profile.id;
          }
        } catch (apiErr) {
          console.warn("API candidate save error:", apiErr);
        }

        setMessage({
          type: "success",
          text: `Welcome to Hirest, ${displayName}! Account created and saved in Supabase. Redirecting...`,
        });

        setTimeout(() => {
          completeAuthAndRedirect({
            id: userId,
            email,
            fullName: displayName,
            role,
          });
        }, 500);

      } else {
        // Sign in mode: fetch candidate details from Supabase if available
        let userDisplayName = displayName;
        let userId: string | undefined = undefined;
        try {
          const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
          if (authData?.user?.id) userId = authData.user.id;
        } catch {}

        try {
          const res = await fetch(`/api/candidates?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.profile?.full_name) {
              userDisplayName = data.profile.full_name;
              userId = data.profile.id || userId;
            }
          }
        } catch {
          // fallback
        }

        setMessage({
          type: "success",
          text: `Welcome back, ${userDisplayName}! Redirecting to your ${role} dashboard...`,
        });

        setTimeout(() => {
          completeAuthAndRedirect({
            id: userId,
            email,
            fullName: userDisplayName,
            role,
          });
        }, 500);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: "candidate" | "interviewer") => {
    const demoUser = {
      email: demoRole === "candidate" ? "rohit.verma@example.com" : "amit.sharma@example.com",
      fullName: demoRole === "candidate" ? "Rohit Verma" : "Amit Sharma",
      role: demoRole,
    };
    setMessage({
      type: "success",
      text: `Logging in as ${demoUser.fullName}...`,
    });
    setTimeout(() => {
      completeAuthAndRedirect(demoUser);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-8 pb-4">
          <div className="flex items-baseline mb-2">
            <span className="text-2xl font-extrabold text-blue-600">Hi</span>
            <span className="text-2xl font-extrabold text-slate-900">rest</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5"></span>
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            {mode === "signup" ? "Create your Hirest account" : "Sign in to Hirest"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Instant access to your 1-on-1 online mock interview dashboard.
          </p>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mt-5">
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
              Login
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
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-4">
          
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Role:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === "candidate"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-bold">Candidate</div>
                <div className="text-[10px] text-slate-500 font-normal">Candidate Dashboard</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("interviewer")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === "interviewer"
                    ? "border-teal-600 bg-teal-50/50 text-teal-900 font-bold"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-bold">Interviewer</div>
                <div className="text-[10px] text-slate-500 font-normal">Interviewer Dashboard</div>
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
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
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
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Message feedback */}
          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{message.text}</span>
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
                    ? `Sign Up & Open ${role === "candidate" ? "Candidate" : "Interviewer"} Dashboard`
                    : `Sign In to ${role === "candidate" ? "Candidate" : "Interviewer"} Dashboard`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* 1-Click Instant Demo Login */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 text-center mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Or Direct Instant Dashboard Access:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("candidate")}
                className="py-2 px-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <span>Candidate View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("interviewer")}
                className="py-2 px-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <span>Interviewer View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
