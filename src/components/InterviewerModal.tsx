"use client";

import React, { useState } from "react";
import { X, Briefcase, Award, CheckCircle2, ArrowRight, User, Video } from "lucide-react";

interface InterviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    email: string;
    fullName?: string;
    role?: string;
  } | null;
  onRequireLogin: () => void;
}

export const InterviewerModal: React.FC<InterviewerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRequireLogin,
}) => {
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [experienceYears, setExperienceYears] = useState("4");
  const [domains, setDomains] = useState("Frontend & System Design");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // If not logged in, prompt to log in as interviewer first
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
          <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Please Sign In to Continue
          </h3>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            You must be logged in as an Interviewer to register your mentor profile, receive candidate requests, and manage payouts.
          </p>
          <button
            onClick={() => {
              onClose();
              onRequireLogin();
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Log In / Sign Up as Interviewer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Interviewer Profile Updated!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your mentor profile is set up for <strong className="text-slate-900">{currentUser.email}</strong>. We will notify you when candidates book 1-on-1 online mock interviews matching your expertise.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-6 w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm"
            >
              Done &amp; View Dashboard
            </button>
          </div>
        ) : (
          <div className="p-7 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                Interviewer Partner Program
              </span>
              <span className="text-xs text-slate-500">
                {currentUser.fullName || currentUser.email}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Conduct Online Mock Interviews
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Interview candidates 1-on-1 via live video, share feedback, and earn compensation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current / Previous Company
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft, Google, TCS, Infosys, Accenture"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior SDE / Lead"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Years of Experience
                  </label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                  >
                    <option value="2">2+ Years</option>
                    <option value="4">4+ Years</option>
                    <option value="6">6+ Years</option>
                    <option value="10">10+ Years (Principal / Staff)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialization &amp; Interview Topics
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend React, Node.js Backend, System Design, DSA"
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Online Perks Summary */}
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-teal-900">Online 1-on-1 Sessions</div>
                  <div className="text-[11px] text-teal-700">₹1,500 – ₹3,000 / conducted session</div>
                </div>
                <div className="text-right font-semibold text-teal-800">
                  Flexible Weekly Hours
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Save Interviewer Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
