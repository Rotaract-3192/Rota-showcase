"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, Command, ChevronRight, Menu } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

interface AdminTopNavProps {
  onMenuClick: () => void;
}

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  const pathname = usePathname();
  
  // Create breadcrumbs from pathname
  const paths = pathname.split('/').filter(Boolean);
  
  return (
    <header className="h-16 border-b border-slate-800/60 bg-navy-deep/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 md:px-6">
      
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-lg border border-slate-700 bg-navy-dark/40 hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center text-xs font-metadata text-slate-500 gap-2">
          <span className="text-slate-400">Admin</span>
          {paths.map((path, index) => {
            if (path === 'admin') return null; // skip root
            const isLast = index === paths.length - 1;
            const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
            
            return (
              <React.Fragment key={path}>
                <ChevronRight className="w-3 h-3" />
                <span className={isLast ? "text-electric-blue font-bold tracking-wider uppercase" : "text-slate-400 tracking-wider uppercase"}>
                  {formattedPath}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Command Palette Trigger */}
        <button className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-lg border border-slate-700/60 bg-navy-dark/40 hover:bg-navy-light/20 hover:border-slate-600 transition-colors text-slate-400 group">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-electric-blue transition-colors" />
            <span className="text-xs font-body">Search district...</span>
          </div>
          <div className="flex items-center gap-1 opacity-70">
            <kbd className="inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800/50 px-1.5 font-mono text-[10px] font-medium text-slate-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </kbd>
          </div>
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

      </div>
    </header>
  );
}
