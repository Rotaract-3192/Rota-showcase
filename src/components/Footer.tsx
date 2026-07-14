"use client";

import React from "react";
import Link from "next/link";
import { Waves, Heart, Mail, MapPin, Globe } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide on auth, portal, and admin routes
  if (pathname.startsWith('/portal') || pathname.startsWith('/login') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="relative mt-auto border-t border-slate-800/40 bg-navy-deep/80 backdrop-blur-md overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-gradient-to-t from-electric-blue/5 to-transparent blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Brand Pitch */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-ocean-dark flex items-center justify-center">
                <Waves className="w-4 h-4 text-electric-blue" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-md font-bold tracking-wider text-white leading-none">
                  ROTARACT
                </span>
                <span className="font-metadata text-[9px] tracking-[0.2em] text-ocean-glow font-bold leading-tight">
                  DISTRICT 3192
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm font-body leading-relaxed">
              Creating a unified digital ecosystem to showcase the collective
              impact of Rotaract Clubs. Connecting drops of leadership to
              form an Ocean of Impact.
            </p>
            {/* Direct Contact Details */}
            <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-metadata">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-ocean-glow" />
                <span>District 3192 Headquarters, Bengaluru, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-ocean-glow" />
                <span>secretariat@rotaract3192.org</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-metadata text-xs font-bold uppercase tracking-wider text-white">
              Sitemap
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-electric-blue transition-colors">
                  Home Portfolio
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-electric-blue transition-colors">
                  Impact Projects
                </Link>
              </li>
              <li>
                <Link href="/clubs" className="hover:text-electric-blue transition-colors">
                  Rotaract Clubs
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-electric-blue transition-colors">
                  District Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Avenues */}
          <div className="flex flex-col gap-4">
            <h4 className="font-metadata text-xs font-bold uppercase tracking-wider text-white">
              Service Pillars
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li className="hover:text-ocean-glow transition-colors cursor-pointer">
                Community Service
              </li>
              <li className="hover:text-ocean-glow transition-colors cursor-pointer">
                Professional Development
              </li>
              <li className="hover:text-ocean-glow transition-colors cursor-pointer">
                International Collaboration
              </li>
              <li className="hover:text-ocean-glow transition-colors cursor-pointer">
                Environmental Support
              </li>
              <li className="hover:text-ocean-glow transition-colors cursor-pointer">
                Club Administration
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Sub-bar */}
        <div className="mt-16 pt-8 border-t border-slate-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-500 font-metadata">
            &copy; {currentYear} Rotaract District 3192. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-metadata">
            <span>Designed for transparency and community building with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
            <span>by District 3192 Team.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
