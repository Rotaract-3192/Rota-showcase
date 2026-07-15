"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WaveBackground from "@/components/WaveBackground";
import GlassPanel from "@/components/GlassPanel";
import { Waves, ArrowLeft, ArrowRight, UserPlus, CheckCircle2, Phone, User, LogIn, Mail } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<"login" | "request">("login");
  const [dbClubs, setDbClubs] = useState<{ id: string; name: string }[]>([]);
  const [clubsError, setClubsError] = useState<string | null>(null);
  
  // Fetch real clubs via server-side API route (bypasses CORS + RLS)
  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await fetch(apiUrl('/api/clubs'));
        if (!res.ok) {
          const json = await res.json();
          console.error('Clubs API error:', json);
          setClubsError('Could not load clubs. Please refresh.');
          return;
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setDbClubs(data);
        else if (Array.isArray(data) && data.length === 0) setClubsError('No clubs found in database.');
      } catch (e) {
        console.error('Clubs fetch exception:', e);
        setClubsError('Network error loading clubs.');
      }
    }
    fetchClubs();
  }, []);
  
  // Request State
  const [clubId, setClubId] = useState("");
  const [position, setPosition] = useState("President");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("1");
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubId || !position || !fullName || !email) {
      alert("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/access-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_id: clubId,
          requested_role: position,
          full_name: fullName,
          email,
          phone: phone || null,
          zone,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit');
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Failed to submit access request:", err);
      alert(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setClubId("");
    setPosition("President");
    setFullName("");
    setPhone("");
    setIsSubmitted(false);
    setView("login");
  };

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isUnauthorized = searchParams?.get("error") === "unauthorized";

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-12 overflow-hidden font-body">
      
      {isUnauthorized && (
        <div className="z-50 mb-6 bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl max-w-md w-full text-center text-sm font-bold shadow-xl animate-fade-in">
          ⚠️ Authentication Error: Your Clerk account is not linked to any active District Profile. 
          Please request access below first, or sign in with an approved email.
        </div>
      )}

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

            <div className="flex flex-col gap-5 mt-6">
              <Link
                href="/sign-in"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-electric-blue hover:bg-ocean-glow text-navy-deep font-bold text-xs uppercase tracking-wider transition-all focus:outline-none active:scale-95"
              >
                Sign In Securely
                <LogIn className="w-4 h-4" />
              </Link>
            </div>

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
                      {dbClubs.length === 0 ? (
                        <option value="" disabled>{clubsError ?? "Loading clubs..."}</option>
                      ) : (
                        <>
                          <option value="" disabled>Select your Club</option>
                          {dbClubs.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                    {clubsError && (
                      <p className="text-[10px] text-red-400 font-metadata">{clubsError}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Zone</label>
                    <select
                      required
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
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
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 mt-2 rounded-xl bg-electric-blue hover:bg-ocean-glow text-navy-deep font-bold text-xs uppercase tracking-wider transition-all focus:outline-none active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
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
