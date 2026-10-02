"use client";

import React from "react";
import { ArrowRight, CheckCircle2, Target, Award, Video } from "lucide-react";

interface AudienceSplitProps {
  onJoinCandidate: () => void;
  onJoinInterviewer: () => void;
  isLoggedIn: boolean;
  userRole?: string;
}

export const AudienceSplit: React.FC<AudienceSplitProps> = ({
  onJoinCandidate,
  onJoinInterviewer,
  isLoggedIn,
  userRole,
}) => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: For Candidates */}
          <div
            id="candidates"
            className="relative bg-gradient-to-br from-blue-50/50 via-slate-50/80 to-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* Top row: Pill badge & Handwritten note */}
            <div className="flex items-start justify-between relative z-10 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100/80">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                For Candidates
              </span>

              {/* Handwritten Note with Arrow */}
              <div className="flex flex-col items-end pointer-events-none -mt-1 mr-2">
                <span className="font-handwriting text-xl sm:text-2xl text-slate-700 font-semibold rotate-[-3deg] drop-shadow-xs">
                  Build Confidence
                  <br />
                  Get Hired
                </span>
                <svg
                  className="w-8 h-8 text-slate-500 -mt-1 mr-3"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M 5 5 Q 25 10 25 30" />
                  <path d="M 18 24 L 25 31 L 31 23" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Get Interview Ready
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mb-8">
                Practice with real professionals online, understand your strengths, and improve with constructive live video feedback.
              </p>

              {/* Candidate Visual Snapshot */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-8 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-600" />
                    Target Role: Software Engineer / Full Stack
                  </span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    Live 1-on-1 Online
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 text-[11px]">Practice Rounds</div>
                    <div className="font-bold text-slate-900 mt-0.5">DSA + System Design</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 text-[11px]">Online Session Fee</div>
                    <div className="font-bold text-blue-600 mt-0.5">₹499 (Introductory)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Receive detailed rubric score &amp; recorded session notes within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="relative z-10 pt-2">
              <button
                onClick={onJoinCandidate}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{isLoggedIn && userRole === "candidate" ? "Book Online Session" : "Join as a Candidate"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: For Interviewers */}
          <div
            id="interviewers"
            className="relative bg-gradient-to-br from-teal-50/50 via-slate-50/80 to-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* Top row: Pill badge & Handwritten note */}
            <div className="flex items-start justify-between relative z-10 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-teal-800 bg-teal-100/80">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                For Interviewers
              </span>

              {/* Handwritten Note with Arrow */}
              <div className="flex flex-col items-end pointer-events-none -mt-1 mr-2">
                <span className="font-handwriting text-xl sm:text-2xl text-slate-700 font-semibold rotate-[-3deg] drop-shadow-xs">
                  Share Knowledge
                  <br />
                  Create Opportunity
                </span>
                <svg
                  className="w-8 h-8 text-slate-500 -mt-1 mr-3"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M 5 5 Q 25 10 25 30" />
                  <path d="M 18 24 L 25 31 L 31 23" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Make an Impact
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mb-8">
                Share your experience, help candidates grow via online mock interviews, and earn while you do it.
              </p>

              {/* Interviewer Visual Snapshot */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-8 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-teal-600" />
                    Interviewer Perks
                  </span>
                  <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px] font-bold">
                    Online &amp; Flexible
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 text-[11px]">Payout</div>
                    <div className="font-bold text-teal-700 mt-0.5">Direct Bank Deposit</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 text-[11px]">Time Commitment</div>
                    <div className="font-bold text-slate-900 mt-0.5">2 - 5 hrs / week online</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Verified Mentor Badge &amp; conduct sessions from anywhere</span>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="relative z-10 pt-2">
              <button
                onClick={onJoinInterviewer}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{isLoggedIn && userRole === "interviewer" ? "Open Mentor Dashboard" : "Join as an Interviewer"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
