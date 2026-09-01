"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, User, MapPin, Clipboard, Loader2, Award } from "lucide-react";
import GlassPanel from "@/components/GlassPanel";
import { useInstallation } from "@/queries/installation.queries";

export default function InstallationViewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: installation, isLoading } = useInstallation(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24 text-electric-blue font-metadata font-bold text-xs uppercase tracking-widest animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        Loading installation details...
      </div>
    );
  }

  if (!installation) {
    return (
      <div className="max-w-3xl mx-auto pb-12 flex flex-col gap-6 text-center mt-20">
        <h1 className="text-2xl text-white font-bold">Installation Not Found</h1>
        <Link href="/portal/installations" className="text-electric-blue hover:underline">
          Return to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
      <div>
        <Link href="/portal/installations" className="inline-flex items-center gap-2 text-xs font-metadata font-bold text-slate-500 hover:text-white uppercase mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Link>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">{installation.name || "Installation Details"}</h1>
      </div>

      <GlassPanel className="p-8 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
        {installation.cover_image && (
          <img src={installation.cover_image} alt="Cover" className="w-full h-64 object-cover rounded-xl border border-slate-800" />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Date
            </span>
            <span className="text-slate-200 font-medium">
              {new Date(installation.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Installation Name
            </span>
            <span className="text-slate-200 font-medium">
              {installation.name || "N/A"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Chief Guest
            </span>
            <span className="text-slate-200 font-medium">
              {installation.chief_guest || "N/A"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Venue
            </span>
            <span className="text-electric-blue font-bold text-lg">
              {installation.venue || "N/A"}
            </span>
          </div>
          
          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <Clipboard className="w-3.5 h-3.5" /> Remarks / Details
            </span>
            <div className="p-4 rounded-xl bg-navy-deep/50 border border-slate-800 text-slate-300 whitespace-pre-wrap font-body text-sm leading-relaxed">
              {installation.remarks || "No additional remarks were provided for this installation."}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4 border-t border-slate-800/60 pt-6">
          {installation.supporting_image_1 && (
            <img src={installation.supporting_image_1} alt="Supporting 1" className="w-32 h-32 object-cover rounded-lg border border-slate-800 hover:scale-105 transition-transform cursor-pointer" />
          )}
          {installation.supporting_image_2 && (
            <img src={installation.supporting_image_2} alt="Supporting 2" className="w-32 h-32 object-cover rounded-lg border border-slate-800 hover:scale-105 transition-transform cursor-pointer" />
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
