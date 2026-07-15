"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  Calendar,
  Award,
  Settings,
  LogOut,
  ArrowLeft,
  BookOpen,
  Tent,
  FileText,
  Megaphone
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
    { name: "Announcements", href: "/portal/announcements", icon: Megaphone },
    { name: "Club Members", href: "/portal/members", icon: Users },
    { name: "Club Activities", href: "/portal/activities", icon: Layers },
    { name: "Orientations", href: "/portal/orientations", icon: BookOpen },
    { name: "Installations", href: "/portal/installations", icon: Tent },
    { name: "Meetings", href: "/portal/meetings", icon: Calendar },
    { name: "DOV", href: "/portal/dov", icon: Award },
    { name: "Bulletin", href: "/portal/bulletin", icon: FileText },
  ];

  const bottomItems = [
    { name: "Settings", href: "/portal/settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-deep/95 backdrop-blur-xl border-r border-slate-800/60 flex flex-col z-40 hidden md:flex transition-all">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center">
            <Layers className="w-4 h-4 text-electric-blue" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-white tracking-wide text-sm">
              DISTRICT 3192
            </h2>
            <p className="font-metadata text-[10px] text-ocean-glow uppercase tracking-wider font-bold">
              Command Center
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-4 overflow-y-auto space-y-1">
        <div className="text-[10px] font-metadata text-slate-500 uppercase font-bold tracking-widest px-3 mb-4">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-300 ${
                isActive
                  ? "bg-electric-blue/10 text-electric-blue font-semibold border border-electric-blue/20"
                  : "text-slate-400 hover:text-white hover:bg-navy-dark"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-electric-blue" : ""}`} />
              {item.name}
            </Link>
          );
        })}

        <div className="text-[10px] font-metadata text-slate-500 uppercase font-bold tracking-widest px-3 mt-8 mb-4">
          Administration
        </div>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-300 ${
                isActive
                  ? "bg-electric-blue/10 text-electric-blue font-semibold border border-electric-blue/20"
                  : "text-slate-400 hover:text-white hover:bg-navy-dark"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-electric-blue" : ""}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800/60 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-metadata font-bold text-slate-400 hover:text-white hover:bg-navy-dark transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Showcase
        </Link>
      </div>
    </aside>
  );
}
