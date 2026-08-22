"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Send, Loader2, Users } from "lucide-react";
import { useCreateMeeting, useUpdateMeeting } from "@/mutations/meeting.mutations";
import { useMeeting } from "@/queries/meeting.queries";
import { useProfile } from "@/hooks/useProfile";
import PhotoUploadGroup from "@/components/PhotoUploadGroup";

export default function ReportMeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { data: editData, isLoading: isEditLoading } = useMeeting(editId || "");

  const { club, profile, isLoading } = useProfile();
  const { mutateAsync: createMeeting, isPending: isCreating } = useCreateMeeting();
  const { mutateAsync: updateMeeting, isPending: isUpdating } = useUpdateMeeting();
  const isPending = isCreating || isUpdating;

  // Form State
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingType, setMeetingType] = useState("gbm");
  const [participantsCount, setParticipantsCount] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minutesText, setMinutesText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<{
    coverImage: string | null;
    supportingImage1: string | null;
    supportingImage2: string | null;
  }>({
    coverImage: null,
    supportingImage1: null,
    supportingImage2: null,
  });

  React.useEffect(() => {
    if (editData) {
      setDate(editData.date || "");
      setParticipantsCount((editData.attendees_count || 0).toString());
      
      const rm = editData.minutes_text || "";
      const titleMatch = rm.match(/Title: (.*?)(?= \(| \|)/);
      if (titleMatch) setMeetingTitle(titleMatch[1]);
      const typeMatch = rm.match(/\((.*?)\)/);
      if (typeMatch) setMeetingType(typeMatch[1].toLowerCase());
      const timeMatch = rm.match(/Time: (.*?) - (.*?)\n/);
      if (timeMatch) {
        setStartTime(timeMatch[1]);
        setEndTime(timeMatch[2]);
      }
      const minutesMatch = rm.match(/Minutes:\n([\s\S]*)$/);
      if (minutesMatch) setMinutesText(minutesMatch[1]);
      else setMinutesText(rm);

      setUploadedUrls({
        coverImage: editData.cover_image || null,
        supportingImage1: editData.supporting_image_1 || null,
        supportingImage2: editData.supporting_image_2 || null,
      });
    }
  }, [editData]);

  if (isLoading || isEditLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  if (!club?.id) {
    return (
      <div className="max-w-3xl mx-auto pb-12 flex flex-col gap-6">
        <div>
          <Link href="/portal/meetings" className="inline-flex items-center gap-2 text-xs font-metadata font-bold text-slate-500 hover:text-white uppercase mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Club Assignment Required</h1>
        </div>
        <div className="bg-navy-dark/40 border border-slate-800/60 p-8 rounded-2xl flex flex-col items-center text-center gap-5 backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Users className="w-8 h-8 text-amber-400" />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h3 className="font-headline text-lg font-bold text-slate-200">You are not assigned to a club</h3>
            <p className="text-xs text-slate-400 font-body leading-relaxed">
              You must be assigned to a club to submit reports. Please contact your Club President or District Administrator to map your profile to a club.
            </p>
          </div>
          <Link href="/portal/dashboard" className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all uppercase tracking-wider">
            Return to Mission Control
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setErrorMsg("Please choose a date.");
      return;
    }
    if (!uploadedUrls.coverImage) {
      setErrorMsg("Cover photo is required. Please upload a cover photo under Media & Documentation.");
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

      const payload = {
        club_id: club.id,
        date: date,
        minutes_text: richMinutes,
        attendees_count: parseInt(participantsCount) || 0,
        cover_image: uploadedUrls.coverImage,
        supporting_image_1: uploadedUrls.supportingImage1,
        supporting_image_2: uploadedUrls.supportingImage2,
      };

      if (editId) {
        await updateMeeting({ id: editId, payload });
      } else {
        await createMeeting(payload);
      }

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
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">{editId ? "Edit" : "Report"} Meeting</h1>
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

          <div className="mt-4 p-4 rounded-xl bg-navy-deep/40 border border-slate-800">
            <PhotoUploadGroup
              onImagesChange={(urls) => setUploadedUrls(urls)}
              required={true}
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-blue text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-ocean-glow hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editId ? "Update Report" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
