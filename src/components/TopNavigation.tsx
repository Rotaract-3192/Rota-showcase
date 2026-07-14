"use client";

import React from "react";
import { Search, Bell, User } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePortalUser } from "./PortalUserProvider";

export default function TopNavigation() {
  const { user } = usePortalUser();
  return (
    <header className="h-20 border-b border-slate-800/60 bg-navy-deep/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search activities, clubs, or members..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-navy-dark/60 border border-slate-800/80 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-ocean-glow rounded-full animate-pulse" />
        </button>

        <div className="h-6 w-px bg-slate-800/80" />

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
    </header>
  );
}
