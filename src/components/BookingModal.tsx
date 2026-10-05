"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
  Star,
  Briefcase,
  Search,
  Sparkles,
  ChevronRight,
  Send,
} from "lucide-react";
import {
  addInterviewSession,
  fetchInterviewers,
  getStoredInterviewers,
  InterviewerItem,
} from "@/lib/store";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id?: string;
    email: string;
    fullName?: string;
    role?: string;
  } | null;
  onRequireLogin: () => void;
  onSessionCreated?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRequireLogin,
  onSessionCreated,
}) => {
  const [interviewers, setInterviewers] = useState<InterviewerItem[]>([]);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [step, setStep] = useState<"choose_interviewer" | "details">("choose_interviewer");

  const [domain, setDomain] = useState("Full Stack Software Engineering");
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  const [date, setDate] = useState("2026-10-15");
  const [time, setTime] = useState("06:00 PM - 06:45 PM");
  const [targetCompany, setTargetCompany] = useState("TCS / Microsoft / Tier-1 Tech");
  const [candidateNotes, setCandidateNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastBookedInterviewer, setLastBookedInterviewer] = useState<InterviewerItem | null>(null);

  // Load approved interviewers dynamically from Supabase database based on domain
  useEffect(() => {
    if (isOpen) {
      let isCancelled = false;
      const load = async () => {
        setLoadingInterviewers(true);
        try {
          const filterDomain = domain === "All Tracks" ? undefined : domain;
          const fresh = await fetchInterviewers(false, filterDomain);
          if (!isCancelled && fresh && fresh.length > 0) {
            setInterviewers(fresh);
            if (!selectedInterviewerId || !fresh.find((i) => i.id === selectedInterviewerId)) {
              setSelectedInterviewerId(fresh[0].id);
            }
          } else if (!isCancelled && fresh && fresh.length === 0) {
            setInterviewers([]);
          }
        } finally {
          if (!isCancelled) setLoadingInterviewers(false);
        }
      };
      load();
      return () => {
        isCancelled = true;
      };
    }
  }, [isOpen, domain]);

  if (!isOpen) return null;

  // If user is not logged in, prompt them to login first
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Please Sign In to Book
          </h3>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Interviews can only be booked through an active candidate account to match with verified interviewers and track your scorecard.
          </p>
          <button
            onClick={() => {
              onClose();
              onRequireLogin();
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Log In / Sign Up as Candidate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const domains = [
    "Full Stack Software Engineering",
    "Frontend (React / Next.js / Web)",
    "Backend (Node / Python / Java)",
    "DSA & Problem Solving",
    "System Design & Scalability",
    "AI / Machine Learning Engineer",
    "Product Management & Behavioral",
    "All Tracks",
  ];

  const selectedInterviewer =
    interviewers.find((i) => i.id === selectedInterviewerId) || interviewers[0];

  const filteredInterviewers = interviewers.filter((int) => {
    const q = searchTerm.toLowerCase();
    return (
      int.fullName.toLowerCase().includes(q) ||
      int.headline.toLowerCase().includes(q) ||
      int.company.toLowerCase().includes(q) ||
      int.domains.some((d) => d.toLowerCase().includes(q))
    );
  });

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterviewer) return;

    const detailedNotes = [
      candidateNotes ? `Specific Focus: ${candidateNotes}` : null,
      targetCompany ? `Target: ${targetCompany}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    // Send interview request to chosen interviewer with status "pending"
    addInterviewSession({
      candidateId: currentUser.id,
      candidateName: currentUser.fullName || currentUser.email.split("@")[0] || "Candidate",
      candidateEmail: currentUser.email,
      interviewerId: selectedInterviewer.id,
      interviewerName: selectedInterviewer.fullName,
      interviewerEmail: selectedInterviewer.email,
      domain: `${domain} • ${targetCompany}`,
      scheduledDate: date,
      scheduledTime: time,
      price: selectedInterviewer.hourlyRate || 499,
      notes: detailedNotes || `Target: ${targetCompany}`,
      status: "pending", // Interviewer receives a pending request
    });

    setLastBookedInterviewer(selectedInterviewer);
    setSubmitted(true);
    if (onSessionCreated) onSessionCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted && lastBookedInterviewer ? (
          <div className="p-8 sm:p-10 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Interview Request Sent!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your mock interview request has been dispatched to{" "}
              <strong className="text-slate-900">{lastBookedInterviewer.fullName}</strong> ({lastBookedInterviewer.company}). The interviewer will review the request and confirm your live video slot.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-left space-y-2 mt-4 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Interviewer:</span>
                <span className="font-semibold text-slate-900">
                  {lastBookedInterviewer.fullName} ({lastBookedInterviewer.company})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Domain:</span>
                <span className="font-semibold text-slate-900">{domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Schedule:</span>
                <span className="font-semibold text-slate-900">
                  {date} at {time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Pending Interviewer Confirmation
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session Fee:</span>
                <span className="font-bold text-blue-600">
                  ₹{lastBookedInterviewer.hourlyRate || 499}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep("choose_interviewer");
                onClose();
              }}
              className="mt-6 w-full max-w-md py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer mx-auto block"
            >
              Done &amp; View in Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                  1-on-1 Online Mock Interview
                </span>
                <span className="text-xs text-slate-400">• Verified Tech Mentors</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {step === "choose_interviewer"
                  ? "Select Your Interviewer"
                  : "Finalize Date, Time & Focus"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === "choose_interviewer"
                  ? "Choose an approved expert from leading tech companies to conduct your mock round."
                  : `Scheduling with ${selectedInterviewer?.fullName || "your selected mentor"} (${selectedInterviewer?.company || "Tech Lead"})`}
              </p>

              {/* Step Tabs */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setStep("choose_interviewer")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    step === "choose_interviewer"
                      ? "border-blue-600 bg-white text-blue-700 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Choose Interviewer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  disabled={!selectedInterviewer}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    step === "details"
                      ? "border-blue-600 bg-white text-blue-700 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Schedule &amp; Details</span>
                </button>
              </div>
            </div>

            {/* Step 1: Choose Interviewer */}
            {step === "choose_interviewer" && (
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                {/* Domain Selector & Filter */}
                <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      Select Interview Track / Domain:
                    </label>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                      Real-time Database Sync
                    </span>
                  </div>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                  >
                    {domains.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Interviewer */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by mentor name, company (Google, Microsoft), or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                {/* Interviewers Grid */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {loadingInterviewers ? (
                    <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading real approved interviewers for &quot;{domain}&quot;...</span>
                    </div>
                  ) : filteredInterviewers.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                      <p className="font-semibold text-slate-600">No interviewers currently found for this domain.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Try selecting another domain or &quot;All Tracks&quot; to see all verified mentors.
                      </p>
                    </div>
                  ) : (
                    filteredInterviewers.map((mentor) => {
                      const isSelected = selectedInterviewerId === mentor.id;
                      const displayDomain = mentor.domain || mentor.domains?.[0] || domain;
                      return (
                        <div
                          key={mentor.id}
                          onClick={() => setSelectedInterviewerId(mentor.id)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Avatar / Initials */}
                            {mentor.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={mentor.avatarUrl}
                                alt={mentor.fullName}
                                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {mentor.fullName.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {mentor.fullName}
                                </h4>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Verified
                                </span>
                                {mentor.gender && mentor.gender !== "Not Specified" && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                    {mentor.gender}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 font-medium">
                                {mentor.company} • {mentor.headline}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                                  {displayDomain}
                                </span>
                                <span>•</span>
                                <span className="flex items-center text-amber-500 font-semibold">
                                  <Star className="w-3 h-3 fill-amber-400 stroke-amber-500 mr-0.5" />
                                  {mentor.rating || 4.9} ({mentor.reviewsCount || 10}+ rounds)
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3 text-slate-400" />
                                  {mentor.experienceYears}+ yrs exp
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-sm font-extrabold text-blue-700">
                                ₹{mentor.hourlyRate || 499}
                              </span>
                              <span className="text-[10px] text-slate-400 block">/ 60m session</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInterviewerId(mentor.id);
                                setStep("details");
                              }}
                              className={`mt-1 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700"
                              }`}
                            >
                              {isSelected ? "Selected ✓" : "Select"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Next Step Button */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Selected: <strong className="text-slate-900">{selectedInterviewer?.fullName}</strong>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedInterviewer}
                    onClick={() => setStep("details")}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>Proceed to Schedule</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Schedule & Details */}
            {step === "details" && selectedInterviewer && (
              <form onSubmit={handleBooking} className="p-6 flex-1 overflow-y-auto space-y-4">
                {/* Chosen Interviewer Card preview */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedInterviewer.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Interviewing with {selectedInterviewer.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selectedInterviewer.headline} • {selectedInterviewer.company}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("choose_interviewer")}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Change Mentor
                  </button>
                </div>

                {/* Domain Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Interview Domain / Track
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium cursor-pointer"
                  >
                    {domains.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Slot */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                      <option value="12:00 PM - 12:45 PM">12:00 PM - 12:45 PM</option>
                      <option value="02:00 PM - 02:45 PM">02:00 PM - 02:45 PM</option>
                      <option value="04:30 PM - 05:15 PM">04:30 PM - 05:15 PM</option>
                      <option value="06:00 PM - 06:45 PM">06:00 PM - 06:45 PM</option>
                      <option value="08:00 PM - 08:45 PM">08:00 PM - 08:45 PM</option>
                    </select>
                  </div>
                </div>

                {/* Target Company */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Company / Role Focus
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon SDE-1, Microsoft, TCS Digital, Google..."
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Custom Candidate Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Topics or Questions for Interviewer (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Focus on binary search trees, microservice design, or mock behavioral round"
                    value={candidateNotes}
                    onChange={(e) => setCandidateNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Fee & Action Summary */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      1x 60-Min Online 1-on-1 Mock Interview
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Request will be sent to {selectedInterviewer.fullName} for confirmation.
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-blue-700">
                      ₹{selectedInterviewer.hourlyRate || 499}
                    </span>
                    <div className="text-[10px] text-emerald-600 font-bold">Introductory Rate</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("choose_interviewer")}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Request to {selectedInterviewer.fullName}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
