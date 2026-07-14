"use client";

import React, { useState } from "react";
import WaveBackground from "@/components/WaveBackground";
import GlassPanel from "@/components/GlassPanel";
import ProjectCard from "@/components/ProjectCard";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import {
  Trophy,
  Award,
  Clock,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";

type TabId = "clubs" | "projects" | "hours" | "beneficiaries" | "scores";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("clubs");
  const { projects, clubs, setSelectedProjectId } = useStore(useShallow((state) => ({
    projects: state.projects,
    clubs: state.clubs,
    setSelectedProjectId: state.setSelectedProjectId,
  })));

  // Calculations
  const topClubs = [...clubs].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.totalProjects - a.totalProjects;
  }).slice(0, 3);

  const topProjects = [...projects].sort((a, b) => {
    if (b.impactScore !== a.impactScore) {
      return b.impactScore - a.impactScore;
    }
    return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
  });

  const mostHours = [...projects].sort((a, b) => b.volunteerHours - a.volunteerHours);

  const mostBeneficiaries = [...projects].sort((a, b) => b.beneficiaries - a.beneficiaries);

  const highestScoreList = [...projects].sort((a, b) => b.impactScore - a.impactScore);

  const tabs = [
    { id: "clubs" as TabId, label: "Top Clubs", icon: Trophy },
    { id: "projects" as TabId, label: "Top Projects", icon: Layers },
    { id: "hours" as TabId, label: "Most Volunteer Hours", icon: Clock },
    { id: "beneficiaries" as TabId, label: "Most Beneficiaries", icon: Users },
    { id: "scores" as TabId, label: "Highest Impact Score", icon: Award },
  ];

  return (
    <div className="relative min-h-screen pb-24 px-6 md:px-8">
      {/* Floating Canvas particles */}
      <WaveBackground intensity={0.4} particleCount={22} />

      <div className="max-w-7xl mx-auto pt-12">
        {/* Page Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="font-metadata text-xs font-bold text-electric-blue uppercase tracking-widest">
            Performative Excellence
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-white mt-2">
            Main Leaderboard
          </h1>
          <p className="font-body text-slate-400 text-sm mt-3 leading-relaxed">
            Real-time rankings showing club achievements and project output metrics 
            across District 3192. Click items to drill down.
          </p>
        </div>

        {/* ================= LEADERBOARD NAVIGATION TABS ================= */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-full border text-[10px] sm:text-xs font-metadata font-bold tracking-wider uppercase transition-all duration-300 focus:outline-none ${
                  isActive
                    ? "bg-gradient-to-r from-electric-blue/15 to-ocean-glow/15 border-electric-blue text-electric-blue shadow-[0_0_15px_rgba(0,240,255,0.08)]"
                    : "bg-navy-dark/30 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= RANKINGS PANEL ================= */}
        <div className="max-w-5xl mx-auto">
          {/* TAB 1: CLUBS */}
          {activeTab === "clubs" && (
            <GlassPanel className="p-0 border-slate-800/60 overflow-hidden bg-navy-dark/20 animate-fade-in">
              <div className="p-6 border-b border-slate-800/40 bg-navy-dark/30 flex items-center justify-between">
                <h2 className="font-headline text-xl font-bold text-white">Top Performing Clubs</h2>
                <span className="text-xs font-metadata text-slate-500">Sorted by Rank</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-metadata whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-navy-dark/10 text-slate-500 font-bold uppercase">
                      <th className="py-4 px-6 w-16 text-center">Rank</th>
                      <th className="py-4 px-6">Club Name</th>
                      <th className="py-4 px-6">Zone</th>
                      <th className="py-4 px-6 text-right">Projects Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {topClubs.map((club, index) => (
                      <tr key={club.id} className="hover:bg-navy-light/10 transition-colors">
                        <td className="py-4 px-6 text-center font-bold text-slate-400">
                          #{index + 1}
                        </td>
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img
                            src={club.logo}
                            alt={club.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-headline font-bold text-white text-sm">
                              {club.name}
                            </p>
                            <div className="flex flex-col text-[10px] text-slate-500 font-metadata mt-1 uppercase font-bold tracking-wider">
                            {club.leaders.slice(0, 2).map((l, i) => (
                              <span key={i}>{l.designation}: {l.name}</span>
                            ))}
                          </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-400">{club.zone}</td>
                        <td className="py-4 px-6 text-right font-bold text-white">
                          {club.totalProjects} Projects
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === "projects" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {topProjects.map((project, idx) => (
                <div key={project.id} className="relative group">
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-navy-dark/90 border border-electric-blue/40 text-electric-blue flex items-center justify-center font-metadata text-[10px] font-bold pointer-events-none transition-transform duration-300 group-hover:-translate-y-2">
                    #{idx + 1}
                  </div>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: MOST VOLUNTEER HOURS */}
          {activeTab === "hours" && (
            <GlassPanel className="p-0 border-slate-800/60 overflow-hidden bg-navy-dark/20 animate-fade-in">
              <div className="p-6 border-b border-slate-800/40 bg-navy-dark/30 flex items-center justify-between">
                <h2 className="font-headline text-xl font-bold text-white">Volunteer Hours Leaderboard</h2>
                <span className="text-xs font-metadata text-slate-500">Sorted by Hours</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-metadata whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-navy-dark/10 text-slate-500 font-bold uppercase">
                      <th className="py-4 px-6 w-16 text-center">Rank</th>
                      <th className="py-4 px-6">Project Title</th>
                      <th className="py-4 px-6">Club Name</th>
                      <th className="py-4 px-6 text-center">Beneficiaries</th>
                      <th className="py-4 px-6 text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {mostHours.map((project, index) => (
                      <tr
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className="hover:bg-navy-light/10 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6 text-center font-bold text-slate-400">
                          #{index + 1}
                        </td>
                        <td className="py-4 px-6 font-headline font-bold text-white text-sm group-hover:text-electric-blue transition-colors">
                          {project.title}
                        </td>
                        <td className="py-4 px-6 text-slate-400">{project.clubName}</td>
                        <td className="py-4 px-6 text-center font-bold text-slate-300">
                          {project.beneficiaries.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-electric-blue">
                          {project.volunteerHours} Hrs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          )}

          {/* TAB 4: MOST BENEFICIARIES */}
          {activeTab === "beneficiaries" && (
            <GlassPanel className="p-0 border-slate-800/60 overflow-hidden bg-navy-dark/20 animate-fade-in">
              <div className="p-6 border-b border-slate-800/40 bg-navy-dark/30 flex items-center justify-between">
                <h2 className="font-headline text-xl font-bold text-white">Beneficiary Impact Leaderboard</h2>
                <span className="text-xs font-metadata text-slate-500">Sorted by Reached</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-metadata whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-navy-dark/10 text-slate-500 font-bold uppercase">
                      <th className="py-4 px-6 w-16 text-center">Rank</th>
                      <th className="py-4 px-6">Project Title</th>
                      <th className="py-4 px-6">Club Name</th>
                      <th className="py-4 px-6 text-center">Volunteers</th>
                      <th className="py-4 px-6 text-right">Beneficiaries Reached</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {mostBeneficiaries.map((project, index) => (
                      <tr
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className="hover:bg-navy-light/10 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6 text-center font-bold text-slate-400">
                          #{index + 1}
                        </td>
                        <td className="py-4 px-6 font-headline font-bold text-white text-sm group-hover:text-electric-blue transition-colors">
                          {project.title}
                        </td>
                        <td className="py-4 px-6 text-slate-400">{project.clubName}</td>
                        <td className="py-4 px-6 text-center font-bold text-slate-300">
                          {project.volunteerCount} Vols
                        </td>
                        <td className="py-4 px-6 text-right font-black text-electric-blue">
                          {project.beneficiaries.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          )}

          {/* TAB 5: HIGHEST IMPACT SCORE */}
          {activeTab === "scores" && (
            <GlassPanel className="p-0 border-slate-800/60 overflow-hidden bg-navy-dark/20 animate-fade-in">
              <div className="p-6 border-b border-slate-800/40 bg-navy-dark/30 flex items-center justify-between">
                <h2 className="font-headline text-xl font-bold text-white">Impact Assessment Scorecard</h2>
                <span className="text-xs font-metadata text-slate-500">Sorted by Impact Score</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-metadata whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-navy-dark/10 text-slate-500 font-bold uppercase">
                      <th className="py-4 px-6 w-16 text-center">Rank</th>
                      <th className="py-4 px-6">Project Title</th>
                      <th className="py-4 px-6">Club Name</th>
                      <th className="py-4 px-6">Avenue Of Service</th>
                      <th className="py-4 px-6 text-right">Impact Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {highestScoreList.map((project, index) => (
                      <tr
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className="hover:bg-navy-light/10 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6 text-center font-bold text-slate-400">
                          #{index + 1}
                        </td>
                        <td className="py-4 px-6 font-headline font-bold text-white text-sm group-hover:text-electric-blue transition-colors">
                          {project.title}
                        </td>
                        <td className="py-4 px-6 text-slate-400">{project.clubName}</td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded bg-navy-dark border border-slate-800 text-[9px] uppercase font-bold text-slate-400">
                            {project.avenueOfService}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-electric-blue text-sm">
                          {project.impactScore}/100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          )}

        </div>
      </div>
    </div>
  );
}
