"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WaveBackground from "@/components/WaveBackground";
import GlassPanel from "@/components/GlassPanel";
import { Waves, Mail, Lock, ArrowLeft, ArrowRight, UserPlus, Info, CheckCircle2, Phone, User } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth();
  const [view, setView] = useState<"login" | "request">("login");
  const clubs = useStore((state) => state.clubs);
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Request State
  const [clubId, setClubId] = useState("");
  const [position, setPosition] = useState("President");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setClubId("");
    setPosition("President");
    setFullName("");
    setPhone("");
    setIsSubmitted(false);
    setView("login");
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-6 py-12 overflow-hidden font-body">
      {/* Floating Wave Background */}
      <WaveBackground intensity={0.5} particleCount={25} />

      {/* Ambient Radial glow behind login box */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-electric-blue/5 blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md z-10">
        
        {/* Return to Showcase Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-metadata font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-6 group focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Showcase
        </Link>

        {/* LOG IN CARD PANEL */}
        {view === "login" ? (
          <GlassPanel glowColor="cyan" className="p-8 border-electric-blue/20 bg-navy-dark/60 shadow-2xl">
            {/* Brand Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue to-ocean-dark flex items-center justify-center mx-auto mb-4">
                <Waves className="w-6 h-6 text-electric-blue" />
              </div>
              <h2 className="font-headline text-2xl font-bold text-white">District Command Center</h2>
              <p className="text-xs text-slate-400 font-body mt-2 leading-relaxed">
                Log in to submit activities, track your club's analytics, and view district-wide insights.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="clubname@rotaract3192.org"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Password</label>
                  <a href="#" className="text-[10px] text-ocean-glow hover:underline font-metadata font-bold">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {authError && (
                <div className="text-red-500 text-[10px] font-bold text-center mt-2 font-metadata uppercase tracking-wider border border-red-500/20 bg-red-500/10 py-2 rounded-lg">
                  {authError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 mt-4 rounded-xl bg-electric-blue hover:bg-ocean-glow text-navy-deep font-bold text-xs uppercase tracking-wider transition-all focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Authenticating..." : "Enter Dashboard"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Navigation to Access Request */}
            <div className="mt-8 pt-6 border-t border-slate-800/40 text-center font-metadata text-xs">
              <span className="text-slate-500">Need admin access for your club?</span>
              <button
                onClick={() => setView("request")}
                className="ml-1.5 text-electric-blue hover:underline font-bold inline-flex items-center gap-1 focus:outline-none"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Request Access
              </button>
            </div>
          </GlassPanel>
        ) : (
          /* REQUEST ACCESS CONSOLE */
          <GlassPanel glowColor="blue" className="p-8 border-slate-800 bg-navy-dark/60 shadow-2xl">
            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="font-headline text-2xl font-bold text-white">Request Platform Access</h2>
                  <p className="text-xs text-slate-400 font-body mt-2 leading-relaxed">
                    District administrators will review and provision credentials upon verification.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Club Selection</label>
                    <select
                      required
                      value={clubId}
                      onChange={(e) => setClubId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                    >
                      <option value="" disabled>Select your Club</option>
                      {clubs.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Position</label>
                    <select
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                    >
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Secretary">Secretary</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rtr. Jane Doe"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pres.club@gmail.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 mt-2 rounded-xl bg-electric-blue hover:bg-ocean-glow text-navy-deep font-bold text-xs uppercase tracking-wider transition-all focus:outline-none active:scale-95"
                  >
                    Submit Request
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* Success Screen */
              <div className="text-center py-6 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
                <h3 className="font-headline text-xl font-bold text-white mb-2">Request Submitted</h3>
                <p className="text-slate-300 font-body text-xs leading-relaxed max-w-xs mb-8">
                  Thank you! The request has been logged. 
                  District Secretariat will audit the validity and issue login credentials to 
                  <strong> {email}</strong> shortly.
                </p>
                
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-metadata text-xs font-bold uppercase tracking-wider transition-all focus:outline-none"
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* Back trigger */}
            {!isSubmitted && (
              <div className="mt-8 pt-6 border-t border-slate-800/40 text-center font-metadata text-xs">
                <button
                  onClick={() => setView("login")}
                  className="text-slate-400 hover:text-white transition-colors font-bold focus:outline-none"
                >
                  Cancel and Go Back
                </button>
              </div>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
