"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, ArrowRight } from "lucide-react";

interface NavbarProps {
  onOpenAuth: (mode: "login" | "signup", role?: "candidate" | "interviewer") => void;
  onBookClick: () => void;
  currentUser: {
    email: string;
    fullName?: string;
    role?: "candidate" | "interviewer" | "admin";
  } | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onBookClick,
  currentUser,
  onLogout,
}) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToDashboard = () => {
    if (currentUser?.role === "admin") {
      router.push("/dashboard/admin");
    } else if (currentUser?.role === "interviewer") {
      router.push("/dashboard/interviewer");
    } else {
      router.push("/dashboard/candidate");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-baseline">
            <span className="text-3xl font-extrabold tracking-tight text-blue-600 transition-colors">
              Hi
            </span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              rest
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 ml-0.5"></span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-600">
          <Link
            href="/"
            className="text-slate-900 hover:text-blue-600 transition-colors font-semibold"
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            className="hover:text-blue-600 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#candidates"
            className="hover:text-blue-600 transition-colors"
          >
            For Candidates
          </a>
          <a
            href="#interviewers"
            className="hover:text-blue-600 transition-colors"
          >
            For Interviewers
          </a>
          <a
            href="#pricing"
            className="hover:text-blue-600 transition-colors"
          >
            Pricing
          </a>
          <Link
            href="/dashboard/admin"
            className="hover:text-rose-600 transition-colors text-slate-500 font-medium flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Admin</span>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* User badge */}
              <button
                onClick={goToDashboard}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs hover:border-blue-400 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                  {(currentUser.fullName || currentUser.email)[0].toUpperCase()}
                </div>
                <span className="font-semibold text-slate-800 max-w-[120px] truncate">
                  {currentUser.fullName || currentUser.email}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentUser.role === "interviewer"
                      ? "bg-teal-100 text-teal-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {currentUser.role || "Candidate"}
                </span>
              </button>

              {/* Go to Dashboard Button */}
              <button
                onClick={goToDashboard}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>

              {/* Log Out */}
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth("login")}
                className="px-4 py-2 text-[15px] font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth("signup", "candidate")}
                className="px-6 py-2.5 text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser ? (
            <button
              onClick={goToDashboard}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth("login")}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg cursor-pointer"
            >
              Login
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-blue-600"
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            How It Works
          </a>
          <a
            href="#candidates"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            For Candidates
          </a>
          <a
            href="#interviewers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            For Interviewers
          </a>
          <Link
            href="/dashboard/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-rose-600 hover:text-rose-700"
          >
            Admin Dashboard
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    goToDashboard();
                  }}
                  className="w-full py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg"
                >
                  Open {currentUser.role === "interviewer" ? "Interviewer" : "Candidate"} Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("login");
                  }}
                  className="w-full py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("signup", "candidate");
                  }}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
