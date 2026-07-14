"use client";

import React from "react";
import Image from "next/image";
import { Project, useStore } from "@/store/useStore";
import GlassPanel from "./GlassPanel";
import { Users, Clock, Award, Calendar } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const setSelectedProjectId = useStore((state) => state.setSelectedProjectId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <GlassPanel
      hoverEffect
      glowColor="blue"
      className="flex flex-col h-full cursor-pointer group p-0 overflow-hidden"
      onClick={() => setSelectedProjectId(project.id)}
    >
      {/* Cover Image */}
      <div className="relative w-full h-48 overflow-hidden bg-navy-medium">
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/20 to-transparent opacity-80" />
        
        {/* Avenue of Service Badge */}
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-navy-dark/80 border border-electric-blue/30 text-electric-blue backdrop-blur-md">
          {project.avenueOfService}
        </span>

      </div>

      {/* Card Body */}
      <div className="flex-grow flex flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-metadata mb-2">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDate(project.uploadDate)}</span>
          <span className="text-slate-600">•</span>
          <span>{project.zone}</span>
        </div>

        <h3 className="font-headline font-bold text-lg text-white group-hover:text-electric-blue transition-colors duration-300 line-clamp-2 mb-2 leading-snug">
          {project.title}
        </h3>

        <p className="text-xs text-slate-400 font-metadata font-bold mb-4 text-ocean-glow/85">
          {project.clubName}
        </p>

        <p className="text-sm text-slate-300 line-clamp-3 mb-6 font-body leading-relaxed flex-grow">
          {project.description}
        </p>

        {/* Card Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/40 text-xs font-metadata">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-electric-blue/5 border border-electric-blue/15 text-electric-blue">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Reached</p>
              <p className="font-bold text-white text-sm">
                {project.beneficiaries.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-ocean-glow/5 border border-ocean-glow/15 text-ocean-glow">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Vol. Hours</p>
              <p className="font-bold text-white text-sm">
                {project.volunteerHours.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
