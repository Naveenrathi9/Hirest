"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  User,
  LogOut,
  Search,
  Bell,
  CheckCircle2,
  Clock,
  Video,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Play,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Settings,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  getStoredSessions,
  fetchSessionsFromSupabase,
  getStoredSlots,
  fetchSlotsFromSupabase,
  saveStoredSlots,
  completeInterviewSession,
  SessionItem,
  AvailabilitySlot,
} from "@/lib/store";
import { SupabaseSyncBanner } from "@/components/SupabaseSyncBanner";

export default function InterviewerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "interviews" | "availability" | "earnings" | "profile" | "live"
  >("dashboard");

  // Dynamic sessions from store
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  // Dynamic availability slots
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<number>(10);
  const [newSlotTime, setNewSlotTime] = useState("");
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);

  // Selected session for interview details & live round
  const [selectedSessionId, setSelectedSessionId] = useState<string>("sess-1");

  // Live video room states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState(38 * 60 + 20); // 38m 20s
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Evaluation rubric state
  const [techRating, setTechRating] = useState(9);
  const [commRating, setCommRating] = useState(9);
  const [probRating, setProbRating] = useState(8);
  const [verdict, setVerdict] = useState<"Strong Hire" | "Hire" | "Borderline" | "Needs Improvement">("Strong Hire");
  const [detailedNotes, setDetailedNotes] = useState("");
  const [scorecardSubmitted, setScorecardSubmitted] = useState(false);

  // Interviewer Profile State (loaded dynamically from auth session)
  const [interviewerProfile, setInterviewerProfile] = useState({
    fullName: "Interviewer",
    email: "interviewer@hirest.com",
    company: "Senior Technical Interviewer",
  });

  const loadUserProfile = () => {
    if (typeof window === "undefined") return;
    try {
      const savedUserStr = localStorage.getItem("hirest_user");
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        setInterviewerProfile((prev) => ({
          ...prev,
          fullName: u.fullName || u.email?.split("@")[0] || "Interviewer",
          email: u.email || prev.email,
        }));
      }
    } catch {}
  };

  // Load and subscribe to store & Supabase
  const loadData = async () => {
    setSessions(getStoredSessions());
    setSlots(getStoredSlots());
    try {
      const freshSessions = await fetchSessionsFromSupabase();
      if (freshSessions && freshSessions.length > 0) setSessions(freshSessions);
      const freshSlots = await fetchSlotsFromSupabase();
      if (freshSlots && freshSlots.length > 0) setSlots(freshSlots);
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
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            // Camera permission denied or not available; fallback to avatar placeholder
          });
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [activeTab, isVideoOn]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const completedSessions = sessions.filter((s) => s.status === "completed");

  const totalEarnings = completedSessions.length * 400; // ₹400 per completed session

  const toggleSlot = (id: string) => {
    const updated = slots.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSlots(updated);
    saveStoredSlots(updated);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime) return;
    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}`,
      day: selectedDate,
      time: newSlotTime,
      enabled: true,
    };
    const updated = [...slots, newSlot];
    setSlots(updated);
    saveStoredSlots(updated);
    setNewSlotTime("");
    setShowAddSlotModal(false);
  };

  const handleEndAndSubmitScorecard = () => {
    if (!currentSession) return;
    completeInterviewSession(currentSession.id, {
      technicalScore: techRating,
      communicationScore: commRating,
      problemSolvingScore: probRating,
      strengths: ["Strong system architecture", "Clear communication", "Structured debugging methodology"],
      improvements: ["Practice edge case timing", "Review concurrency primitives"],
      verdict: verdict,
      detailedNotes: detailedNotes || "Candidate showed strong foundational competence and answered questions with precision.",
      completedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
    setScorecardSubmitted(true);
    setTimeout(() => {
      setScorecardSubmitted(false);
      setActiveTab("earnings");
    }, 1500);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hirest_user");
      window.dispatchEvent(new Event("hirest_user_updated"));
    }
    router.push("/");
  };

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
          <span className="ml-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 rounded border border-teal-500/30">
            Interviewer
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
            onClick={() => setActiveTab("availability")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "availability"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Availability</span>
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "earnings"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <CircleDollarSign className="w-4 h-4" />
            <span>Earnings</span>
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
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
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
              placeholder="Search candidates, companies or roles..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2"></span>
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {interviewerProfile.fullName
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "IN"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{interviewerProfile.fullName}</div>
                <div className="text-[11px] text-slate-500">Industry Professional Interviewer</div>
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
                  Welcome back, {interviewerProfile.fullName.split(" ")[0]}!
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  You&apos;re making a difference by conducting 1-on-1 live mock interviews.
                </p>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Total Interviews</div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{sessions.length}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Real-time count
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Upcoming</div>
                  <div className="text-2xl font-black text-blue-600 mt-2">{upcomingSessions.length}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    Scheduled online
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Completed</div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{completedSessions.length}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    Scorecards evaluated
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Earnings</div>
                  <div className="text-2xl font-black text-emerald-600 mt-2">₹{totalEarnings}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    ₹400 / session
                  </div>
                </div>
              </div>

              {/* Upcoming Interviews & Promo Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-slate-900">
                      Upcoming Online Mock Interviews ({upcomingSessions.length})
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
                      <p className="text-xs text-slate-400 py-4 text-center">No upcoming interviews scheduled yet.</p>
                    ) : (
                      upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                              {session.candidateName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 leading-tight">{session.candidateName}</h4>
                              <p className="text-xs text-slate-500">{session.domain}</p>
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
                              Join Live
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
                      <Video className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-2">
                      Real Conversations. Real Hiring.
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                      Help candidates build genuine confidence through structured technical rubrics and 1-on-1 coaching.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("availability")}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors text-center cursor-pointer"
                  >
                    Set Available Slots
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY AVAILABILITY */}
          {activeTab === "availability" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  My Availability
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Set your available online slots for candidates to book mock interviews.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar Panel */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-slate-900">October 2026</h3>
                    <div className="text-xs text-slate-500 font-semibold">
                      Selected Day: <strong>October {selectedDate}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {[
                      "", "", "", 1, 2, 3, 4,
                      5, 6, 7, 8, 9, 10, 11,
                      12, 13, 14, 15, 16, 17, 18,
                      19, 20, 21, 22, 23, 24, 25,
                      26, 27, 28, 29, 30, 31, ""
                    ].map((day, idx) => (
                      <button
                        key={idx}
                        disabled={!day}
                        onClick={() => typeof day === "number" && setSelectedDate(day)}
                        className={`h-9 rounded-xl font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          !day
                            ? "invisible"
                            : selectedDate === day
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slots Toggle Panel */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-slate-900">
                      Slots for Day {selectedDate} ({slots.length})
                    </h3>
                    <button
                      onClick={() => setShowAddSlotModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Slot
                    </button>
                  </div>

                  {showAddSlotModal && (
                    <form onSubmit={handleAddSlot} className="mb-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                      <label className="block text-xs font-bold text-blue-900">New Slot Time Range:</label>
                      <input
                        type="text"
                        placeholder="e.g. 05:00 PM - 06:00 PM"
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        required
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer">
                          Add
                        </button>
                        <button type="button" onClick={() => setShowAddSlotModal(false)} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-800">
                          {slot.time}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSlot(slot.id)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                            slot.enabled ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              slot.enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEW DETAILS & QUESTION CHECKLIST */}
          {activeTab === "interviews" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Interview Details &amp; Evaluation
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select a candidate to review questions, conduct session, or submit evaluation scorecard.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("live")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  Enter Video Room
                </button>
              </div>

              {/* Candidate Info Card */}
              {currentSession && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {currentSession.candidateName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{currentSession.candidateName}</h3>
                      <p className="text-xs text-slate-500">{currentSession.domain}</p>
                      <div className="flex gap-1.5 mt-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">Live Video</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded capitalize">{currentSession.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                    <div><strong>Scheduled:</strong> {currentSession.scheduledDate}, {currentSession.scheduledTime}</div>
                    <div><strong>Payout:</strong> ₹400 for completing this session</div>
                  </div>
                </div>
              )}

              {/* Live Evaluation & Guided Questions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Questions Checklist */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">
                    Guided Interview Questions
                  </h3>
                  <div className="space-y-3 text-xs">
                    {questions.map((q, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveQuestionIndex(idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          activeQuestionIndex === idx
                            ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-100 hover:bg-slate-100/70"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 font-medium">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scorecard Submitter Form */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Live Evaluation Rubric
                  </h3>

                  {scorecardSubmitted ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <div className="font-bold text-sm">Scorecard Submitted!</div>
                      <p className="text-xs">Candidate has received their report, and ₹400 has been credited to your Earnings.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Technical Competence (1-10)</span>
                          <span className="font-bold text-blue-600">{techRating}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={techRating}
                          onChange={(e) => setTechRating(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Communication &amp; Clarifying (1-10)</span>
                          <span className="font-bold text-emerald-600">{commRating}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={commRating}
                          onChange={(e) => setCommRating(Number(e.target.value))}
                          className="w-full accent-emerald-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Problem Solving &amp; Algorithms (1-10)</span>
                          <span className="font-bold text-purple-600">{probRating}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={probRating}
                          onChange={(e) => setProbRating(Number(e.target.value))}
                          className="w-full accent-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Overall Recommendation:</label>
                        <select
                          value={verdict}
                          onChange={(e: any) => setVerdict(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        >
                          <option value="Strong Hire">Strong Hire</option>
                          <option value="Hire">Hire</option>
                          <option value="Borderline">Borderline</option>
                          <option value="Needs Improvement">Needs Improvement</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Evaluation Notes:</label>
                        <textarea
                          rows={3}
                          value={detailedNotes}
                          onChange={(e) => setDetailedNotes(e.target.value)}
                          placeholder="Candidate's key strengths and constructive areas of growth..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <button
                        onClick={handleEndAndSubmitScorecard}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Submit Scorecard &amp; Complete Session
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EARNINGS OVERVIEW */}
          {activeTab === "earnings" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Earnings Overview
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Track dynamic payouts from completed 1-on-1 online interviews.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Total Earnings</div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2">₹{totalEarnings}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                    From {completedSessions.length} completed sessions
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">This Month</div>
                  <div className="text-3xl font-extrabold text-blue-600 mt-2">₹{totalEarnings}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1">Direct Bank Payout</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Upcoming Pipeline</div>
                  <div className="text-3xl font-extrabold text-slate-700 mt-2">₹{upcomingSessions.length * 400}</div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-1">From {upcomingSessions.length} upcoming sessions</div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  Completed Session Transactions
                </h3>
                <div className="space-y-3">
                  {completedSessions.map((cs) => (
                    <div
                      key={cs.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">1-on-1 Mock with {cs.candidateName}</div>
                        <div className="text-[10px] text-slate-400">{cs.domain} • {cs.scheduledDate}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-600">+₹400</span>
                        <div className="text-[10px] text-emerald-700 font-bold">Paid</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Profile Settings
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage your personal information and mentor credentials.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    {interviewerProfile.fullName
                      .split(" ")
                      .filter(Boolean)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "IN"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{interviewerProfile.fullName}</h3>
                    <p className="text-xs text-slate-500">{interviewerProfile.email}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                      <span>★ 4.8</span>
                      <span className="text-slate-400 font-normal">({completedSessions.length * 12 + 10} candidate reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={interviewerProfile.fullName}
                      onChange={(e) => setInterviewerProfile({ ...interviewerProfile, fullName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={interviewerProfile.email}
                      onChange={(e) => setInterviewerProfile({ ...interviewerProfile, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
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
                    Live 1-on-1 Online Mock Interview
                  </h2>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
                    ⏱️ {formatTimer(liveSeconds)} remaining
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("interviews")}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  End Session &amp; Evaluate
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Main Video View */}
                <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden relative min-h-[420px] flex items-center justify-center shadow-lg">
                  {/* Candidate Feed */}
                  <div className="text-center text-white">
                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-bold text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      {currentSession?.candidateName.substring(0, 2).toUpperCase() || "RV"}
                    </div>
                    <h4 className="text-base font-bold">{currentSession?.candidateName || "Rohit Verma"}</h4>
                    <p className="text-xs text-slate-400">{currentSession?.domain || "Frontend Developer Track"}</p>
                  </div>

                  {/* Picture in picture: Interviewer camera stream */}
                  <div className="absolute top-4 right-4 w-40 h-32 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-xl overflow-hidden flex items-center justify-center text-white">
                    {isVideoOn ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1">You</div>
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
                      Active Question ({activeQuestionIndex + 1}/{questions.length})
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
                        Next Question
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mt-5">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">Live Audio Detection:</div>
                      <div className="flex items-center gap-1 h-5">
                        <span className="w-1 bg-emerald-500 h-2 animate-pulse rounded-full"></span>
                        <span className="w-1 bg-emerald-500 h-4 animate-pulse rounded-full"></span>
                        <span className="w-1 bg-emerald-500 h-5 animate-pulse rounded-full"></span>
                        <span className="w-1 bg-emerald-500 h-3 animate-pulse rounded-full"></span>
                        <span className="w-1 bg-emerald-500 h-5 animate-pulse rounded-full"></span>
                        <span className="text-[11px] text-emerald-700 font-bold ml-2">Speaking</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("interviews")}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer mt-4"
                  >
                    Open Live Evaluation Rubric
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
