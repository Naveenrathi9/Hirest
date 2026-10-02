import React from "react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "1",
      title: "Choose Your Role",
      description: "Select whether you want to give interviews as a candidate or conduct them as a mentor.",
    },
    {
      number: "2",
      title: "Complete Your Profile",
      description: "Sign in and add your domain, target role, skills and availability.",
    },
    {
      number: "3",
      title: "Book / Accept Session",
      description: "Pick an online time slot and get matched with an industry professional.",
    },
    {
      number: "4",
      title: "Meet & Grow Online",
      description: "Join the 1-on-1 live video interview and receive actionable, structured feedback.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Get started in just a few simple steps.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          
          {/* Connecting Line for desktop */}
          <div className="hidden md:block absolute top-7 left-12 right-12 h-0.5 bg-slate-200 -z-0"></div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center group"
              >
                {/* Number Circle */}
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-500/20 ring-4 ring-white group-hover:scale-110 group-hover:bg-blue-700 transition-all">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight group-hover:text-blue-600 transition-colors">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed max-w-xs font-normal">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
