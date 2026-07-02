"use client";

import React from "react";
import Link from "next/link";
import { Plus, Users, Calendar, Clock, FileText } from "lucide-react";
import GlassPanel from "@/components/GlassPanel";
import { useMeetingList } from "@/queries/meeting.queries";

export default function MeetingsPage() {
  const { data: listResult, isLoading } = useMeetingList({
    pagination: { page: 1, pageSize: 50 },
    sort: { column: "date", ascending: false }
  });

  const meetings = listResult?.data || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Meetings</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Log and manage your club's formal meetings.
          </p>
        </div>
        <Link
          href="/portal/meetings/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-ocean-glow hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Report Meeting
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-electric-blue font-metadata font-bold text-xs uppercase tracking-widest animate-pulse">
          Loading logs...
        </div>
      ) : meetings.length > 0 ? (
        <GlassPanel className="p-0 border-slate-800/60 overflow-hidden bg-navy-dark/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-metadata whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800/60 bg-navy-dark/50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-center">Attendees</th>
                  <th className="py-4 px-6">Minutes (MoM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {meetings.map((item) => (
                  <tr key={item.id} className="hover:bg-navy-light/10 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2 text-white">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(item.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-electric-blue">
                      <Clock className="w-3.5 h-3.5 text-slate-500 inline mr-1.5" />
                      {item.attendees_count || 0}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-400 font-body text-sm" title={item.minutes_text || ""}>
                      <FileText className="w-3.5 h-3.5 text-slate-500 inline mr-1.5" />
                      {item.minutes_text || "No minutes recorded"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      ) : (
        <GlassPanel className="p-16 text-center flex flex-col items-center justify-center border-slate-800/40 bg-navy-dark/20 min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/45 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-headline text-xl font-bold text-white mb-2">No Meetings Reported</h3>
          <p className="text-slate-400 font-body text-sm max-w-sm mb-6 leading-relaxed">
            Log a Board Meeting, General Body Meeting, or Zonal Meeting to see it here.
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
