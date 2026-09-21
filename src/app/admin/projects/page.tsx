"use client";

import React, { useState } from "react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import GlassPanel from "@/components/GlassPanel";
import { useStore, Project } from "@/store/useStore";
import { Layers, CheckCircle, XCircle, Eye, X, Calendar, Clock, Heart, DollarSign, Award } from "lucide-react";
import { AVENUES_OF_SERVICE, activityMatchesAvenue } from "@/lib/avenues";

export default function AdminProjectsPage() {
  const projects = useStore((state) => state.projects);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAvenue, setSelectedAvenue] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleAction = (projectName: string, actionType: string) => {
    setSuccessMsg(`Project "${projectName}" has been ${actionType}!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filteredProjects = projects.filter(project => 
    (project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.clubName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedAvenue === "All" || project.avenueOfService === selectedAvenue || activityMatchesAvenue([project.avenueOfService], selectedAvenue))
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in relative">
      
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg border border-emerald-500/30 bg-navy-dark/90 text-emerald-400 text-xs font-bold font-metadata shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-2 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Project Moderation</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Review, feature, and moderate all projects submitted across the district.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Filter by Avenue</label>
          <select
            value={selectedAvenue}
            onChange={(e) => setSelectedAvenue(e.target.value)}
            className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="All">All Avenues</option>
            {AVENUES_OF_SERVICE.map((avenue) => (
              <option key={avenue} value={avenue}>{avenue}</option>
            ))}
          </select>
        </div>
      </div>

      <AdminDataTable<Project>
        title="Project Submissions"
        description="All projects that appear on the public showcase."
        data={filteredProjects}
        searchPlaceholder="Search projects or clubs..."
        onSearch={setSearchTerm}
        columns={[
          {
            header: "Project Details",
            cell: (project) => (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-navy-deep border border-slate-700 overflow-hidden shrink-0">
                  <img src={project.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0 max-w-xs">
                  <span className="font-bold text-white leading-snug truncate">{project.title}</span>
                  <span className="text-[10px] text-slate-500 font-metadata truncate mt-0.5">{project.clubName}</span>
                </div>
              </div>
            )
          },
          {
            header: "Avenue",
            accessorKey: "avenueOfService",
            className: "text-slate-300 font-metadata text-[10px] uppercase"
          },
          {
            header: "Impact Score",
            cell: (project) => (
              <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded bg-ocean-glow/10 text-ocean-glow font-metadata font-bold border border-ocean-glow/20">
                {project.impactScore}
              </span>
            )
          },
          {
            header: "Visibility",
            cell: () => (
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border bg-electric-blue/10 text-electric-blue border-electric-blue/20">
                Published
              </span>
            )
          },
          {
            header: "Actions",
            cell: (project) => (
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" 
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleAction(project.title, "featured on homepage")}
                  className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors" 
                  title="Feature Project"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleAction(project.title, "hidden from public view")}
                  className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors" 
                  title="Hide Project"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )
          }
        ]}
      />

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
          
          <GlassPanel className="w-full max-w-2xl bg-navy-dark border-slate-700 relative z-10 overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
            {/* Header image background */}
            <div className="relative h-48 w-full shrink-0">
              <img src={selectedProject.coverImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark to-transparent" />
              <button 
                onClick={() => setSelectedProject(null)} 
                className="absolute top-4 right-4 p-2 rounded-full bg-navy-deep/60 hover:bg-navy-deep text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-metadata font-bold px-2 py-0.5 rounded border border-electric-blue/20 bg-electric-blue/15 text-electric-blue uppercase tracking-wide">
                  {selectedProject.avenueOfService}
                </span>
                <h3 className="font-headline text-xl font-bold text-white mt-2 leading-tight">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-slate-500 font-metadata mt-1">
                  Submitted by {selectedProject.clubName}
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-navy-deep/50 p-4 rounded-xl border border-slate-800/80">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Impact Score</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Award className="w-4 h-4 text-electric-blue" />
                    {selectedProject.impactScore}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Volunteers</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Heart className="w-4 h-4 text-pink-500" />
                    {selectedProject.beneficiaries}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Hours</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-500" />
                    {selectedProject.volunteerHours}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Funds Raised</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    ₹{selectedProject.contributions.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-metadata">Description</h4>
                <p className="text-xs text-slate-300 font-body leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 border-t border-slate-800/60 pt-4 mt-2">
                <button 
                  onClick={() => {
                    handleAction(selectedProject.title, "featured on homepage");
                    setSelectedProject(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-navy-deep text-xs font-bold font-metadata transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Feature Project
                </button>
                <button 
                  onClick={() => {
                    handleAction(selectedProject.title, "hidden from public view");
                    setSelectedProject(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold font-metadata transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Hide Project
                </button>
              </div>

            </div>
          </GlassPanel>
        </div>
      )}

    </div>
  );
}
