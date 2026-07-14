"use client";

import React, { useState } from "react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import GlassPanel from "@/components/GlassPanel";
import { useStore, Club } from "@/store/useStore";
import { 
  ShieldCheck, 
  MoreHorizontal, 
  ExternalLink, 
  Download,
  ArrowLeft,
  Building2,
  Users,
  Trophy,
  Layers,
  Mail,
  Calendar,
  Award
} from "lucide-react";

export default function AdminClubsPage() {
  const clubs = useStore((state) => state.clubs);
  const projects = useStore((state) => state.projects);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const setSelectedProjectId = useStore((state) => state.setSelectedProjectId);

  const sortedClubs = [...clubs].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.totalProjects - a.totalProjects;
  });

  const filteredClubs = sortedClubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    club.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If a club is selected, render the Club Details View
  if (selectedClubId) {
    const club = clubs.find((c) => c.id === selectedClubId);
    
    if (club) {
      const clubProjects = projects.filter((p) => p.clubId === club.id);
      const rank = sortedClubs.findIndex(c => c.id === club.id) + 1;
      
      const mockMembers = [
        { name: "Rtr. Rajesh Kumar", role: "President", email: `${club.id}_pres@rotaract.org` },
        { name: "Rtr. Sneha Patel", role: "Secretary", email: `${club.id}_sec@rotaract.org` },
        { name: "Rtr. Amit Sharma", role: "Treasurer", email: `${club.id}_tres@rotaract.org` },
        { name: "Rtr. Priya Rao", role: "Public Image Chair", email: `${club.id}_pi@rotaract.org` }
      ];

      return (
        <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-12 animate-fade-in">
          <div>
            <button 
              onClick={() => setSelectedClubId(null)}
              className="inline-flex items-center gap-2 text-xs font-metadata font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Clubs Directory
            </button>
          </div>

          {/* Profile Header */}
          <GlassPanel className="p-6 md:p-8 border-slate-800/60 bg-navy-dark/40 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-20 h-20 rounded-2xl bg-navy-deep border border-slate-800 flex items-center justify-center p-2 shrink-0">
                {club.logo ? (
                  <img src={club.logo} alt={club.name} className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                  {club.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs font-metadata">
                  <span className="text-electric-blue font-bold uppercase tracking-wider">{club.zone}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {club.email}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Chartered {club.charterYear}
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-metadata uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" /> Active Status
            </span>
          </GlassPanel>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">District Standings</span>
                <span className="text-2xl font-headline font-bold text-white">Rank #{rank}</span>
              </div>
              <Trophy className="w-8 h-8 text-amber-500 opacity-20" />
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Leaderboard Score</span>
                <span className="text-2xl font-headline font-bold text-electric-blue">{club.totalPoints.toLocaleString()} pts</span>
              </div>
              <Award className="w-8 h-8 text-electric-blue opacity-20" />
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Registered Members</span>
                <span className="text-2xl font-headline font-bold text-white">{club.memberCount} Members</span>
              </div>
              <Users className="w-8 h-8 text-pink-500 opacity-20" />
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Showcase Projects</span>
                <span className="text-2xl font-headline font-bold text-white">{club.totalProjects} Completed</span>
              </div>
              <Layers className="w-8 h-8 text-emerald-400 opacity-20" />
            </GlassPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* About & Office Bearers */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* About */}
              <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4">
                <h3 className="font-headline text-base font-bold text-white border-b border-slate-800/60 pb-2">About Club</h3>
                <p className="text-xs text-slate-300 font-body leading-relaxed">
                  {club.description || "No description provided for this club. This club represents active Rotaractors working on local community developments, environmental conservation, and youth leadership training."}
                </p>
              </GlassPanel>

              {/* Officers */}
              <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4">
                <h3 className="font-headline text-base font-bold text-white border-b border-slate-800/60 pb-2">Club Officers</h3>
                <div className="flex flex-col gap-3">
                  {mockMembers.map((officer) => (
                    <div key={officer.role} className="flex items-center justify-between p-2.5 rounded-lg bg-navy-deep/40 border border-slate-800/60">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{officer.name}</span>
                        <span className="text-[10px] text-slate-500 font-metadata">{officer.email}</span>
                      </div>
                      <span className="text-[9px] font-metadata font-bold px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 uppercase">
                        {officer.role}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Club's Showcase Projects list */}
            <div className="lg:col-span-2">
              <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4 h-full">
                <h3 className="font-headline text-base font-bold text-white border-b border-slate-800/60 pb-2">Showcase Projects</h3>
                
                {clubProjects.length > 0 ? (
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
                    {clubProjects.map((project) => (
                      <div 
                        key={project.id} 
                        className="p-4 rounded-xl bg-navy-deep/40 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/60 transition-colors group"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded bg-navy-deep border border-slate-700 overflow-hidden shrink-0 group-hover:border-electric-blue/50 transition-colors">
                            <img src={project.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white leading-snug truncate group-hover:text-electric-blue transition-colors">{project.title}</span>
                            <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider mt-0.5">
                              {project.avenueOfService}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-ocean-glow/10 text-ocean-glow font-metadata font-bold text-[10px] border border-ocean-glow/20">
                            Score: {project.impactScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs font-body gap-2">
                    <Layers className="w-8 h-8 opacity-40 text-slate-600" />
                    <span>No projects submitted yet</span>
                  </div>
                )}
              </GlassPanel>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Club Management</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Manage all Rotaract clubs within District 3192.
          </p>
        </div>
        <button 
          onClick={() => {
            const headers = ["ID", "Name", "President", "Charter Year", "Members", "Projects", "Points", "Zone", "Email"];
            const getPres = (leaders: any[]) => {
              const pres = leaders.find(l => l.designation.toLowerCase().includes("president"));
              return pres ? pres.name : "N/A";
            };
            const rows = clubs.map(c => [c.id, `"${c.name}"`, `"${getPres(c.leaders)}"`, c.charterYear, c.memberCount, c.totalProjects, c.totalPoints, c.zone, c.email]);
            const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "District_3192_Clubs_Directory.csv");
            link.click();
          }}
          className="px-4 py-2 flex items-center gap-2 rounded-lg bg-navy-deep border border-slate-700 hover:border-slate-500 text-xs font-bold text-white transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Directory
        </button>
      </div>

      <AdminDataTable<Club>
        title="District Clubs Directory"
        description="Complete list of active and inactive clubs."
        data={filteredClubs}
        searchPlaceholder="Search by name or zone..."
        onSearch={setSearchTerm}
        columns={[
          {
            header: "Club Identity",
            cell: (club) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-deep border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {club.logo ? (
                    <img src={club.logo} alt={club.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex flex-col">
                  <button 
                    onClick={() => setSelectedClubId(club.id)}
                    className="font-bold text-white text-left leading-snug hover:text-electric-blue transition-colors cursor-pointer"
                  >
                    {club.name}
                  </button>
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider">{club.zone}</span>
                </div>
              </div>
            )
          },
          {
            header: "Members",
            accessorKey: "memberCount",
            className: "font-metadata font-bold text-electric-blue"
          },
          {
            header: "Rank",
            cell: (club) => {
              const rank = sortedClubs.findIndex(c => c.id === club.id) + 1;
              return (
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-ocean-glow/10 text-ocean-glow font-metadata text-xs font-bold border border-ocean-glow/20">
                    {rank}
                  </span>
                </div>
              );
            }
          },
          {
            header: "Score",
            accessorKey: "totalPoints",
            className: "font-metadata"
          },
          {
            header: "Status",
            cell: () => (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            )
          },
          {
            header: "",
            cell: (club) => (
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => setSelectedClubId(club.id)}
                  className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="View Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
