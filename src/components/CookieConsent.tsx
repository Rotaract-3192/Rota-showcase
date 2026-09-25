"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "rota3192_cookie_ack_v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 md:p-6 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto rounded-2xl border border-slate-700/80 bg-navy-dark/95 backdrop-blur-md shadow-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-xs text-slate-300 font-body leading-relaxed flex-1">
          We use essential cookies for secure sign-in (Clerk) and session management.
          No advertising cookies. See our{" "}
          <Link href="/privacy" className="text-electric-blue hover:underline font-semibold">
            Privacy Notice
          </Link>{" "}
          under India&apos;s Digital Personal Data Protection Act, 2023.
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-electric-blue text-navy-deep text-xs font-bold uppercase tracking-wider hover:bg-ocean-glow transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
