"use client";

import React from "react";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, Tent, Calendar, MapPin, User, Award } from "lucide-react";
import GlassPanel from "@/components/GlassPanel";
import { useInstallationList } from "@/queries/installation.queries";
import { useDeleteInstallation } from "@/mutations/installation.mutations";

export default function InstallationsPage() {
  const { data: listResult, isLoading } = useInstallationList({
    pagination: { page: 1, pageSize: 50 },
    sort: { column: "date", ascending: false }
  });

  const installations = listResult?.data || [];
  const { mutateAsync: deleteInstallation, isPending: isDeleting } = useDeleteInstallation();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this installation report?")) {
      try {
        await deleteInstallation(id);
      } catch (e) {
        alert("Failed to delete installation report");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Installations</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Manage your club's board installations and inductions.
          </p>
        </div>
        <Link
          href="/portal/installations/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-ocean-glow hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Report Installation
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24 text-electric-blue font-metadata font-bold text-xs uppercase tracking-widest animate-pulse">
          Loading logs...
        </div>
      ) : installations.length > 0 ? (
        <GlassPanel className="p-0 border-slate-800/60 overflow-hidden bg-navy-dark/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-metadata whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800/60 bg-navy-dark/50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Installation</th>
                  <th className="py-4 px-6">Venue</th>
                  <th className="py-4 px-6">Chief Guest</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {installations.map((item: any) => (
                  <tr key={item.id} className="hover:bg-navy-light/10 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2 text-white">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(item.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">
                      {item.name || "Untitled Installation"}
                    </td>
                    <td className="py-4 px-6">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 inline mr-1.5" />
                      {item.venue || "N/A"}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-500 inline mr-1.5" />
                      {item.chief_guest || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/portal/installations/${item.id}`} className="p-1.5 text-slate-400 hover:text-ocean-glow transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/portal/installations/report?edit=${item.id}`} className="p-1.5 text-slate-400 hover:text-electric-blue transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          disabled={isDeleting}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
            <Tent className="w-8 h-8" />
          </div>
          <h3 className="font-headline text-xl font-bold text-white mb-2">No Installations Reported</h3>
          <p className="text-slate-400 font-body text-sm max-w-sm mb-6 leading-relaxed">
            Submit your club's installation report for the current Rotaract year.
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
