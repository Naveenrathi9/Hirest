"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  History,
  User,
  Settings,
  LogOut,
  Search,
  Bell,
  Clock,
  Video,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Star,
  ChevronRight,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  FileText,
  ShieldCheck,
  Sparkles,
  Plus,
  Award,
} from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { getStoredSessions, fetchSessionsFromSupabase, SessionItem } from "@/lib/store";
import { SupabaseSyncBanner } from "@/components/SupabaseSyncBanner";

export default function CandidateDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "interviews" | "history" | "profile" | "settings" | "live"
  >("dashboard");

  // Dynamic sessions from store
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("sess-1");

  // Booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Practice history filter & selected evaluation report modal
  const [historyFilter, setHistoryFilter] = useState<"all" | "completed" | "in-progress">("all");
  const [selectedReport, setSelectedReport] = useState<SessionItem | null>(null);

  // Candidate notes
  const [candidateNote, setCandidateNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  // Live video room states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState(38 * 60 + 20);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const candidateVideoRef = useRef<HTMLVideoElement | null>(null);

  // Candidate Profile State (loaded dynamically from auth session & Supabase)
  const [candidateProfile, setCandidateProfile] = useState<{
    id?: string;
    fullName: string;
    email: string;
    phone: string;
    location: string;
    targetRole: string;
  }>({
    fullName: "Candidate",
    email: "candidate@hirest.com",
    phone: "+91 94765 43210",
    location: "Bengaluru, Karnataka",
    targetRole: "Frontend Engineer / Full Stack (React & Next.js)",
  });
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Settings toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [newOpportunities, setNewOpportunities] = useState(true);

  // Load candidate profile from server session and localStorage
  const loadUserProfile = async () => {
    if (typeof window === "undefined") return;
    try {
      // 1. Try server session verification
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const authData = await res.json();
          if (authData?.authenticated && authData?.user) {
            const u = authData.user;
            setCandidateProfile((prev) => ({
              ...prev,
              id: u.id || prev.id,
              fullName: u.fullName || prev.fullName,
              email: u.email || prev.email,
              targetRole: u.headline || prev.targetRole,
              location: u.bio || prev.location,
            }));
            localStorage.setItem("hirest_user", JSON.stringify(u));
            return;
          }
        }
      } catch {}

      // 2. Fallback to localStorage
      const savedUserStr = localStorage.getItem("hirest_user");
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        const name = u.fullName || u.email?.split("@")[0] || "Candidate";
        setCandidateProfile((prev) => ({
          ...prev,
          id: u.id || prev.id,
          fullName: name,
          email: u.email || prev.email,
        }));

        if (u.email) {
          fetch(`/api/candidates?email=${encodeURIComponent(u.email)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.profile) {
                setCandidateProfile((prev) => ({
                  ...prev,
                  id: data.profile.id || prev.id,
                  fullName: data.profile.full_name || prev.fullName,
                  email: data.profile.email || prev.email,
                  targetRole: data.profile.headline || prev.targetRole,
                  location: data.profile.bio || prev.location,
                }));
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      // fallback
    }
  };

  // Load and subscribe to dynamic store & Supabase
  const loadData = async () => {
    setSessions(getStoredSessions());
    try {
      const fresh = await fetchSessionsFromSupabase();
      if (fresh && fresh.length > 0) {
        setSessions(fresh);
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    loadData();
    loadUserProfile();
    window.addEventListener("hirest_data_updated", loadData);
    window.addEventListener("hirest_user_updated", loadUserProfile);
    return () => {
      window.removeEventListener("hirest_data_updated", loadData);
      window.removeEventListener("hirest_user_updated", loadUserProfile);
    };
  }, []);

  // Live timer interval
  useEffect(() => {
    if (activeTab === "live") {
      const interval = setInterval(() => {
        setLiveSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Webcam stream attempt
  useEffect(() => {
    if (activeTab === "live" && isVideoOn) {
      if (navigator?.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            if (candidateVideoRef.current) {
              candidateVideoRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            // Camera permission denied or not available; fallback to avatar placeholder
          });
      }
    } else {
      if (candidateVideoRef.current && candidateVideoRef.current.srcObject) {
        const stream = candidateVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [activeTab, isVideoOn]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveNote = () => {
    if (candidateNote.trim()) {
      setSavedNotes((prev) => [...prev, candidateNote]);
      setCandidateNote("");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: candidateProfile.email,
          fullName: candidateProfile.fullName,
          phone: candidateProfile.phone,
          location: candidateProfile.location,
          targetRole: candidateProfile.targetRole,
          role: "candidate",
        }),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "hirest_user",
          JSON.stringify({
            email: candidateProfile.email,
            fullName: candidateProfile.fullName,
            role: "candidate",
          })
        );
        window.dispatchEvent(new Event("hirest_user_updated"));
      }
    } catch {
      // offline fallback
    }
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("hirest_user");
      window.dispatchEvent(new Event("hirest_user_updated"));
    }
    router.push("/");
  };

  // Scope sessions dynamically to this candidate
  const candidateSessions = sessions.filter((s) => {
    if (candidateProfile.email && s.candidateEmail?.toLowerCase() === candidateProfile.email.toLowerCase()) return true;
    if (candidateProfile.id && s.candidateId === candidateProfile.id) return true;
    return false;
  });

  const upcomingSessions = candidateSessions.filter((s) => s.status === "upcoming");
  const completedSessions = candidateSessions.filter((s) => s.status === "completed");
  const currentSession = upcomingSessions.find((s) => s.id === selectedSessionId) || upcomingSessions[0] || candidateSessions[0] || sessions[0];

  const questions = [
    "Tell me about yourself and your technical background.",
    "What are the key architectural differences between React, Angular, and Next.js?",
    "How do you handle complex client-side state management in large scale applications?",
    "What is your systematic approach to profiling memory leaks and rendering bottlenecks?",
    "Coding Round: Implement a responsive debounced search component with cancellation.",
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* 1. Left Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a1628] text-white flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
          <Link href="/" className="flex items-baseline">
            <span className="text-2xl font-extrabold text-blue-500">Hi</span>
            <span className="text-2xl font-extrabold text-white">rest</span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-0.5"></span>
          </Link>
          <span className="ml-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
            Candidate
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("interviews")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "interviews" || activeTab === "live"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>My Interviews</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Practice History</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Back to Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-72 sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs, companies or roles..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setBookingModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Mock Session (₹499)</span>
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2"></span>
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {candidateProfile.fullName
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "CA"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{candidateProfile.fullName}</div>
                <div className="text-[11px] text-slate-500">Candidate</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-6 sm:p-8 space-y-8 flex-1">
          <SupabaseSyncBanner />
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back, {candidateProfile.fullName.split(" ")[0]}!
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Your interview journey starts here. Keep practicing and achieve your dream job.
                </p>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Upcoming Interviews</div>
                  <div className="text-2xl font-black text-blue-600 mt-2">{upcomingSessions.length}</div>
                  <div className="text-[11px] font-semibold text-blue-600 mt-1">Scheduled online</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Completed Interviews</div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{completedSessions.length}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1">Scorecards available</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Total Practice Rounds</div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{sessions.length}</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1">DSA &amp; System Design</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Overall Preparedness</div>
                  <div className="text-2xl font-black text-emerald-600 mt-2">
                    {Math.min(95, 60 + completedSessions.length * 8)}%
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(95, 60 + completedSessions.length * 8)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Upcoming Interviews & Promo Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-slate-900">
                      Upcoming Online Mock Rounds ({upcomingSessions.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("interviews")}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {upcomingSessions.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-3">You don&apos;t have any upcoming mock interviews scheduled.</p>
                        <button
                          onClick={() => setBookingModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Book Your First Mock Round
                        </button>
                      </div>
                    ) : (
                      upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                              {session.domain.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 leading-tight">{session.domain}</h4>
                              <p className="text-xs text-slate-500">Mentor: {session.interviewerName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              {session.scheduledDate}, {session.scheduledTime}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedSessionId(session.id);
                                setActiveTab("live");
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Join Live Room
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Promo Card */}
                <div className="lg:col-span-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 p-6 flex flex-col justify-between text-left shadow-xs">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-2">
                      Practice Today. Get Hired Tomorrow.
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                      Real 1-on-1 online interviews with experienced mentors. Real feedback. Real job opportunities.
                    </p>
                  </div>
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors text-center cursor-pointer"
                  >
                    Book Next Mock Round (₹499)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY INTERVIEWS & DETAILS */}
          {activeTab === "interviews" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Session Details &amp; Preparation
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Connect with your assigned mentor in a 1-on-1 live video room.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("live")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Live Room
                </button>
              </div>

              {currentSession && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {currentSession.interviewerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{currentSession.interviewerName}</h3>
                      <p className="text-xs text-slate-500">{currentSession.domain}</p>
                      <div className="flex gap-1.5 mt-2">
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded">Live Video</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">1-on-1 HD</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                    <div><strong>Scheduled:</strong> {currentSession.scheduledDate}, {currentSession.scheduledTime}</div>
                    <div className="text-emerald-600 font-bold">Interviewer is Ready</div>
                  </div>
                </div>
              )}

              {/* Questions & Personal Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">
                    Sample Questions for this Round
                  </h3>
                  <div className="space-y-3 text-xs">
                    {questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 font-medium">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      Personal Preparation Notes
                    </h3>
                    <textarea
                      rows={5}
                      value={candidateNote}
                      onChange={(e) => setCandidateNote(e.target.value)}
                      placeholder="Add key notes, questions to ask the interviewer, or architecture points..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                    />
                    <button
                      onClick={handleSaveNote}
                      className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Save Note
                    </button>

                    {savedNotes.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Saved:</span>
                        {savedNotes.map((note, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-blue-50 text-blue-900 text-[11px] border border-blue-100">
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab("live")}
                    className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Live Video Room</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRACTICE HISTORY & EVALUATION REPORTS */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Practice History &amp; Evaluation Scorecards
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Review your past interviews, mentor scorecards, and areas of growth.
                  </p>
                </div>

                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setHistoryFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyFilter === "all" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    All ({sessions.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter("completed")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyFilter === "completed" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Completed ({completedSessions.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter("in-progress")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyFilter === "in-progress" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Upcoming ({upcomingSessions.length})
                  </button>
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-3.5">
                {sessions
                  .filter((item) =>
                    historyFilter === "all"
                      ? true
                      : historyFilter === "completed"
                      ? item.status === "completed"
                      : item.status === "upcoming"
                  )
                  .map((session) => (
                    <div
                      key={session.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {session.domain.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{session.domain}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Interviewer: {session.interviewerName} • {session.scheduledDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 justify-end">
                            {session.status === "completed" && <Star className="w-3.5 h-3.5 fill-amber-400" />}
                            <span>
                              {session.feedback
                                ? `${((session.feedback.technicalScore + session.feedback.communicationScore + session.feedback.problemSolvingScore) / 3).toFixed(1)} / 10`
                                : "Upcoming"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">
                            {session.feedback?.verdict || "Scheduled"}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (session.feedback) {
                              setSelectedReport(session);
                            } else {
                              setSelectedSessionId(session.id);
                              setActiveTab("live");
                            }
                          }}
                          className="px-4 py-2 border border-slate-200 hover:border-blue-600 hover:text-blue-600 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                        >
                          {session.feedback ? "View Detailed Report" : "Join Session"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Detailed Scorecard Modal Popup */}
              {selectedReport && selectedReport.feedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                  <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Official Evaluation Scorecard
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedReport.domain}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <div className="text-[10px] font-semibold text-slate-500">Technical Depth</div>
                        <div className="text-xl font-black text-blue-700 mt-1">{selectedReport.feedback.technicalScore}/10</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <div className="text-[10px] font-semibold text-slate-500">Communication</div>
                        <div className="text-xl font-black text-emerald-700 mt-1">{selectedReport.feedback.communicationScore}/10</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <div className="text-[10px] font-semibold text-slate-500">Problem Solving</div>
                        <div className="text-xl font-black text-purple-700 mt-1">{selectedReport.feedback.problemSolvingScore}/10</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold">Final Verdict:</span>
                      <span className="font-extrabold text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                        {selectedReport.feedback.verdict}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 mb-1">Key Strengths:</div>
                      <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                        {selectedReport.feedback.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 mb-1">Areas to Improve:</div>
                      <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                        {selectedReport.feedback.improvements.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 italic">
                      &ldquo;{selectedReport.feedback.detailedNotes}&rdquo;
                    </div>

                    <button
                      onClick={() => setSelectedReport(null)}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Close Scorecard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CANDIDATE PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Candidate Profile
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage your personal details and target tech roles.
                </p>
              </div>

              {profileSavedToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated and saved successfully!</span>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    {candidateProfile.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{candidateProfile.fullName}</h3>
                    <p className="text-xs text-slate-500">{candidateProfile.email}</p>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold mt-1">
                      <span>Target: {candidateProfile.targetRole}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={candidateProfile.fullName}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, fullName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={candidateProfile.email}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={candidateProfile.phone}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Location</label>
                    <input
                      type="text"
                      value={candidateProfile.location}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, location: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: CANDIDATE SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Account Settings
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage your notification preferences and platform appearance.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Email Notifications</div>
                      <div className="text-[11px] text-slate-500">Receive calendar invites and scorecard updates</div>
                    </div>
                    <button
                      onClick={() => setEmailNotifs(!emailNotifs)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        emailNotifs ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${emailNotifs ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Interview Reminders</div>
                      <div className="text-[11px] text-slate-500">1 hour and 15 min alerts before live sessions</div>
                    </div>
                    <button
                      onClick={() => setInterviewReminders(!interviewReminders)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        interviewReminders ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${interviewReminders ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-slate-800">New Opportunities</div>
                      <div className="text-[11px] text-slate-500">Referrals from mentors who rate you Strong Hire</div>
                    </div>
                    <button
                      onClick={() => setNewOpportunities(!newOpportunities)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        newOpportunities ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${newOpportunities ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LIVE ONLINE VIDEO INTERVIEW ROOM */}
          {activeTab === "live" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Interview in Progress
                  </h2>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
                    ⏱️ {formatTimer(liveSeconds)} remaining
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("interviews")}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  End Interview
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Main Video View: Mentor */}
                <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden relative min-h-[420px] flex items-center justify-center shadow-lg">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 rounded-full bg-teal-600 text-white font-bold text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      {currentSession?.interviewerName.substring(0, 2).toUpperCase() || "AS"}
                    </div>
                    <h4 className="text-base font-bold">{currentSession?.interviewerName || "Amit Sharma"}</h4>
                    <p className="text-xs text-teal-300">Interviewer • Microsoft SDE Track</p>
                  </div>

                  {/* Picture in picture: Candidate camera stream */}
                  <div className="absolute top-4 right-4 w-40 h-32 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-xl overflow-hidden flex items-center justify-center text-white">
                    {isVideoOn ? (
                      <video ref={candidateVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1">You</div>
                        <span className="text-[10px] text-slate-300">Camera Off</span>
                      </div>
                    )}
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`p-3 rounded-full text-white transition-colors cursor-pointer ${
                        isMicOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`p-3 rounded-full text-white transition-colors cursor-pointer ${
                        isVideoOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setActiveTab("interviews")}
                      className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                    >
                      <PhoneOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Interactive Prompt */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Live Question ({activeQuestionIndex + 1}/{questions.length})
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2 mb-3">
                      &ldquo;{questions[activeQuestionIndex]}&rdquo;
                    </h3>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setActiveQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setActiveQuestionIndex((prev) => (prev < questions.length - 1 ? prev + 1 : prev))}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Next
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mt-5">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">Live Audio Status:</div>
                      <div className="flex items-center gap-1 h-5">
                        <span className="w-1 bg-emerald-500 h-3 animate-pulse rounded-full"></span>
                        <span className="w-1 bg-emerald-500 h-5 animate-pulse rounded-full"></span>
                        <span className="w-1 bg-emerald-500 h-4 animate-pulse rounded-full"></span>
                        <span className="text-[11px] text-emerald-700 font-bold ml-2">Interviewer is listening</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("interviews")}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer mt-4"
                  >
                    View Session Notes &amp; Checklist
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        currentUser={{
          id: candidateProfile.id,
          email: candidateProfile.email,
          fullName: candidateProfile.fullName,
          role: "candidate",
        }}
        onRequireLogin={() => {}}
        onSessionCreated={() => {
          loadData();
          setActiveTab("dashboard");
        }}
      />

    </div>
  );
}
