"use client";

import React, { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { X, Calendar, MapPin, Users, Clock, ShieldCheck, Heart, CircleDollarSign, Download } from "lucide-react";
import GlassPanel from "./GlassPanel";

export default function ProjectDetailModal() {
  const { selectedProjectId, setSelectedProjectId, projects } = useStore(useShallow((state) => ({
    selectedProjectId: state.selectedProjectId,
    setSelectedProjectId: state.setSelectedProjectId,
    projects: state.projects,
  })));

  const project = projects.find((p) => p.id === selectedProjectId);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProjectId(null);
      }
    };
    if (selectedProjectId) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Disable scroll when modal is active
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedProjectId, setSelectedProjectId]);

  if (!project) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-deep/85 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setSelectedProjectId(null)}
      />

      {/* Modal Content */}
      <GlassPanel
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto z-10 p-0 border border-electric-blue/25 shadow-2xl flex flex-col"
        glowColor="cyan"
      >
        {/* Action Buttons (Download & Close) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => {
              const reportText = `PROJECT REPORT: ${project.title}\n`
                + `====================================================\n\n`
                + `Organized By: ${project.clubName}\n`
                + `Avenue of Service: ${project.avenueOfService}\n`
                + `Area of Focus: ${project.areaOfFocus}\n`
                + `Location: ${project.location}\n`
                + `Zone Assignment: ${project.zone}\n`
                + `Upload Date: ${formatDate(project.uploadDate)}\n\n`
                + `METRICS:\n`
                + `----------------------------------------------------\n`
                + `Beneficiaries: ${project.beneficiaries.toLocaleString()}\n`
                + `Volunteer Hours: ${project.volunteerHours}\n`
                + `Volunteers Participated: ${project.volunteerCount}\n`
                + `Contributions/Funding: INR ${project.contributions.toLocaleString()}\n\n`
                + `PROJECT OVERVIEW:\n`
                + `----------------------------------------------------\n`
                + `${project.description}\n`;

              const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `Project_Report_${project.id}.txt`);
              link.click();
            }}
            className="px-3 py-1.5 flex items-center gap-2 rounded-full bg-navy-dark/80 hover:bg-navy-light border border-slate-700/60 text-slate-300 hover:text-white transition-all text-xs font-bold focus:outline-none"
            aria-label="Download report"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Report</span>
          </button>
          
          <button
            onClick={() => setSelectedProjectId(null)}
            className="p-1.5 rounded-full bg-navy-dark/80 hover:bg-navy-light border border-slate-700/60 text-slate-300 hover:text-white transition-all focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner/Image */}
        <div className="relative w-full h-64 md:h-80 bg-navy-medium flex-shrink-0">
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-electric-blue/15 border border-electric-blue/40 text-electric-blue backdrop-blur-md">
              {project.avenueOfService}
            </span>
            <h2 className="font-headline font-bold text-2xl md:text-3xl lg:text-4xl text-white mt-4 leading-tight">
              {project.title}
            </h2>
            <p className="text-sm font-metadata text-ocean-glow font-bold mt-2">
              Organized by {project.clubName}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Storytelling Column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div>
              <h3 className="font-headline text-lg font-bold text-white mb-3 border-b border-slate-800/40 pb-2">
                Project Overview
              </h3>
              <p className="text-slate-300 font-body text-base leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            <div>
              <h3 className="font-headline text-lg font-bold text-white mb-3 border-b border-slate-800/40 pb-2">
                District Impact Assessment
              </h3>
              <p className="text-slate-400 font-body text-sm leading-relaxed max-w-2xl mt-4">
                This project achieved significant community mobilization
                and successfully met its intended milestones.
              </p>
            </div>
          </div>

          {/* Sidebar Metrics Column */}
          <div className="flex flex-col gap-6">
            <h3 className="font-headline text-md font-bold text-white border-b border-slate-800/40 pb-2">
              Key Metrics
            </h3>

            {/* Stats list */}
            <div className="flex flex-col gap-4 font-metadata text-xs">
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-navy-dark/40 border border-slate-800/40">
                <Users className="w-5 h-5 text-electric-blue" />
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[9px]">Beneficiaries</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {project.beneficiaries.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-navy-dark/40 border border-slate-800/40">
                <Clock className="w-5 h-5 text-ocean-glow" />
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[9px]">Volunteer Hours</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {project.volunteerHours} Hours
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-navy-dark/40 border border-slate-800/40">
                <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[9px]">Contributions</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    ₹{project.contributions.toLocaleString()} INR
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata list */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/40 text-xs font-metadata text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Uploaded: {formatDate(project.uploadDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Area: {project.areaOfFocus}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-slate-500" />
                <span>Zone Assignment: {project.zone}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
