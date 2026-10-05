"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  CircleDollarSign,
  Users,
  UserCheck,
  CalendarCheck,
  Video,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Sparkles,
  Award,
  AlertTriangle,
  Briefcase,
  Mail,
  Check,
  X,
  LogOut,
  Phone,
  Lock,
  Key,
  LayoutDashboard,
} from "lucide-react";

interface AdminInterviewer {
  id: string;
  fullName: string;
  email: string;
  headline?: string;
  company?: string;
  experienceYears?: number;
  hourlyRate?: number;
  domain?: string;
  contact?: string;
  gender?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt?: string;
}

interface AdminCandidate {
  id: string;
  email: string;
  fullName: string;
  headline?: string;
  totalBookings: number;
  completedInterviews: number;
  createdAt?: string;
  status: string;
}

interface AdminSession {
  id: string;
  candidate_name?: string;
  candidate_email?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  domain?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "upcoming";
  price: number;
  notes?: string;
  meeting_link?: string;
  created_at?: string;
}

interface AdminMetrics {
  totalRevenue: number;
  completedRevenue: number;
  confirmedRevenue: number;
  pipelineRevenue: number;
  totalInterviews: number;
  completedCount: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  totalCandidates: number;
  totalInterviewers: number;
  approvedInterviewersCount: number;
  pendingInterviewersCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"interviewers" | "candidates" | "interviews" | "revenue">("interviewers");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Admin Auth Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string>("admin@hirest.com");
  const [adminPassword, setAdminPassword] = useState<string>("admin123");
  const [adminLoginError, setAdminLoginError] = useState<string>("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState<boolean>(false);

  // Stats & Data
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalRevenue: 0,
    completedRevenue: 0,
    confirmedRevenue: 0,
    pipelineRevenue: 0,
    totalInterviews: 0,
    completedCount: 0,
    confirmedCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
    totalCandidates: 0,
    totalInterviewers: 0,
    approvedInterviewersCount: 0,
    pendingInterviewersCount: 0,
  });

  const [interviewers, setInterviewers] = useState<AdminInterviewer[]>([]);
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);

  // Filters & Search
  const [interviewerStatusFilter, setInterviewerStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAdminData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (data.interviewers) setInterviewers(data.interviewers);
        if (data.candidates) setCandidates(data.candidates);
        if (data.sessions) setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkAdminAuth = async () => {
    try {
      setCheckingAuth(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.authenticated && data?.user?.role === "admin") {
          setIsAdminAuthenticated(true);
          await loadAdminData();
          return;
        }
      }
      const saved = typeof window !== "undefined" ? localStorage.getItem("hirest_admin_auth") : null;
      if (saved === "true") {
        setIsAdminAuthenticated(true);
        await loadAdminData();
        return;
      }
      setIsAdminAuthenticated(false);
    } catch {
      setIsAdminAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLogin(true);
    setAdminLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminLoginError(data.error || "Invalid administrator credentials.");
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("hirest_admin_auth", "true");
      }
      setIsAdminAuthenticated(true);
      showToast("Administrator verified via database. Access granted.");
      await loadAdminData();
    } catch {
      setAdminLoginError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("hirest_admin_auth");
    }
    setIsAdminAuthenticated(false);
    showToast("Administrator session logged out.");
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 3500);
  };

  // One-click Interviewer Approval / Rejection
  const handleUpdateInterviewerStatus = async (
    interviewer: AdminInterviewer,
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    // Optimistic UI update
    setInterviewers((prev) =>
      prev.map((i) => (i.id === interviewer.id ? { ...i, approvalStatus: newStatus } : i))
    );

    // Update metrics
    setMetrics((prev) => {
      const isNowApproved = newStatus === "approved";
      const wasPending = interviewer.approvalStatus === "pending";
      return {
        ...prev,
        approvedInterviewersCount: isNowApproved
          ? prev.approvedInterviewersCount + 1
          : Math.max(0, prev.approvedInterviewersCount - (interviewer.approvalStatus === "approved" ? 1 : 0)),
        pendingInterviewersCount: wasPending
          ? Math.max(0, prev.pendingInterviewersCount - 1)
          : prev.pendingInterviewersCount,
      };
    });

    try {
      const res = await fetch("/api/interviewers/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewerId: interviewer.id,
          email: interviewer.email,
          approvalStatus: newStatus,
        }),
      });

      if (res.ok) {
        showToast(
          `Interviewer "${interviewer.fullName}" ${
            newStatus === "approved" ? "successfully approved! They can now conduct mock interviews." : "status updated to " + newStatus
          }`
        );
        loadAdminData();
      } else {
        showToast("Failed to update status on server.", "error");
      }
    } catch {
      showToast("Network error while updating interviewer.", "error");
    }
  };

  // Update session status (e.g. manually confirm or complete)
  const handleUpdateSessionStatus = async (sessionId: string, newStatus: AdminSession["status"]) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s)));
    try {
      await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, status: newStatus }),
      });
      showToast(`Session status updated to "${newStatus}".`);
      loadAdminData();
    } catch {}
  };

  // Filtered lists
  const filteredInterviewers = interviewers.filter((int) => {
    const matchesFilter =
      interviewerStatusFilter === "all" || int.approvalStatus === interviewerStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      int.fullName.toLowerCase().includes(q) ||
      int.email.toLowerCase().includes(q) ||
      (int.company && int.company.toLowerCase().includes(q)) ||
      (int.domain && int.domain.toLowerCase().includes(q)) ||
      (int.contact && int.contact.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.headline && c.headline.toLowerCase().includes(q))
    );
  });

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = sessionStatusFilter === "all" || s.status === sessionStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (s.candidate_name && s.candidate_name.toLowerCase().includes(q)) ||
      (s.candidate_email && s.candidate_email.toLowerCase().includes(q)) ||
      (s.interviewer_name && s.interviewer_name.toLowerCase().includes(q)) ||
      (s.domain && s.domain.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">
            Verifying Administrator Access...
          </span>
        </div>
      </div>
    );
  }

  // 1. Admin Login View (Unified Theme matching candidate dashboard & login modal)
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Soft blue glowing backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="text-2xl font-black text-blue-600">Hi</span>
              <span className="text-2xl font-black text-slate-900">rest</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full ml-1">
                Admin Portal
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Administrator Login
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Sign in with database administrator credentials to manage interviewer registrations, candidate interviews, and platform financials.
            </p>
          </div>

          {/* Error Notice */}
          {adminLoginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{adminLoginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@hirest.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Quick Credentials Info Box */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
              <span>Database Credentials:</span>
              <span className="font-mono text-blue-700 font-bold">admin@hirest.com / admin123</span>
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingLogin ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying with Database...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Authenticate as Administrator</span>
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <span>← Return to Hirest Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Admin Dashboard (Unified Theme matching candidate dashboard layout)
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar (Identical structure to candidate/interviewer dashboard) */}
      <aside className="w-full md:w-64 bg-[#0a1628] text-white flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
          <Link href="/" className="flex items-baseline">
            <span className="text-2xl font-extrabold text-blue-500">Hi</span>
            <span className="text-2xl font-extrabold text-white">rest</span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-0.5"></span>
          </Link>
          <span className="ml-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-rose-400" />
            Admin
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab("interviewers")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "interviewers"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4" />
              <span>Interviewers</span>
            </div>
            {metrics.pendingInterviewersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {metrics.pendingInterviewersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("candidates")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "candidates"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Candidates</span>
            </div>
            <span className="text-xs text-slate-400">({candidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("interviews")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "interviews"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <Video className="w-4 h-4" />
              <span>Sessions &amp; Bookings</span>
            </div>
            <span className="text-xs text-slate-400">({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("revenue")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "revenue"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <CircleDollarSign className="w-4 h-4" />
            <span>Financial Analytics</span>
          </button>
        </nav>

        {/* Bottom Profile card */}
        <div className="p-4 border-t border-slate-800/80 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div>
                <div className="text-xs font-bold text-white">Administrator</div>
                <div className="text-[11px] text-slate-400">admin@hirest.com</div>
              </div>
            </div>
            <button
              onClick={handleAdminLogout}
              title="Log out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 hidden sm:block">
              Administrator Platform Oversight
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Live Database Connected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Website</span>
            </Link>

            <Link
              href="/dashboard/interviewer"
              className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors hidden md:block"
            >
              Interviewer View
            </Link>

            <Link
              href="/dashboard/candidate"
              className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors hidden md:block"
            >
              Candidate View
            </Link>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Toast Notification */}
        {actionMessage && (
          <div
            className={`fixed top-24 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-fade-in border ${
              actionMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-rose-50 text-rose-900 border-rose-300"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Main Body */}
        <main className="p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header Title */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Master Platform Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Full visibility and verification control over all candidate mock interviews, interviewer approvals, and platform financials.
                </p>
              </div>

              {metrics.pendingInterviewersCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs animate-pulse">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{metrics.pendingInterviewersCount} Interviewer Registrations Awaiting Approval</span>
                </div>
              )}
            </div>
          </div>

          {/* KPI Summary Cards (Identical style to candidate dashboard metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Revenue */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Total Revenue
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                ₹{metrics.totalRevenue.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Completed: <strong className="text-emerald-600">₹{metrics.completedRevenue}</strong></span>
                <span>Pipeline: <strong className="text-amber-600">₹{metrics.pipelineRevenue}</strong></span>
              </div>
            </div>

            {/* Total Interviews */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  Total Interviews
                </span>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {metrics.totalInterviews}
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Confirmed: <strong className="text-teal-700">{metrics.confirmedCount}</strong></span>
                <span>Pending: <strong className="text-amber-600">{metrics.pendingCount}</strong></span>
                <span>Completed: <strong className="text-emerald-600">{metrics.completedCount}</strong></span>
              </div>
            </div>

            {/* Total Candidates (100% active) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Candidates Directory
                </span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {metrics.totalCandidates}
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700 font-bold">100% Active</span>
                <span>• Auto-Approved</span>
              </div>
            </div>

            {/* Interviewers Verification */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Interviewers
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {metrics.totalInterviewers}
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Approved: <strong className="text-emerald-600">{metrics.approvedInterviewersCount}</strong></span>
                <span className="text-amber-700 font-bold">{metrics.pendingInterviewersCount} Awaiting Admin</span>
              </div>
            </div>
          </div>

          {/* Tab Selection & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("interviewers")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "interviewers"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Interviewers Verification</span>
                {metrics.pendingInterviewersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                    {metrics.pendingInterviewersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("candidates")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "candidates"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Candidates ({candidates.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("interviews")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "interviews"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Sessions &amp; Bookings ({sessions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("revenue")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "revenue"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <CircleDollarSign className="w-4 h-4" />
                <span>Financial Analytics</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* TAB 1: INTERVIEWERS VERIFICATION */}
          {activeTab === "interviewers" && (
            <div className="space-y-6 animate-fade-in">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold mr-1">Status Filter:</span>
                  {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setInterviewerStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        interviewerStatusFilter === st
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {st === "all" ? "All Interviewers" : st}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-500">
                  Showing <strong>{filteredInterviewers.length}</strong> real registered interviewer(s)
                </div>
              </div>

              {/* Policy Notice */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  <strong>Admin Approval Rule:</strong> All interviewer registrations require confirmation by the Administrator before appearing in candidate booking. Candidate registrations do not require approval and are activated automatically.
                </span>
              </div>

              {/* Interviewers Table */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-4 px-6">Interviewer</th>
                        <th className="py-4 px-6">Domain / Track</th>
                        <th className="py-4 px-6">Company &amp; Experience</th>
                        <th className="py-4 px-6">Contact &amp; Gender</th>
                        <th className="py-4 px-6">Approval Status</th>
                        <th className="py-4 px-6 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInterviewers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No interviewers found matching the selected filter or search query.
                          </td>
                        </tr>
                      ) : (
                        filteredInterviewers.map((int) => (
                          <tr key={int.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                                  {int.fullName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{int.fullName}</div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{int.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                {int.domain || "Full Stack Software Engineering"}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-semibold text-slate-900">{int.company || "Tech Professional"}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{int.experienceYears || 4}+ Years Exp</span>
                                <span>•</span>
                                <span className="text-blue-700 font-bold">₹{int.hourlyRate || 499} / session</span>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="text-[11px] text-slate-700 flex items-center gap-1.5 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{int.contact || "+91 98765 43210"}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Gender: <span className="text-slate-800 font-medium">{int.gender || "Not specified"}</span>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              {int.approvalStatus === "approved" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Approved &amp; Live
                                </span>
                              ) : int.approvalStatus === "pending" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Pending Confirmation
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  Rejected
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {int.approvalStatus !== "approved" && (
                                  <button
                                    onClick={() => handleUpdateInterviewerStatus(int, "approved")}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                    title="Confirm interviewer registration and list in candidate booking directory"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                )}

                                {int.approvalStatus !== "rejected" && (
                                  <button
                                    onClick={() => handleUpdateInterviewerStatus(int, "rejected")}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                    title="Reject or suspend interviewer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATES DIRECTORY */}
          {activeTab === "candidates" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">All Registered Candidates</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Candidates are auto-approved upon registration and have immediate access to mock interview booking.
                  </p>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Total: <strong>{filteredCandidates.length}</strong> candidates in database
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-4 px-6">Candidate</th>
                        <th className="py-4 px-6">Target Role</th>
                        <th className="py-4 px-6">Sessions Booked</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCandidates.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400">
                            No candidates found matching the query.
                          </td>
                        </tr>
                      ) : (
                        filteredCandidates.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                                  {c.fullName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{c.fullName}</div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{c.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <span className="font-medium text-slate-800">
                                {c.headline || "Software Engineering Candidate"}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">
                                {c.totalBookings} Total Bookings
                              </div>
                              <div className="text-[11px] text-emerald-700 font-semibold">
                                {c.completedInterviews} completed
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Active (Auto-Approved)
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALL SESSIONS & BOOKINGS */}
          {activeTab === "interviews" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold mr-1">Status:</span>
                  {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSessionStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        sessionStatusFilter === st
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Total: <strong>{filteredSessions.length}</strong> sessions
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-4 px-6">Candidate</th>
                        <th className="py-4 px-6">Assigned Interviewer</th>
                        <th className="py-4 px-6">Domain / Focus</th>
                        <th className="py-4 px-6">Scheduled Slot</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSessions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No interview sessions found.
                          </td>
                        </tr>
                      ) : (
                        filteredSessions.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">{s.candidate_name || "Candidate"}</div>
                              <div className="text-[11px] text-slate-500">{s.candidate_email}</div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">
                                {s.interviewer_name || "Assigned Mentor"}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {s.interviewer_email || "mentor@example.com"}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-semibold text-slate-900">{s.domain}</div>
                              {s.notes && (
                                <div className="text-[11px] text-slate-500 truncate max-w-xs">{s.notes}</div>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-semibold text-slate-900">{s.scheduled_date || "Upcoming"}</div>
                              <div className="text-[11px] text-slate-500">{s.scheduled_time || "10:00 AM"}</div>
                            </td>

                            <td className="py-4 px-6">
                              <span className="font-extrabold text-blue-700">₹{s.price || 499}</span>
                            </td>

                            <td className="py-4 px-6">
                              {s.status === "completed" ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Completed
                                </span>
                              ) : s.status === "confirmed" || s.status === "upcoming" ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  Confirmed
                                </span>
                              ) : s.status === "pending" ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Pending Request
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                  {s.status}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {s.status === "pending" && (
                                  <button
                                    onClick={() => handleUpdateSessionStatus(s.id, "confirmed")}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                )}
                                {s.status !== "completed" && (
                                  <button
                                    onClick={() => handleUpdateSessionStatus(s.id, "completed")}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 font-bold text-[11px] cursor-pointer"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL ANALYTICS */}
          {activeTab === "revenue" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Financial Performance &amp; Revenue Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time analytics on candidate transactions and mentor session settlements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Gross Total Revenue</div>
                  <div className="text-3xl font-black text-slate-900 mt-2">
                    ₹{metrics.totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    Settled across {metrics.completedCount + metrics.confirmedCount} interviews
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Settled &amp; Completed</div>
                  <div className="text-3xl font-black text-emerald-600 mt-2">
                    ₹{metrics.completedRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    From {metrics.completedCount} completed evaluations
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Upcoming Pipeline Value</div>
                  <div className="text-3xl font-black text-blue-600 mt-2">
                    ₹{metrics.pipelineRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    From {metrics.pendingCount} pending requests
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-4">
                  Recent Session Transactions
                </h4>
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Mock Session: {s.domain}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {s.candidate_name || "Candidate"} with {s.interviewer_name || "Interviewer"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-blue-700">₹{s.price || 499}</span>
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">{s.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
