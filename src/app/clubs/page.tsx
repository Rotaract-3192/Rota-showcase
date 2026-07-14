"use client";

import React from "react";
import WaveBackground from "@/components/WaveBackground";
import ClubCard from "@/components/ClubCard";
import GlassPanel from "@/components/GlassPanel";
import { useStore, selectFilteredClubs } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { Trophy, Search, RefreshCcw, Landmark, MapPin, Award, Layers } from "lucide-react";

export default function ClubsPage() {
  const filteredClubs = useStore(useShallow(selectFilteredClubs));
  
  // Base store states & actions
  const { clubs, filters, setFilter, resetFilters } = useStore(useShallow((state) => ({
    clubs: state.clubs,
    filters: state.clubFilters,
    setFilter: state.setClubFilter,
    resetFilters: state.resetClubFilters,
  })));

  // Leaderboard lists (always computed from full clubs database, sorted by points then projects)
  const leaderboardSorted = [...clubs].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.totalProjects - a.totalProjects;
  });

  // Extract Podium (Top 3)
  const top1 = leaderboardSorted[0];
  const top2 = leaderboardSorted[1];
  const top3 = leaderboardSorted[2];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter("search", e.target.value);
  };

  const zones = ["Zone 1", "Zone 2", "Zone 3"];
  
  const getPresidentName = (leaders: { designation: string; name: string }[]) => {
    const pres = leaders.find(l => l.designation.toLowerCase().includes("president"));
    return pres ? pres.name : "N/A";
  };

  return (
    <div className="relative min-h-screen pb-24 px-6 md:px-8">
      {/* Dynamic water animation background */}
      <WaveBackground intensity={0.45} particleCount={25} />

      <div className="max-w-7xl mx-auto pt-12">
        {/* Editorial Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="font-metadata text-xs font-bold text-electric-blue uppercase tracking-widest">
            Network Footprint
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-white mt-2">
            Clubs & Rankings
          </h1>
          <p className="font-body text-slate-400 text-sm mt-3 leading-relaxed">
            District 3192 consists of community and institution-based Rotaract Clubs. 
            View their points rankings below, or search the directory.
          </p>
        </div>

        {/* ================= CLUB LEADERBOARD (PODIUM & LIST) ================= */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-10 pb-3 border-b border-slate-800/40 max-w-sm">
            <Trophy className="w-6 h-6 text-electric-blue" />
            <h2 className="font-headline text-2xl font-bold text-white">
              District Leaderboard
            </h2>
          </div>

          {/* 1. TOP 3 PODIUM LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end max-w-5xl mx-auto mb-12">
            
            {/* RANK #2 (Left Podium) */}
            {top2 && (
              <div className="order-2 lg:order-1 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-400/10 border border-slate-400/40 flex items-center justify-center font-metadata font-bold text-slate-300 text-sm mb-3">
                  #2
                </div>
                <GlassPanel
                  glowColor="white"
                  className="w-full text-center p-6 border-slate-400/20 bg-navy-dark/30 hover:border-slate-400/40"
                >
                  <img
                    src={top2.logo}
                    alt={top2.name}
                    className="w-16 h-16 rounded-full mx-auto object-cover border border-slate-700/60 p-0.5"
                  />
                  <h3 className="font-headline text-md font-bold text-white mt-4 line-clamp-1">
                    {top2.name}
                  </h3>
                  <p className="text-[10px] font-metadata text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    {getPresidentName(top2.leaders)}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-800/40 text-center text-xs font-metadata">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Projects Completed</p>
                    <p className="text-white font-bold text-sm">{top2.totalProjects}</p>
                  </div>
                </GlassPanel>
              </div>
            )}

            {/* RANK #1 (Center Podium - Taller and Glowing) */}
            {top1 && (
              <div className="order-1 lg:order-2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-electric-blue/15 border border-electric-blue/50 flex items-center justify-center font-metadata font-bold text-electric-blue text-lg mb-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  #1
                </div>
                <GlassPanel
                  glowColor="cyan"
                  className="w-full text-center p-8 border-electric-blue/35 bg-navy-dark/50 hover:border-electric-blue/50 lg:-translate-y-4 shadow-xl"
                >
                  <img
                    src={top1.logo}
                    alt={top1.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border border-electric-blue/40 p-0.5"
                  />
                  <h3 className="font-headline text-lg font-bold text-white mt-4 line-clamp-1">
                    {top1.name}
                  </h3>
                  <p className="text-[10px] font-metadata text-electric-blue mt-1 uppercase font-bold tracking-wider">
                    {getPresidentName(top1.leaders)}
                  </p>
                  <div className="mt-5 pt-4 border-t border-slate-800/40 text-center text-xs font-metadata">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Projects Completed</p>
                    <p className="text-electric-blue font-bold text-sm">{top1.totalProjects}</p>
                  </div>
                </GlassPanel>
              </div>
            )}

            {/* RANK #3 (Right Podium) */}
            {top3 && (
              <div className="order-3 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-700/10 border border-amber-700/40 flex items-center justify-center font-metadata font-bold text-amber-500 text-sm mb-3">
                  #3
                </div>
                <GlassPanel
                  glowColor="blue"
                  className="w-full text-center p-6 border-amber-700/25 bg-navy-dark/30 hover:border-amber-700/40"
                >
                  <img
                    src={top3.logo}
                    alt={top3.name}
                    className="w-16 h-16 rounded-full mx-auto object-cover border border-slate-700/60 p-0.5"
                  />
                  <h3 className="font-headline text-md font-bold text-white mt-4 line-clamp-1">
                    {top3.name}
                  </h3>
                  <p className="text-[10px] font-metadata text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    {getPresidentName(top3.leaders)}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-800/40 text-center text-xs font-metadata">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Projects Completed</p>
                    <p className="text-white font-bold text-sm">{top3.totalProjects}</p>
                  </div>
                </GlassPanel>
              </div>
            )}

          </div>
        </section>

        {/* ================= CLUB DIRECTORY (SEARCH, FILTER & GRID) ================= */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-3 border-b border-slate-800/40 max-w-sm">
            <Landmark className="w-6 h-6 text-electric-blue" />
            <h2 className="font-headline text-2xl font-bold text-white">
              Club Directory
            </h2>
          </div>

          {/* Directory Filters */}
          <GlassPanel className="p-5 mb-8 border-slate-800/60 bg-navy-dark/40 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search clubs by name or president..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <select
                value={filters.zone}
                onChange={(e) => setFilter("zone", e.target.value)}
                className="px-4 py-3 rounded-xl bg-navy-deep/80 border border-slate-800 text-xs text-slate-300 focus:border-electric-blue/40 focus:outline-none min-w-[140px] flex-grow sm:flex-grow-0"
              >
                <option value="">All Zones</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>

              <button
                onClick={resetFilters}
                className="p-3 rounded-xl border border-slate-800/60 bg-navy-dark/40 hover:bg-navy-light text-slate-400 hover:text-white transition-all active:scale-95 focus:outline-none"
                aria-label="Reset filters"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
          </GlassPanel>

          {/* Directory Cards Grid */}
          {filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club, idx) => {
                // Find rank in full leaderboard sorted list
                const fullRank = leaderboardSorted.findIndex((c) => c.id === club.id) + 1;
                return <ClubCard key={club.id} club={club} rank={fullRank} />;
              })}
            </div>
          ) : (
            <GlassPanel className="p-16 text-center flex flex-col items-center justify-center border-slate-800/40 bg-navy-dark/20 min-h-[200px]">
              <h3 className="font-headline text-lg font-bold text-white mb-2">No clubs found</h3>
              <p className="text-slate-400 font-body text-xs max-w-xs mb-6">
                Adjust your search phrase or zone filter to discover clubs.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-electric-blue text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-ocean-glow transition-all"
              >
                Reset Filters
              </button>
            </GlassPanel>
          )}
        </section>
      </div>
    </div>
  );
}
