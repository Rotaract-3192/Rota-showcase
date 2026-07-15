"use client";

import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/GlassPanel";
import { Clock, CheckCircle2, XCircle, Search, Filter, AlertTriangle, Loader2, FileDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api";

interface Activity {
  id: string;
  type: string;
  club: string;
  title: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Cancelled';
  priority: 'High' | 'Normal';
  description: string;
  venue: string;
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const fetchActivities = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/activities'));
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const mapped = data.map((act: any) => ({
          id: act.id,
          type: act.type || "Project",
          club: act.clubs?.name || "Independent Member",
          title: act.title,
          date: act.start_time ? new Date(act.start_time).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
          status: (act.status === 'PUBLISHED' ? 'Approved' : act.status === 'CANCELLED' ? 'Cancelled' : 'Pending') as 'Approved' | 'Pending' | 'Cancelled',
          priority: (act.status === 'DRAFT' ? 'High' : 'Normal') as 'High' | 'Normal',
          description: act.description || "No description provided.",
          venue: act.venue || "Virtual / No venue details"
        }));
        setActivities(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleApprove = async (activityId: string) => {
    try {
      setActionInProgress(activityId);
      const res = await fetch(apiUrl('/api/admin/activities'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, action: 'Approved' }),
      });
      if (!res.ok) throw new Error("Failed to approve activity");
      
      // Update local state if details modal is open
      if (selectedActivity && selectedActivity.id === activityId) {
        setSelectedActivity({ ...selectedActivity, status: 'Approved' });
      }

      await fetchActivities();
    } catch (err) {
      console.error(err);
      alert("Failed to approve activity. Please try again.");
    } finally {
      setActionInProgress(null);
    }
  };

  const downloadSingleActivityReport = (act: Activity) => {
    const reportContent = `ROTARACT DISTRICT 3192 - OFFICIAL ACTIVITY REPORT
==================================================
Title:       ${act.title}
Club:        ${act.club}
Type:        ${act.type}
Date:        ${act.date}
Venue:       ${act.venue}
Status:      ${act.status}
==================================================

DESCRIPTION:
${act.description}

--------------------------------------------------
Generated via Command Center Admin Panel on: ${new Date().toLocaleString()}
`;
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Activity_Report_${act.title.replace(/[^a-z0-9]/gi, '_')}.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportActivitiesCSV = () => {
    const headers = ["ID", "Title", "Club", "Type", "Date", "Venue", "Status", "Description"];
    const rows = filteredActivities.map(act => [
      act.id,
      `"${act.title.replace(/"/g, '""')}"`,
      `"${act.club.replace(/"/g, '""')}"`,
      act.type,
      act.date,
      `"${act.venue.replace(/"/g, '""')}"`,
      act.status,
      `"${act.description.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `District_3192_Activities_Review_Queue.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingCount = activities.filter(a => a.status === 'Pending').length;
  const approvedCount = activities.filter(a => a.status === 'Approved').length;
  const cancelledCount = activities.filter(a => a.status === 'Cancelled').length;

  const filteredActivities = activities.filter(act => 
    (act.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     act.club.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Activity Review</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Review and approve club activity reports before they hit the public showcase.
          </p>
        </div>
      </div>

      {/* Review Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <GlassPanel className="p-4 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Pending Review</p>
            <p className="text-2xl font-headline font-bold text-white mt-1">{pendingCount}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500 opacity-20" />
        </GlassPanel>
        <GlassPanel className="p-4 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Approved Today</p>
            <p className="text-2xl font-headline font-bold text-emerald-400 mt-1">{approvedCount}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-20" />
        </GlassPanel>
        <GlassPanel className="p-4 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Cancelled / Rejected</p>
            <p className="text-2xl font-headline font-bold text-rose-400 mt-1">{cancelledCount}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-500 opacity-20" />
        </GlassPanel>
      </div>

      <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 bg-navy-dark/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-headline text-lg font-bold text-white">Submission Queue</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportActivitiesCSV}
              className="px-3 py-2 flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-metadata transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" /> Export Queue CSV
            </button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-electric-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Search activities..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-sm text-white focus:outline-none focus:border-electric-blue/50 w-full sm:w-64 font-body" 
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-24 text-electric-blue font-metadata font-bold text-xs uppercase tracking-widest animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading queue...
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="flex flex-col divide-y divide-slate-800/40">
            {filteredActivities.map((act) => (
              <div key={act.id} className="p-5 hover:bg-slate-800/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex flex-col gap-1 cursor-pointer flex-1" onClick={() => setSelectedActivity(act)}>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border",
                      act.status === 'Pending' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                      act.status === 'Approved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                      {act.status}
                    </span>
                    {act.priority === 'High' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Review Pending
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-metadata">{act.date}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white font-headline group-hover:text-electric-blue transition-colors">{act.title}</h4>
                  <p className="text-xs text-slate-400 font-metadata">{act.club} • {act.type}</p>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <button 
                    onClick={() => setSelectedActivity(act)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => downloadSingleActivityReport(act)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Download Report"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  {act.status === 'Pending' && (
                    <button 
                      onClick={() => handleApprove(act.id)}
                      disabled={actionInProgress === act.id}
                      className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {actionInProgress === act.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving...
                        </>
                      ) : (
                        "Approve"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500 font-body text-sm">
            No activities in the queue matching your filters.
          </div>
        )}
      </GlassPanel>

      {/* Selected Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-navy-dark/95 border border-slate-800/80 p-6 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col gap-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border mr-2",
                  selectedActivity.status === 'Pending' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                  selectedActivity.status === 'Approved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  {selectedActivity.status}
                </span>
                <span className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Activity details</span>
              </div>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 font-body">
              <div>
                <h3 className="font-headline text-2xl font-bold text-white leading-tight">{selectedActivity.title}</h3>
                <p className="text-xs text-electric-blue font-metadata uppercase tracking-wider font-bold mt-1">
                  Reported by {selectedActivity.club}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-800/60 py-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold block">Type</span>
                  <span className="text-slate-200">{selectedActivity.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold block">Date</span>
                  <span className="text-slate-200">{selectedActivity.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold block">Venue</span>
                  <span className="text-slate-200">{selectedActivity.venue}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold block">Activity ID</span>
                  <span className="text-slate-400 font-metadata text-[10px] select-all">{selectedActivity.id}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Description / Report Logs</span>
                <div className="p-4 rounded-xl bg-navy-deep border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedActivity.description}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800/60 pt-4 mt-2">
              <button
                onClick={() => downloadSingleActivityReport(selectedActivity)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-metadata transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" /> Download Report (.txt)
              </button>

              {selectedActivity.status === 'Pending' && (
                <button
                  onClick={() => handleApprove(selectedActivity.id)}
                  disabled={actionInProgress === selectedActivity.id}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-navy-deep hover:bg-emerald-400 text-xs font-bold font-metadata transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {actionInProgress === selectedActivity.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Approving...
                    </>
                  ) : (
                    "Approve Activity"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
