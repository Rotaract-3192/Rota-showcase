"use client";

import React from "react";
import WaveBackground from "@/components/WaveBackground";
import ProjectCard from "@/components/ProjectCard";
import GlassPanel from "@/components/GlassPanel";
import { useStore, selectFilteredProjects } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { Search, SlidersHorizontal, RefreshCcw, FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  const projects = useStore(useShallow(selectFilteredProjects));
  const { clubs, filters, setFilter, resetFilters } = useStore(useShallow((state) => ({
    clubs: state.clubs,
    filters: state.projectFilters,
    setFilter: state.setProjectFilter,
    resetFilters: state.resetProjectFilters,
  })));

  const avenues = [
    "Club Service",
    "Community Service",
    "Professional Development",
    "International Service",
    "Public Relations",
    "Public Image",
    "Next Gen",
  ];

  const focusAreas = [
    "Peacebuilding",
    "Disease Prevention",
    "Water & Sanitation",
    "Maternal & Child Health",
    "Education & Literacy",
    "Community Economic Development",
    "Environmental Support",
  ];

  const zones = ["Zone 1", "Zone 2", "Zone 3"];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter("search", e.target.value);
  };

  return (
    <div className="relative min-h-screen pb-24 px-6 md:px-8">
      {/* Floating Canvas waves */}
      <WaveBackground intensity={0.4} particleCount={20} />

      <div className="max-w-7xl mx-auto pt-12">
        {/* Page Editorial Header */}
        <div className="mb-12">
          <span className="font-metadata text-xs font-bold text-electric-blue uppercase tracking-widest">
            Discovery Hub
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-white mt-2">
            Impact Showcase
          </h1>
          <p className="font-body text-slate-400 text-sm mt-3 max-w-2xl leading-relaxed">
            Discover community initiatives, professional programs, and ecological campaigns 
            executed by Rotaract Clubs. Drill down using search or advanced filters.
          </p>
        </div>

        {/* ================= SEARCH & FILTERS DASHBOARD ================= */}
        <GlassPanel className="p-6 mb-8 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
          {/* Top row: Search input + Reset Button */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search projects by title, description, or club..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-navy-deep/60 border border-slate-800/80 focus:border-electric-blue/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>
            
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-800/60 hover:border-slate-600 bg-navy-dark/40 hover:bg-navy-light text-xs font-metadata font-bold text-slate-400 hover:text-white transition-all focus:outline-none active:scale-95 flex-shrink-0"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>

          {/* Bottom row: advanced select lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filter by Club */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Club</label>
              <select
                value={filters.club}
                onChange={(e) => setFilter("club", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-800 text-xs text-slate-300 focus:border-electric-blue/40 focus:outline-none"
              >
                <option value="">All Clubs</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Avenue */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Avenue of Service</label>
              <select
                value={filters.avenue}
                onChange={(e) => setFilter("avenue", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-800 text-xs text-slate-300 focus:border-electric-blue/40 focus:outline-none"
              >
                <option value="">All Avenues</option>
                {avenues.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Area of Focus */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Area of Focus</label>
              <select
                value={filters.focus}
                onChange={(e) => setFilter("focus", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-800 text-xs text-slate-300 focus:border-electric-blue/40 focus:outline-none"
              >
                <option value="">All Areas</option>
                {focusAreas.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Zone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Zone</label>
              <select
                value={filters.zone}
                onChange={(e) => setFilter("zone", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-800 text-xs text-slate-300 focus:border-electric-blue/40 focus:outline-none"
              >
                <option value="">All Zones</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Date */}
            <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Date Uploaded</label>
              <select
                value={filters.date}
                onChange={(e) => setFilter("date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-800 text-xs text-slate-300 focus:border-electric-blue/40 focus:outline-none"
              >
                <option value="all">Any Date</option>
                <option value="recent">Recent (Past 60 days)</option>
                <option value="older">Older</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        {/* ================= RESULTS COUNTER & GRID ================= */}
        <div className="flex items-center justify-between mb-6 font-metadata text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{projects.length}</strong> project
            {projects.length !== 1 && "s"}
          </span>
          <span className="text-slate-500">Sorted by Impact Score</span>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <GlassPanel className="p-16 text-center flex flex-col items-center justify-center border-slate-800/40 bg-navy-dark/20 min-h-[300px]">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/45 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-4">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="font-headline text-xl font-bold text-white mb-2">
              No matching projects
            </h3>
            <p className="text-slate-400 font-body text-sm max-w-sm mb-6 leading-relaxed">
              We couldn&apos;t find any showcase projects matching your current filters.
              Try adjusting the parameters or resetting the filters.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-electric-blue text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-ocean-glow transition-all"
            >
              Reset Filters
            </button>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
