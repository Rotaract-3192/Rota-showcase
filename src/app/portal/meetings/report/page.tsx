"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import { useCreateMeeting } from "@/mutations/meeting.mutations";
import { useProfile } from "@/hooks/useProfile";

export default function ReportMeetingPage() {
  const router = useRouter();
  const { club, profile } = useProfile();
  const { mutateAsync: createMeeting, isPending } = useCreateMeeting();

  // Form State
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingType, setMeetingType] = useState("gbm");
  const [participantsCount, setParticipantsCount] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minutesText, setMinutesText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setErrorMsg("Please choose a date.");
      return;
    }

    try {
      setErrorMsg("");

      // Combine Meeting Details with Minutes text
      const richMinutes = `Title: ${meetingTitle || "General Meeting"} (${meetingType.toUpperCase()}) | Time: ${startTime || "00:00"} - ${endTime || "00:00"}\n\nMinutes:\n${minutesText}`;

	if (!club?.id || !profile?.id) {
    setErrorMsg(
        "Unable to load your profile. Please refresh and try again."
    );
    return;
}

      await createMeeting({
        club_id: club.id,
        date: date,
        minutes_text: richMinutes,
        attendees_count: parseInt(participantsCount) || 0
      });

      router.push("/portal/meetings");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit meeting report.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
      <div>
        <Link href="/portal/meetings" className="inline-flex items-center gap-2 text-xs font-metadata font-bold text-slate-500 hover:text-white uppercase mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Report Meeting</h1>
      </div>

      <div className="bg-navy-dark/40 border border-slate-800/60 p-6 md:p-8 rounded-2xl flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMsg && (
            <div className="text-red-500 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-metadata uppercase tracking-wider">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Meeting Title</label>
            <input 
              required
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
              placeholder="e.g. 5th General Body Meeting" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Meeting Type</label>
              <select 
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none"
              >
                <option value="gbm">General Body Meeting</option>
                <option value="board">Board Meeting</option>
                <option value="district">District Meeting</option>
                <option value="zonal">Zonal Meeting</option>
                <option value="committee">Committee Meeting</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Number of Participants</label>
              <input 
                type="number" 
                value={participantsCount}
                onChange={(e) => setParticipantsCount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" 
                placeholder="0" 
              />
            </div>
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

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Minutes of Meeting (MoM)</label>
            <textarea 
              required
              rows={6}
              value={minutesText}
              onChange={(e) => setMinutesText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none resize-y" 
              placeholder="Record the minutes of the meeting here..." 
            />
          </div>
          
          <div className="mt-4 pt-6 border-t border-slate-800/60 flex items-center justify-end gap-4">
            <button 
              type="button" 
              onClick={() => router.push("/portal/meetings")}
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
