"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Video, CheckCircle2, ArrowRight, ShieldCheck, User } from "lucide-react";
import { addInterviewSession } from "@/lib/store";

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
  const [domain, setDomain] = useState("Full Stack Software Engineering");
  const [date, setDate] = useState("2026-10-15");
  const [time, setTime] = useState("06:00 PM - 06:45 PM");
  const [targetCompany, setTargetCompany] = useState("TCS / Microsoft / Tier-1 Tech");
  const [candidateNotes, setCandidateNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
            Interviews can only be booked through an active candidate account to track your feedback scorecard and session history.
          </p>
          <button
            onClick={() => {
              onClose();
              onRequireLogin();
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const detailedNotes = [
      candidateNotes ? `Specific Focus: ${candidateNotes}` : null,
      targetCompany ? `Target: ${targetCompany}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    // Dynamically persist to real store and Supabase
    addInterviewSession({
      candidateId: currentUser.id,
      candidateName: currentUser.fullName || currentUser.email.split("@")[0] || "Candidate",
      candidateEmail: currentUser.email,
      interviewerName: "Amit Sharma",
      interviewerEmail: "amit.sharma@example.com",
      domain: `${domain} • ${targetCompany}`,
      scheduledDate: date,
      scheduledTime: time,
      price: 499,
      notes: detailedNotes || `Target: ${targetCompany}`,
    });

    setSubmitted(true);
    if (onSessionCreated) onSessionCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-8 sm:p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Online Mock Interview Confirmed!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We have booked your live session for{" "}
              <strong className="text-slate-900">{domain}</strong> with a verified industry interviewer. A calendar invite and room credentials have been generated for{" "}
              <strong className="text-blue-600">{currentUser.email}</strong>.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-left space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  1-on-1 Online Live HD Video Room
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-semibold text-slate-900">{currentUser.fullName || currentUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled:</span>
                <span className="font-semibold text-slate-900">{date} at {time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session Fee:</span>
                <span className="font-bold text-blue-600">₹499 (Online Introductory Rate)</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm"
            >
              Done &amp; View in Dashboard
            </button>
          </div>
        ) : (
          <div className="p-7 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                  Online Video Session
                </span>
                <span className="text-xs text-slate-500">• 60-Minute 1-on-1</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Logged in as <span className="text-slate-900">{currentUser.fullName || currentUser.email}</span>
              </span>
            </div>
            
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Schedule Your Online Mock Interview
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Connect via live video with a top professional who interviews at leading tech firms.
            </p>

            <form onSubmit={handleBooking} className="space-y-4">
              {/* Domain Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interview Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                >
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Badge (Strictly Online) */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">100% Online HD Video Room</div>
                  <div className="text-[11px] text-slate-600">
                    Includes live coding sandbox, screen share, and interactive whiteboard.
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
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
                  placeholder="e.g. Amazon SDE-1, Microsoft, TCS Digital..."
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Custom Candidate Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Topics / Focus Request (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on binary trees, graph BFS/DFS, or microservices architecture"
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Minimal Cost Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">1x 60-Minute Online Mock Session</div>
                  <div className="text-[11px] text-slate-500">Live 1-on-1 interview + 15 min detailed evaluation</div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-blue-700">₹499</span>
                  <div className="text-[10px] text-emerald-600 font-bold">Minimal Cost</div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Confirm Online Session Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
