import React from "react";

export const CompanyLogos: React.FC = () => {
  return (
    <section className="py-12 border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 uppercase mb-8">
          Trusted by Job Seekers &amp; Professionals From
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 opacity-80 hover:opacity-100 transition-opacity">
          
          {/* TCS */}
          <div className="flex items-center text-slate-800 hover:text-blue-700 transition-colors">
            <span className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
              tcs
            </span>
          </div>

          {/* Infosys */}
          <div className="flex items-center text-slate-800 hover:text-blue-600 transition-colors">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif italic">
              Infosys
            </span>
          </div>

          {/* Accenture */}
          <div className="flex items-center text-slate-800 hover:text-purple-700 transition-colors">
            <span className="text-xl sm:text-2xl font-black tracking-tight lowercase">
              accenture<span className="text-blue-600 font-bold">&gt;</span>
            </span>
          </div>

          {/* Deloitte */}
          <div className="flex items-center text-slate-800 hover:text-emerald-700 transition-colors">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              Deloitte<span className="text-emerald-500 font-black">.</span>
            </span>
          </div>

          {/* Microsoft */}
          <div className="flex items-center gap-2 text-slate-800 hover:text-blue-600 transition-colors">
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-[#f25022] w-1.5 h-1.5"></div>
              <div className="bg-[#7fba00] w-1.5 h-1.5"></div>
              <div className="bg-[#00a4ef] w-1.5 h-1.5"></div>
              <div className="bg-[#ffb900] w-1.5 h-1.5"></div>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight">
              Microsoft
            </span>
          </div>

          {/* Amazon */}
          <div className="flex flex-col items-center justify-center text-slate-800 hover:text-amber-600 transition-colors">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight lowercase leading-none">
              amazon
            </span>
            <svg
              className="w-12 h-2.5 text-amber-500 -mt-0.5"
              viewBox="0 0 50 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M 2 3 Q 25 10 45 4" strokeLinecap="round" />
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
};
