"use client";

import React from "react";
import { Club } from "@/store/useStore";
import GlassPanel from "./GlassPanel";
import { Award, Briefcase, User, MapPin } from "lucide-react";

interface ClubCardProps {
  club: Club;
  rank?: number;
}

export default function ClubCard({ club, rank }: ClubCardProps) {
  return (
    <GlassPanel
      hoverEffect
      glowColor="cyan"
      className="relative flex flex-col justify-between h-full p-6"
    >
      {/* Rank badge for leaderboard integrations */}
      {rank && (
        <span className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full bg-electric-blue/10 border border-electric-blue/30 text-electric-blue font-metadata text-[10px] font-bold shadow-sm">
          #{rank}
        </span>
      )}

      <div className="flex flex-col gap-5">
        {/* Header Block */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-700/60 bg-navy-medium p-0.5 shadow-md">
            <img
              src={club.logo}
              alt={club.name}
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-headline text-md font-bold text-white leading-snug group-hover:text-electric-blue transition-colors duration-300">
              {club.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-metadata text-slate-400">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{club.zone}</span>
              <span className="text-slate-600">•</span>
              <span>Est. {club.charterYear}</span>
            </div>
          </div>
        </div>

        {/* Leaders Info */}
        <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl bg-navy-dark/40 border border-slate-800/60 font-body text-xs text-slate-300">
          {club.leaders.slice(0, 3).map((leader, i) => (
            <div key={i} className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-ocean-glow shrink-0" />
              <span className="text-slate-500 mr-1 min-w-[70px]">{leader.designation}:</span>
              <span className="font-semibold text-white truncate">{leader.name}</span>
            </div>
          ))}
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-400 leading-relaxed font-body line-clamp-2">
          {club.description}
        </p>
      </div>

      {/* Metric details */}
      <div className="mt-6 pt-5 border-t border-slate-800/40 text-xs font-metadata flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <Briefcase className="w-4 h-4 text-electric-blue" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Projects Completed</span>
        </div>
        <span className="text-sm font-bold text-white">
          {club.totalProjects} Projects
        </span>
      </div>
    </GlassPanel>
  );
}
