"use client";

import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/GlassPanel";
import { Megaphone, Bell, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Announcement {
  id: string;
  title: string;
  content: string;
  sender: string;
  created_at: string;
  target_audience: "All Clubs" | "Presidents Only" | "Secretaries Only";
}

export default function UserAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/announcements");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch announcements");
      }
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setErrorMsg("Failed to load announcements.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Unknown Date";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      <div>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-electric-blue" />
          Broadcast Board
        </h1>
        <p className="text-slate-400 text-sm font-body mt-1">
          Stay updated with official district circulars, executive orders, and operational timelines.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold font-metadata">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
            <p className="text-slate-500 text-xs font-metadata">Retrieving broadcasts...</p>
          </div>
        ) : announcements.length === 0 ? (
          <GlassPanel className="p-12 border-slate-800/60 bg-navy-dark/40 text-center flex flex-col items-center justify-center gap-3">
            <Bell className="w-10 h-10 text-slate-600 animate-pulse" />
            <h3 className="font-headline text-lg font-bold text-white">All Clear!</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              No active announcements match your role at this time. Check back later for updates.
            </p>
          </GlassPanel>
        ) : (
          announcements.map((item) => (
            <GlassPanel key={item.id} className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-navy-deep border border-slate-800">
                    <Bell className="w-4 h-4 text-electric-blue" />
                  </div>
                  <div>
                    <h3 className="font-headline text-base font-bold text-white leading-tight">{item.title}</h3>
                    <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                      <span className="text-slate-400">{item.sender}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(item.created_at)}</span>
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-electric-blue/10 text-electric-blue border-electric-blue/20">
                  {item.target_audience}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-body leading-relaxed whitespace-pre-wrap">{item.content}</p>
            </GlassPanel>
          ))
        )}
      </div>
    </div>
  );
}
