"use client";

import React, { useEffect, useState } from "react";
import GlassPanel from "@/components/GlassPanel";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { FileText, ExternalLink, Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api";

interface PublicationRequest {
  id: string;
  title: string;
  club: string;
  date: string;
  category: string;
  status: string;
}

interface Bulletin {
  id: string;
  title: string;
  edition: string;
  club: string;
  fileUrl: string;
  date: string;
}

export default function AdminPublicationsPage() {
  const [requests, setRequests] = useState<PublicationRequest[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [actsRes, bulletinsRes] = await Promise.all([
          fetch(apiUrl("/api/admin/activities?zone=All")),
          fetch(apiUrl("/api/admin/bulletins")),
        ]);
        if (actsRes.ok) {
          const acts = await actsRes.json();
          setRequests(
            (Array.isArray(acts) ? acts : [])
              .filter((act: any) => act.submit_for_publication)
              .map((act: any) => ({
                id: act.id,
                title: act.title,
                club: act.clubs?.name || "Unknown club",
                date: act.start_time || act.created_at,
                category: act.activity_category || act.type || "Activity",
                status: act.status,
              }))
          );
        }
        if (bulletinsRes.ok) {
          const rows = await bulletinsRes.json();
          setBulletins(
            (Array.isArray(rows) ? rows : []).map((row: any) => ({
              id: row.id,
              title: row.title,
              edition: row.edition || "",
              club: row.clubs?.name || "Unknown club",
              fileUrl: row.file_url || "",
              date: row.created_at,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load publications:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredRequests = requests.filter((item) =>
    `${item.title} ${item.club}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      <div>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Publications & Bulletins</h1>
        <p className="text-slate-400 text-sm font-body mt-1">
          Club activities marked for district publication, plus monthly bulletins uploaded from the club portal.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-electric-blue font-metadata text-xs uppercase">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading submissions...
        </div>
      ) : (
        <>
          <AdminDataTable<PublicationRequest>
            title="Publication requests"
            description="Activities where the club ticked “Submit for District Publication”."
            data={filteredRequests}
            searchPlaceholder="Search title or club..."
            onSearch={setSearchTerm}
            columns={[
              {
                header: "Activity",
                cell: (item) => (
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="text-[10px] text-slate-500">{item.club}</span>
                  </div>
                ),
              },
              { header: "Type", accessorKey: "category", className: "text-xs text-slate-300" },
              { header: "Status", accessorKey: "status", className: "text-xs text-slate-300" },
            ]}
          />

          <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 overflow-hidden">
            <div className="p-5 border-b border-slate-800/60">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-electric-blue" />
                Club bulletins
              </h3>
              <p className="text-xs text-slate-400 mt-1">PDFs uploaded from Portal → Bulletin.</p>
            </div>
            {bulletins.length === 0 ? (
              <div className="p-8 text-sm text-slate-500">No club bulletins yet.</div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {bulletins.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.club} · {item.edition}</p>
                    </div>
                    {item.fileUrl ? (
                      <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-electric-blue text-xs font-bold flex items-center gap-1">
                        Open PDF <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No file</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </>
      )}
    </div>
  );
}
