import React from "react";
import { Video, Briefcase, IndianRupee, Star } from "lucide-react";

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: Video,
      iconBg: "bg-blue-50 text-blue-600",
      title: "1-on-1 Online Interviews",
      description: "Get live face-to-face video interview practice with top pros from the comfort of your home.",
    },
    {
      icon: Briefcase,
      iconBg: "bg-teal-50 text-teal-600",
      title: "Industry Professionals",
      description: "Learn from experienced engineers & managers currently working across top tech companies.",
    },
    {
      icon: IndianRupee,
      iconBg: "bg-purple-50 text-purple-600",
      title: "Minimal Cost",
      description: "High-quality live practice at a price every student and job seeker can afford.",
    },
    {
      icon: Star,
      iconBg: "bg-amber-50 text-amber-600",
      title: "Personalized Feedback",
      description: "Receive a comprehensive scorecard with actionable areas of improvement within 24 hours.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Why Choose Hirest?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            A simple online platform with a powerful impact.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group"
              >
                {/* Circular Icon Container */}
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7" strokeWidth={2.2} />
                </div>

                {/* Card Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>

                {/* Card Description */}
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
