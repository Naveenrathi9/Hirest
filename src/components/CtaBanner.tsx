"use client";

import React from "react";

interface CtaBannerProps {
  onGetStarted: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onGetStarted }) => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navy Container with Doodle Accents */}
        <div className="relative overflow-hidden bg-[#0c1c38] rounded-3xl px-6 py-14 sm:px-12 sm:py-16 text-center shadow-xl">
          
          {/* Left Doodle Sparkle Rays */}
          <div className="absolute left-6 sm:left-14 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-blue-300/80"
              viewBox="0 0 80 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              {/* Radiating playful hand-drawn rays */}
              <line x1="40" y1="20" x2="40" y2="8" />
              <line x1="28" y1="24" x2="18" y2="14" />
              <line x1="22" y1="38" x2="8" y2="38" />
              <line x1="26" y1="50" x2="16" y2="60" />
              <line x1="38" y1="58" x2="38" y2="70" />
            </svg>
          </div>

          {/* Right Doodle Sparkle Rays */}
          <div className="absolute right-6 sm:right-14 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-blue-300/80 -scale-x-100"
              viewBox="0 0 80 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              {/* Radiating playful hand-drawn rays */}
              <line x1="40" y1="20" x2="40" y2="8" />
              <line x1="28" y1="24" x2="18" y2="14" />
              <line x1="22" y1="38" x2="8" y2="38" />
              <line x1="26" y1="50" x2="16" y2="60" />
              <line x1="38" y1="58" x2="38" y2="70" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Better Practice. Brighter Future.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg mx-auto font-normal">
              Whether you&apos;re preparing for your next job or looking to give back, Hirest is the place to be.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 bg-white text-slate-900 font-bold text-sm sm:text-base rounded-xl shadow-lg hover:bg-slate-100 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
