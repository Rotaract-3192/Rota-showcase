"use client";

import React, { useState } from "react";
import GlassPanel from "@/components/GlassPanel";
import { FileDown, FileText, Database, Shield, Loader2 } from "lucide-react";

export default function AdminReportsPage() {
  const [successMsg, setSuccessMsg] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMsg(`Downloaded ${filename} successfully!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const downloadPDF = async (headers: string[], rows: any[][], title: string, filename: string) => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("landscape");
    doc.text(title, 14, 15);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 240, 255], textColor: [11, 17, 32] },
    });
    doc.save(filename);
    setSuccessMsg(`Downloaded ${filename} successfully!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleExportClubs = async (format: 'csv' | 'pdf') => {
    setDownloading(`clubs-${format}`);
    try {
      const res = await fetch('/api/admin/reports?type=clubs');
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      
      const headers = ["Club ID", "Club Name", "Charter Date", "Status", "Member Count", "Total Projects", "Total Points"];
      const rows = data.map((c: any) => [
        c.id,
        c.name,
        c.charterDate,
        c.status,
        c.memberCount,
        c.totalProjects,
        c.totalPoints
      ]);

      if (format === 'csv') {
        const csvRows = rows.map((r: any[]) => r.map((c: any) => typeof c === 'string' ? `"${c.replace(/"/g, '""')}"` : c));
        const csvContent = [headers.join(","), ...csvRows.map((r: any[]) => r.join(","))].join("\n");
        downloadCSV(csvContent, "District_3192_Clubs_Directory.csv");
      } else {
        await downloadPDF(headers, rows, "District 3192 Clubs Directory", "District_3192_Clubs_Directory.pdf");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export clubs data.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExportProjects = async (format: 'csv' | 'pdf') => {
    setDownloading(`projects-${format}`);
    try {
      const res = await fetch('/api/admin/reports?type=projects');
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();

      const headers = ["ID", "Title", "Type", "Status", "Club Name", "Start Date", "Venue", "Description"];
      const rows = data.map((p: any) => [
        p.id,
        p.title,
        p.type,
        p.status,
        p.clubName,
        p.startDate,
        p.venue,
        p.description.substring(0, 500) + (p.description.length > 500 ? "..." : "")
      ]);

      if (format === 'csv') {
        const csvRows = rows.map((r: any[]) => r.map((c: any) => typeof c === 'string' ? `"${c.replace(/"/g, '""')}"` : c));
        const csvContent = [headers.join(","), ...csvRows.map((r: any[]) => r.join(","))].join("\n");
        downloadCSV(csvContent, "District_3192_Projects_Telemetry.csv");
      } else {
        await downloadPDF(headers, rows, "District 3192 Projects Telemetry", "District_3192_Projects_Telemetry.pdf");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export projects telemetry.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExportLeaderboard = async (format: 'csv' | 'pdf') => {
    setDownloading(`leaderboard-${format}`);
    try {
      const res = await fetch('/api/admin/reports?type=leaderboard');
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();

      const headers = ["Rank", "Club ID", "Club Name", "Total Points"];
      const rows = data.map((c: any, idx: number) => [
        idx + 1,
        c.clubId,
        c.clubName,
        c.points
      ]);

      if (format === 'csv') {
        const csvRows = rows.map((r: any[]) => r.map((c: any) => typeof c === 'string' ? `"${c.replace(/"/g, '""')}"` : c));
        const csvContent = [headers.join(","), ...csvRows.map((r: any[]) => r.join(","))].join("\n");
        downloadCSV(csvContent, "District_3192_Leaderboard_Audit.csv");
      } else {
        await downloadPDF(headers, rows, "District 3192 Leaderboard Audit", "District_3192_Leaderboard_Audit.pdf");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export leaderboard standings.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-12 animate-fade-in relative">
      
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg border border-emerald-500/30 bg-navy-dark/90 text-emerald-400 text-xs font-bold font-metadata shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-2 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FileDown className="w-8 h-8 text-electric-blue" />
            Report Center
          </h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Export granular database dumps, leaderboard states, and operational project lists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* District Directory Dump */}
        <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-3">
            <div className="p-2 rounded bg-navy-deep border border-slate-800">
              <Database className="w-5 h-5 text-electric-blue" />
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-white leading-tight">Clubs & Users Database</h3>
              <p className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider">Complete Directory Info</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-body leading-relaxed flex-1">
            Export a full directory of all active and inactive clubs in District 3192 including member counts, chartered dates, status, and points.
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleExportClubs('csv')}
              disabled={downloading !== null}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-metadata transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloading === 'clubs-csv' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> CSV...</>
              ) : (
                <><FileDown className="w-4 h-4" /> CSV</>
              )}
            </button>
            <button 
              onClick={() => handleExportClubs('pdf')}
              disabled={downloading !== null}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-metadata transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloading === 'clubs-pdf' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> PDF...</>
              ) : (
                <><FileDown className="w-4 h-4" /> PDF</>
              )}
            </button>
          </div>
        </GlassPanel>

        {/* Project Telemetry Dump */}
        <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-3">
            <div className="p-2 rounded bg-navy-deep border border-slate-800">
              <FileText className="w-5 h-5 text-ocean-glow" />
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-white leading-tight">Project Submissions</h3>
              <p className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider">Impact & Description Logs</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-body leading-relaxed flex-1">
            Export a compilation of all submitted activities and projects across the district. Contains statuses, venues, description logs, and parent clubs.
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleExportProjects('csv')}
              disabled={downloading !== null}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-metadata transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloading === 'projects-csv' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> CSV...</>
              ) : (
                <><FileDown className="w-4 h-4" /> CSV</>
              )}
            </button>
            <button 
              onClick={() => handleExportProjects('pdf')}
              disabled={downloading !== null}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-metadata transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloading === 'projects-pdf' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> PDF...</>
              ) : (
                <><FileDown className="w-4 h-4" /> PDF</>
              )}
            </button>
          </div>
        </GlassPanel>

        {/* Leaderboard Config Backup */}
        <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-3">
            <div className="p-2 rounded bg-navy-deep border border-slate-800">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-white leading-tight">Leaderboard Standings</h3>
              <p className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider">Points Rankings</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-body leading-relaxed flex-1">
            Download the point leaderboard standings of all clubs in District 3192 computed from the live transaction points ledger.
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleExportLeaderboard('csv')}
              disabled={downloading !== null}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-metadata transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloading === 'leaderboard-csv' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> CSV...</>
              ) : (
                <><FileDown className="w-4 h-4" /> CSV</>
              )}
            </button>
            <button 
              onClick={() => handleExportLeaderboard('pdf')}
              disabled={downloading !== null}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-metadata transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloading === 'leaderboard-pdf' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> PDF...</>
              ) : (
                <><FileDown className="w-4 h-4" /> PDF</>
              )}
            </button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
