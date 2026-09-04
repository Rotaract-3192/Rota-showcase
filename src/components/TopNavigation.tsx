"use client";

import React, { useEffect, useState } from "react";
import { Search, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { usePortalUser } from "./PortalUserProvider";
import NotificationBell from "./NotificationBell";
import { cn } from "@/lib/utils";

const portalLinks = [
  { name: "Dashboard", href: "/portal/dashboard" },
  { name: "Announcements", href: "/portal/announcements" },
  { name: "Club Members", href: "/portal/members" },
  { name: "Club Activities", href: "/portal/activities" },
  { name: "Orientations", href: "/portal/orientations" },
  { name: "Installations", href: "/portal/installations" },
  { name: "Meetings", href: "/portal/meetings" },
  { name: "DOV", href: "/portal/dov" },
  { name: "Bulletin", href: "/portal/bulletin" },
  { name: "Settings", href: "/portal/settings" },
];

export default function TopNavigation() {
  const { user } = usePortalUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="h-20 border-b border-slate-800/60 bg-navy-deep/80 backdrop-blur-md flex items-center justify-between gap-3 px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4 min-w-0 shrink-0">
        <Link
          href="/portal/dashboard"
          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-electric-blue text-navy-deep text-xs font-bold uppercase tracking-wider hover:bg-ocean-glow transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative max-w-md w-full hidden sm:block min-w-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search activities, clubs, or members..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-navy-dark/60 border border-slate-800/80 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        <NotificationBell />

        <div className="h-6 w-px bg-slate-800/80 hidden sm:block" />

        <div className="flex items-center gap-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white group-hover:text-electric-blue transition-colors">
              Rtr. {user?.name || "Member"}
            </p>
            <p className="text-[10px] font-metadata text-slate-500 uppercase">
              {user?.role || "Member"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-navy-dark border border-slate-700/60 flex items-center justify-center overflow-hidden">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-20 z-40 border-t border-slate-800/60 bg-navy-deep/95 backdrop-blur-xl p-4 flex flex-col gap-1">
          {portalLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-electric-blue/10 text-electric-blue"
                    : "text-slate-300 hover:text-white hover:bg-navy-dark"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
