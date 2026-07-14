"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Waves, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Clubs", href: "/clubs" },
  { name: "Leaderboard", href: "/leaderboard" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hide on auth, portal, and admin routes
  if (pathname.startsWith('/portal') || pathname.startsWith('/login') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
        scrolled
          ? "py-3 bg-navy-dark/80 backdrop-blur-md border-b border-ocean-glow/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "py-6 bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
        {/* District Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue to-ocean-dark p-0.5 shadow-lg shadow-electric-blue/10">
            <div className="w-full h-full bg-navy-deep rounded-[10px] flex items-center justify-center transition-transform group-hover:scale-95 duration-300">
              <Waves className="w-5 h-5 text-electric-blue group-hover:text-ocean-glow transition-colors duration-300" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-electric-blue/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold tracking-wider text-white leading-none">
              ROTARACT
            </span>
            <span className="font-metadata text-[10px] tracking-[0.2em] text-ocean-glow font-bold leading-tight">
              DISTRICT 3192
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 px-1.5 py-1 rounded-full bg-navy-dark/30 border border-slate-800/40 backdrop-blur-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 relative",
                  isActive
                    ? "text-electric-blue"
                    : "text-slate-300 hover:text-white"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-ocean-glow/10 rounded-full border border-electric-blue/20 -z-10" />
                )}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Login */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-white overflow-hidden glass-panel border border-electric-blue/20 hover:border-electric-blue/50 transition-all duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-ocean-glow/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            Login
            <ArrowRight className="w-3.5 h-3.5 text-ocean-glow group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] z-40 w-full bg-navy-deep/95 backdrop-blur-xl border-t border-slate-800/60 flex flex-col p-6 animate-fade-in">
          <nav className="flex flex-col gap-4 mt-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xl font-headline font-bold py-3 border-b border-slate-800/40 tracking-wide",
                    isActive ? "text-electric-blue" : "text-slate-300"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="mt-8 flex items-center justify-between px-6 py-4 rounded-xl bg-gradient-to-r from-electric-blue/15 to-ocean-glow/10 border border-electric-blue/30 text-white font-semibold text-lg"
            >
              <span>Login Portal</span>
              <ArrowRight className="w-5 h-5 text-electric-blue" />
            </Link>
          </nav>
          
          <div className="mt-auto pb-8 text-center">
            <span className="text-xs font-metadata text-slate-500">
              Rotaract District 3192 • Ocean of Impact
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
