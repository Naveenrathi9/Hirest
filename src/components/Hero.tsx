"use client";

import React from "react";
import { Video, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface HeroProps {
  onCandidateClick: () => void;
  onInterviewerClick: () => void;
  isLoggedIn: boolean;
  userRole?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onCandidateClick,
  onInterviewerClick,
  isLoggedIn,
  userRole,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-white via-blue-50/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-semibold text-blue-700 tracking-tight">
                Real People &nbsp;•&nbsp; 1-on-1 Online Mock Interviews &nbsp;•&nbsp; Real Growth
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
              Practice Real <br />
              Interviews. Land <br />
              Your <span className="text-blue-600 underline decoration-blue-200 decoration-wavy decoration-2">Dream Job.</span>
            </h1>

            {/* Subheading (Strictly Online) */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mb-10 font-normal">
              Hirest connects job seekers with industry professionals for 1-on-1 online mock interviews at a minimal cost. Get real feedback, build confidence, and be job-ready from anywhere.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              {/* Candidate Button */}
              <button
                onClick={onCandidateClick}
                className="group relative flex flex-col items-start justify-center px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] border border-blue-600 cursor-pointer"
              >
                <span className="text-lg font-bold tracking-tight">
                  {isLoggedIn && userRole === "candidate" ? "Book Mock Interview" : "I'm a Candidate"}
                </span>
                <span className="text-xs text-blue-100 font-medium tracking-normal mt-0.5">
                  {isLoggedIn ? "Schedule Online Session" : "Give Interviews & Get Feedback"}
                </span>
              </button>

              {/* Interviewer Button */}
              <button
                onClick={onInterviewerClick}
                className="group relative flex flex-col items-start justify-center px-7 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-xl shadow-sm hover:shadow border-2 border-slate-200/90 transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  {isLoggedIn && userRole === "interviewer" ? "Interviewer Dashboard" : "I'm an Interviewer"}
                </span>
                <span className="text-xs text-slate-500 font-medium tracking-normal mt-0.5">
                  {isLoggedIn ? "Manage Sessions & Slots" : "Help Others & Earn"}
                </span>
              </button>
            </div>

            {/* Social Trust Snippet */}
            <div className="mt-8 flex items-center gap-3 text-xs text-slate-500 font-medium">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                  VS
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                  AK
                </div>
                <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                  RM
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                  PN
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
                <span><strong className="text-slate-800">4.9/5</strong> rated by 3,200+ candidates</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Mockup with Handwritten Annotation */}
          <div className="lg:col-span-6 xl:col-span-5 relative">
            
            {/* Playful Handwritten Note with Curved Arrow */}
            <div className="absolute -top-10 sm:-top-12 right-4 sm:right-12 z-20 flex flex-col items-end pointer-events-none animate-float-slow">
              <span className="font-handwriting text-2xl sm:text-3xl text-slate-700 font-semibold tracking-wide drop-shadow-sm rotate-[-3deg]">
                Real Interviews,
                <br />
                Real Experience
              </span>
              {/* Cute sketched arrow SVG pointing down */}
              <svg
                className="w-12 h-10 text-slate-600 mt-1 mr-4 -scale-x-100 rotate-12 transition-transform duration-700 hover:rotate-45"
                viewBox="0 0 50 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 5 5 C 20 8, 35 20, 28 35" />
                <path d="M 20 28 L 28 35 L 35 25" />
              </svg>
            </div>

            {/* Floating Top Rating Badge */}
            <div className="absolute -top-4 -left-3 sm:-top-5 sm:-left-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3.5 border border-slate-200/90 shadow-xl flex items-center gap-2.5 animate-float-delayed">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black text-sm shadow-2xs">
                ★
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 leading-tight">4.9 / 5 Rating</div>
                <div className="text-[10px] text-slate-500 font-medium">3,200+ Mock Rounds</div>
              </div>
            </div>

            {/* Floating Bottom Audio Visualizer Badge */}
            <div className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-xl flex items-center gap-3 animate-float">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                <Video className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                  <span>Live HD Video Session</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <div className="flex items-center gap-1 h-3.5 mt-1">
                  <span className="w-1 bg-emerald-500 rounded-full animate-soundwave-1"></span>
                  <span className="w-1 bg-emerald-500 rounded-full animate-soundwave-2"></span>
                  <span className="w-1 bg-emerald-500 rounded-full animate-soundwave-3"></span>
                  <span className="w-1 bg-emerald-500 rounded-full animate-soundwave-4"></span>
                  <span className="w-1 bg-emerald-500 rounded-full animate-soundwave-2"></span>
                  <span className="text-[10px] text-emerald-700 font-bold ml-1">Live Audio</span>
                </div>
              </div>
            </div>

            {/* Interactive Mock Interview Session Card */}
            <div className="relative z-10 bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden p-6 sm:p-7 transition-all duration-500 hover:shadow-3xl hover:border-blue-200">
              {/* Session Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Video className="w-3 h-3 text-emerald-600" />
                    Online HD Live Room
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>38:20 mins</span>
                </div>
              </div>

              {/* Participants Showcase */}
              <div className="mt-5 grid grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                {/* Interviewer */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      IN
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">Interviewer</h4>
                      <p className="text-[10px] text-blue-600 font-semibold">Senior Mentor</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium bg-slate-50 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Staff Eng @ BigTech</span>
                  </div>
                </div>

                {/* Candidate */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      CA
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">Candidate</h4>
                      <p className="text-[10px] text-amber-600 font-semibold">Job Aspirant</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium bg-slate-50 px-1.5 py-0.5 rounded">
                    <span>Target: Tier-1 Tech</span>
                  </div>
                </div>
              </div>

              {/* Interview Focus Domain */}
              <div className="mt-4 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                    Online Mock: System Design &amp; Problem Solving
                  </span>
                  <span className="text-xs font-bold text-blue-700">9.2 / 10</span>
                </div>
                <p className="text-xs text-slate-700 italic">
                  &ldquo;Candidate demonstrated structured approach in data partitioning and caching strategy.&rdquo;
                </p>
              </div>

              {/* Real-time Evaluation Metrics */}
              <div className="mt-4 space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Technical Architecture &amp; Fundamentals</span>
                    <span className="font-bold text-slate-900">92%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500 w-[92%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Communication &amp; Clarifying Questions</span>
                    <span className="font-bold text-slate-900">88%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500 w-[88%]"></div>
                  </div>
                </div>
              </div>

              {/* Bottom Badge */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>1-on-1 Online Video Call</span>
                </div>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Minimal Cost • ₹499
                </span>
              </div>

            </div>

            {/* Background decorative blob with pulse-glow */}
            <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow"></div>
            <div className="absolute -top-8 -left-8 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" style={{ animationDelay: "2s" }}></div>

          </div>

        </div>
      </div>
    </section>
  );
};
