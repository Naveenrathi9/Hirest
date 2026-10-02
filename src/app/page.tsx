"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CompanyLogos } from "@/components/CompanyLogos";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { HowItWorks } from "@/components/HowItWorks";
import { AudienceSplit } from "@/components/AudienceSplit";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { BookingModal } from "@/components/BookingModal";
import { InterviewerModal } from "@/components/InterviewerModal";
import { supabase } from "@/lib/supabase";

interface CurrentUser {
  email: string;
  fullName?: string;
  role: "candidate" | "interviewer";
}

export default function Home() {
  const router = useRouter();

  // Current logged in user state
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authRole, setAuthRole] = useState<"candidate" | "interviewer">("candidate");
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [interviewerModalOpen, setInterviewerModalOpen] = useState(false);

  // Check saved session on mount & subscribe to updates
  const loadUser = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hirest_user");
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("hirest_user_updated", loadUser);
    return () => window.removeEventListener("hirest_user_updated", loadUser);
  }, []);

  // Open Auth modal directly
  const handleOpenAuth = (mode: "login" | "signup" = "login", role: "candidate" | "interviewer" = "candidate") => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  // When user clicks "I'm a Candidate" or "Join as a Candidate"
  const handleCandidateAction = () => {
    if (!currentUser) {
      handleOpenAuth("login", "candidate");
    } else {
      router.push("/dashboard/candidate");
    }
  };

  // When user clicks "I'm an Interviewer" or "Join as an Interviewer"
  const handleInterviewerAction = () => {
    if (!currentUser) {
      handleOpenAuth("login", "interviewer");
    } else {
      router.push("/dashboard/interviewer");
    }
  };

  // When user clicks "Get Started" in the dark CTA banner
  const handleGetStarted = () => {
    if (!currentUser) {
      handleOpenAuth("login", "candidate");
    } else {
      if (currentUser.role === "interviewer") {
        router.push("/dashboard/interviewer");
      } else {
        router.push("/dashboard/candidate");
      }
    }
  };

  // Login success callback
  const handleAuthSuccess = (user: any) => {
    const userRole = (user.role || authRole) as "candidate" | "interviewer";
    const loggedUser: CurrentUser = {
      email: user.email,
      fullName: user.fullName || user.email.split("@")[0],
      role: userRole,
    };
    setCurrentUser(loggedUser);
    setAuthModalOpen(false);

    // Redirect to respective dashboard view
    if (userRole === "interviewer") {
      router.push("/dashboard/interviewer");
    } else {
      router.push("/dashboard/candidate");
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("hirest_user");
      window.dispatchEvent(new Event("hirest_user_updated"));
    }
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onBookClick={currentUser?.role === "interviewer" ? handleInterviewerAction : handleCandidateAction}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          onCandidateClick={handleCandidateAction}
          onInterviewerClick={handleInterviewerAction}
          isLoggedIn={!!currentUser}
          userRole={currentUser?.role}
        />

        {/* 3. Trusted By Company Logos */}
        <CompanyLogos />

        {/* 4. Why Choose Hirest? */}
        <WhyChooseUs />

        {/* 5. How It Works */}
        <HowItWorks />

        {/* 6. Dual Audience Split */}
        <AudienceSplit
          onJoinCandidate={handleCandidateAction}
          onJoinInterviewer={handleInterviewerAction}
          isLoggedIn={!!currentUser}
          userRole={currentUser?.role}
        />

        {/* 7. Dark CTA Banner */}
        <CtaBanner onGetStarted={handleGetStarted} />
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={authRole}
        onSuccess={handleAuthSuccess}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        currentUser={currentUser}
        onRequireLogin={() => handleOpenAuth("login", "candidate")}
      />

      {/* Interviewer Modal */}
      <InterviewerModal
        isOpen={interviewerModalOpen}
        onClose={() => setInterviewerModalOpen(false)}
        currentUser={currentUser}
        onRequireLogin={() => handleOpenAuth("login", "interviewer")}
      />
    </div>
  );
}
