"use client";

import React, { useEffect } from "react";
import { useActivity } from "@/queries/activity.queries";
import { X, Calendar, MapPin, Users, Clock, CircleDollarSign, Loader2, Image as ImageIcon } from "lucide-react";

export default function ActivityDetailModal({ activityId, onClose }: { activityId: string; onClose: () => void }) {
  const { data: activity, isLoading } = useActivity(activityId);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Disable scroll when modal is active
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-deep/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto z-10 p-0 border border-electric-blue/25 shadow-2xl flex flex-col bg-navy-deep rounded-2xl"
      >
        {/* Action Buttons (Close) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-navy-dark/80 hover:bg-navy-light border border-slate-700/60 text-slate-300 hover:text-white transition-all focus:outline-none backdrop-blur-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading || !activity ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
          </div>
        ) : (
          <>
            {/* Banner/Image */}
            <div className="relative w-full h-64 md:h-80 bg-navy-medium flex-shrink-0">
              {activity.cover_image ? (
                <img
                  src={activity.cover_image}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-navy-dark/60">
                  <ImageIcon className="w-12 h-12 text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
                {activity.avenues?.[0] && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-electric-blue/15 border border-electric-blue/40 text-electric-blue backdrop-blur-md mr-2">
                    {activity.avenues[0]}
                  </span>
                )}
                <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-ocean-glow/15 border border-ocean-glow/40 text-ocean-glow backdrop-blur-md">
                  {activity.type}
                </span>
                <h2 className="font-headline font-bold text-2xl md:text-3xl lg:text-4xl text-white mt-4 leading-tight">
                  {activity.title}
                </h2>
                <p className="text-sm font-metadata text-slate-300 mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-electric-blue" />
                  {new Date(activity.start_time).toLocaleDateString()}
                  {activity.end_time && activity.end_time !== activity.start_time && ` - ${new Date(activity.end_time).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Storytelling Column */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-white mb-3 border-b border-slate-800/40 pb-2">
                    Activity Overview
                  </h3>
                  <p className="text-slate-300 font-body text-base leading-relaxed whitespace-pre-line">
                    {activity.description || "No description provided."}
                  </p>
                </div>

                {(activity.supporting_image_1 || activity.supporting_image_2) && (
                  <div>
                    <h3 className="font-headline text-lg font-bold text-white mb-3 border-b border-slate-800/40 pb-2">
                      Supporting Media
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {activity.supporting_image_1 && (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-navy-deep/20">
                          <img src={activity.supporting_image_1} alt="Supporting Media 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      {activity.supporting_image_2 && (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-navy-deep/20">
                          <img src={activity.supporting_image_2} alt="Supporting Media 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                        {activity.beneficiaries?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-navy-dark/40 border border-slate-800/40">
                    <Clock className="w-5 h-5 text-ocean-glow" />
                    <div>
                      <p className="text-slate-500 font-bold uppercase text-[9px]">Volunteer Hours</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {activity.volunteer_hours?.toLocaleString() || 0} Hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-navy-dark/40 border border-slate-800/40">
                    <Users className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-slate-500 font-bold uppercase text-[9px]">Volunteers</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {activity.volunteers?.toLocaleString() || 0} People
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-navy-dark/40 border border-slate-800/40">
                    <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-slate-500 font-bold uppercase text-[9px]">Cash Raised</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        ₹{(activity.cash_contribution || 0).toLocaleString()} INR
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-navy-dark/40 border border-slate-800/40">
                    <CircleDollarSign className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-slate-500 font-bold uppercase text-[9px]">In-Kind Value</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        ₹{(activity.in_kind_contribution || 0).toLocaleString()} INR
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata list */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/40 text-xs font-metadata text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{activity.venue || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center font-bold text-slate-500">ID</span>
                    <span>{activity.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
