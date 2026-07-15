"use client";

import React, { useState, useEffect } from "react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { UserCheck, Shield, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  clubName: string;
  clubId: string;
  requestedRole: string;
  zone?: string | null;
  submissionDate: string;
  status: string;
  verifiedLeader?: {
    name: string;
    designation: string;
    club_name: string;
  } | null;
}

export default function AdminAccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch(apiUrl('/api/admin/access-requests'));
        if (!res.ok) {
          throw new Error('Failed to load requests');
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((r: any) => ({
            id: r.id,
            name: r.full_name,
            email: r.email,
            phone: r.phone,
            clubName: r.clubs?.name || "Unknown Club",
            clubId: r.club_id,
            requestedRole: r.requested_role,
            zone: r.zone,
            submissionDate: r.created_at,
            status: r.status,
            verifiedLeader: r.verifiedLeader
          }));
          setRequests(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch access requests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const handleAction = async (req: any, newStatus: "Approved" | "Rejected") => {
    try {
      const res = await fetch(apiUrl('/api/admin/access-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: req.id,
          action: newStatus,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to execute action');
      }

      // Update local state
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setSuccessMsg(`Officer ${req.name} has been ${newStatus.toLowerCase()}!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error(`Failed to execute ${newStatus.toLowerCase()} action:`, err);
      alert(err.message || `Failed to perform action.`);
    }
  };

  const pendingRequests = requests.filter(req => 
    (req.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     req.clubName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in relative">
      
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg border border-emerald-500/30 bg-navy-dark/90 text-emerald-400 text-xs font-bold font-metadata shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-2 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Access Requests</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Review and approve credentials for new club officers.
          </p>
        </div>
      </div>

      <AdminDataTable<AccessRequest>
        title="Pending Registrations"
        description="Verify identities before granting system permissions."
        data={pendingRequests}
        searchPlaceholder="Search by name or club..."
        onSearch={setSearchTerm}
        columns={[
          {
            header: "Officer Info",
            cell: (req) => (
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white leading-snug">{req.name}</span>
                  {req.verifiedLeader && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-metadata" title={`Verified Leader Directory: ${req.verifiedLeader.designation} at ${req.verifiedLeader.club_name}`}>
                      <UserCheck className="w-2.5 h-2.5 text-emerald-400" />
                      Verified Leader
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-metadata">{req.email}</span>
                {req.verifiedLeader && (
                  <span className="text-[9px] text-emerald-400/80 font-metadata italic">
                    Directory Match: {req.verifiedLeader.designation} ({req.verifiedLeader.club_name})
                  </span>
                )}
              </div>
            )
          },
          {
            header: "Club",
            cell: (req) => (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-body">{req.clubName}</span>
                {req.zone && <span className="text-[10px] text-slate-400 font-metadata">Zone {req.zone}</span>}
              </div>
            )
          },
          {
            header: "Requested Role",
            cell: (req) => (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 font-metadata text-[10px] font-bold uppercase">
                <Shield className="w-3 h-3 text-slate-500" />
                {req.requestedRole}
              </span>
            )
          },
          {
            header: "Submitted",
            cell: (req) => (
              <span className="text-xs font-metadata text-slate-400">
                {new Date(req.submissionDate).toLocaleDateString()}
              </span>
            )
          },
          {
            header: "Actions",
            cell: (req) => (
              <div className="flex items-center gap-2 justify-end">
                <button 
                  onClick={() => handleAction(req, "Approved")}
                  className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors flex items-center gap-1.5 text-xs font-bold font-metadata"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Approve
                </button>
                <button 
                  onClick={() => handleAction(req, "Rejected")}
                  className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-1.5 text-xs font-bold font-metadata"
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
