"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, FileText, Loader2, Award, User } from "lucide-react";
import GlassPanel from "@/components/GlassPanel";
import { useDov } from "@/queries/dov.queries";

export default function DovViewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: dov, isLoading } = useDov(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24 text-electric-blue font-metadata font-bold text-xs uppercase tracking-widest animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        Loading DOV details...
      </div>
    );
  }

  if (!dov) {
    return (
      <div className="max-w-3xl mx-auto pb-12 flex flex-col gap-6 text-center mt-20">
        <h1 className="text-2xl text-white font-bold">DOV Not Found</h1>
        <Link href="/portal/dov" className="text-electric-blue hover:underline">
          Return to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
      <div>
        <Link href="/portal/dov" className="inline-flex items-center gap-2 text-xs font-metadata font-bold text-slate-500 hover:text-white uppercase mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Link>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">District Official Visit</h1>
      </div>

      <GlassPanel className="p-8 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
        {dov.cover_image && (
          <img src={dov.cover_image} alt="Cover" className="w-full h-64 object-cover rounded-xl border border-slate-800" />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Date
            </span>
            <span className="text-slate-200 font-medium">
              {new Date(dov.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Visiting Official
            </span>
            <span className="text-slate-200 font-medium">
              {dov.visiting_official?.first_name ? `${dov.visiting_official.first_name} ${dov.visiting_official.last_name || ""}` : "District Representative"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Evaluation Score
            </span>
            <span className="text-electric-blue font-bold text-lg">
              {dov.evaluation_score !== null ? `${dov.evaluation_score}/100` : "Pending"}
            </span>
          </div>
          
          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="text-xs font-metadata text-slate-500 uppercase tracking-wider font-bold flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Visit Summary
            </span>
            <div className="p-4 rounded-xl bg-navy-deep/50 border border-slate-800 text-slate-300 whitespace-pre-wrap font-body text-sm leading-relaxed">
              {dov.remarks || "No additional remarks were provided for this DOV."}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4 border-t border-slate-800/60 pt-6">
          {dov.supporting_image_1 && (
            <img src={dov.supporting_image_1} alt="Supporting 1" className="w-32 h-32 object-cover rounded-lg border border-slate-800 hover:scale-105 transition-transform cursor-pointer" />
          )}
          {dov.supporting_image_2 && (
            <img src={dov.supporting_image_2} alt="Supporting 2" className="w-32 h-32 object-cover rounded-lg border border-slate-800 hover:scale-105 transition-transform cursor-pointer" />
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
