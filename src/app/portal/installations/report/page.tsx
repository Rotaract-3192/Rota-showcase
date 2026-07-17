"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import { useCreateInstallation } from "@/mutations/installation.mutations";
import { useProfile } from "@/hooks/useProfile";

export default function ReportInstallationPage() {
  const router = useRouter();
  const { club, profile } = useProfile();
  const { mutateAsync: createInstallation, isPending } = useCreateInstallation();

  // Form State
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participants, setParticipants] = useState("");
  const [newMembers, setNewMembers] = useState("");
  const [clubStrength, setClubStrength] = useState("");
  const [boardMembers, setBoardMembers] = useState("");
  const [spreadsheetLink, setSpreadsheetLink] = useState("");
  const [riPortal, setRiPortal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setErrorMsg("Please select a date.");
      return;
    }

    try {
      setErrorMsg("");

      if (!club?.id || !profile?.id) {
  setErrorMsg(
    "Unable to load your club profile. Please refresh the page and try again."
  );
  return;
}

await createInstallation({
  club_id: club.id,
  date,
  venue: venue || "Virtual / TBD",
  incoming_president_id: profile.id,
  chief_guest: eventName || "Club Installation Board",
});

      router.push("/portal/installations");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit installation report.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
      <div>
        <Link href="/portal/installations" className="inline-flex items-center gap-2 text-xs font-metadata font-bold text-slate-500 hover:text-white uppercase mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Report Installation</h1>
      </div>

      <div className="bg-navy-dark/40 border border-slate-800/60 p-6 md:p-8 rounded-2xl flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMsg && (
            <div className="text-red-500 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-metadata uppercase tracking-wider">
              {errorMsg}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Event Name</label>
            <input 
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
              placeholder="e.g. 15th Club Installation" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Venue</label>
            <input 
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Date</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none [color-scheme:dark]" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Start Time</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none [color-scheme:dark]" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">End Time</label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none [color-scheme:dark]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Participants</label>
              <input 
                type="number" 
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Newly Inducted Members</label>
              <input 
                type="number" 
                value={newMembers}
                onChange={(e) => setNewMembers(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Current Club Strength</label>
              <input 
                type="number" 
                value={clubStrength}
                onChange={(e) => setClubStrength(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Total Board Members</label>
              <input 
                type="number" 
                value={boardMembers}
                onChange={(e) => setBoardMembers(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Board Spreadsheet Link</label>
            <input 
              type="url" 
              value={spreadsheetLink}
              onChange={(e) => setSpreadsheetLink(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
              placeholder="https://docs.google.com/spreadsheets/..." 
            />
          </div>

          <div className="flex items-center gap-3 mt-2 p-4 rounded-xl bg-navy-deep/40 border border-slate-800">
            <input 
              type="checkbox" 
              id="riPortal" 
              checked={riPortal}
              onChange={(e) => setRiPortal(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-navy-deep/60 accent-electric-blue" 
            />
            <label htmlFor="riPortal" className="text-sm text-slate-300">Current Year President Reported In RI Portal</label>
          </div>
          
          <div className="mt-4 pt-6 border-t border-slate-800/60 flex items-center justify-end gap-4">
            <button 
              type="button" 
              onClick={() => router.push("/portal/installations")}
              className="px-6 py-2.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-8 py-2.5 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
