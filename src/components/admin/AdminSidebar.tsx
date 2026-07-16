"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart4, 
  ShieldCheck, 
  Building2, 
  Users, 
  Layers, 
  Trophy, 
  CalendarDays, 
  Megaphone, 
  FileText, 
  Settings, 
  ClipboardList, 
  BrainCircuit,
  LogOut,
  Waves,
  UserCircle,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "District Analytics", href: "/admin/analytics", icon: BarChart4 },
  { name: "Clubs", href: "/admin/clubs", icon: Building2 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Access Requests", href: "/admin/access-requests", icon: ShieldCheck },
  { name: "Activities Review", href: "/admin/activities", icon: ClipboardList },
  { name: "Project Moderation", href: "/admin/projects", icon: Layers },
  { name: "Operations Review", href: "/admin/operations", icon: Briefcase },
  { name: "Publications", href: "/admin/publications", icon: FileText },
  { name: "Leaderboard Engine", href: "/admin/leaderboard-engine", icon: Trophy },
  { name: "District Calendar", href: "/admin/calendar", icon: CalendarDays },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Report Center", href: "/admin/reports", icon: FileText },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
  { name: "AI Command", href: "/admin/ai-command", icon: BrainCircuit },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 border-r border-slate-800/60 bg-navy-deep/80 backdrop-blur-xl flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-800/60 flex items-center px-6">
        <Link 
          href="/admin/dashboard" 
          onClick={onClose}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-ocean-dark flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-navy-deep rounded-md flex items-center justify-center transition-transform group-hover:scale-95">
              <Waves className="w-4 h-4 text-electric-blue" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-sm font-bold text-white tracking-wider leading-none">
              MISSION CONTROL
            </span>
            <span className="font-metadata text-[8px] text-electric-blue tracking-[0.2em] uppercase font-bold leading-tight mt-0.5">
              District 3192 Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-metadata text-xs tracking-wide transition-all duration-200 group relative",
                isActive
                  ? "bg-electric-blue/10 text-electric-blue font-bold shadow-[inset_0_0_10px_rgba(0,240,255,0.05)]"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 font-medium"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-electric-blue rounded-r-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              )}
              <Icon className={cn("w-4 h-4", isActive ? "text-electric-blue" : "text-slate-500 group-hover:text-slate-300")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile area */}
      <div className="p-4 border-t border-slate-800/60 flex flex-col gap-2">
        <Link 
          href="/admin/profile"
          onClick={onClose}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-bold text-white truncate">Super Admin</p>
            <p className="text-[10px] text-slate-500 font-metadata truncate">admin@rotaract3192.org</p>
          </div>
        </Link>
        
        <Link 
          href="/"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 font-metadata font-bold hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit Command Center
        </Link>
      </div>

    </aside>
  );
}
