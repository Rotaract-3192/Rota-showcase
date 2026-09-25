"use client";

import React, { useEffect, useMemo, useState } from "react";
import GlassPanel from "@/components/GlassPanel";
import {
  FileText,
  ExternalLink,
  Loader2,
  Eye,
  X,
  Download,
  Calendar,
  MapPin,
  Heart,
  Clock,
  DollarSign,
} from "lucide-react";
import { apiUrl } from "@/lib/api";
import ReportingPeriodSelect from "@/components/admin/ReportingPeriodSelect";
import { currentMonthPeriod, inPeriod, periodRange } from "@/lib/reporting-period";

interface PublicationRequest {
  id: string;
  title: string;
  club: string;
  zone: string;
  date: string;
  category: string;
  status: string;
  description: string;
  venue: string;
  coverImage: string | null;
  supportingImage1: string | null;
  supportingImage2: string | null;
  beneficiaries: number;
  volunteers: number;
  volunteerHours: number;
  expenses: number;
  avenues: string[];
}

interface Bulletin {
  id: string;
  title: string;
  edition: string;
  club: string;
  fileUrl: string;
  date: string;
}

function photoList(item: PublicationRequest) {
  return [
    { label: "Cover", url: item.coverImage },
    { label: "Supporting 1", url: item.supportingImage1 },
    { label: "Supporting 2", url: item.supportingImage2 },
  ].filter((p): p is { label: string; url: string } => Boolean(p.url));
}

async function downloadUrl(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function AdminPublicationsPage() {
  const [requests, setRequests] = useState<PublicationRequest[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [bulletinsError, setBulletinsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonthPeriod());
  const [selected, setSelected] = useState<PublicationRequest | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setBulletinsError(null);
        const [actsRes, bulletinsRes] = await Promise.all([
          fetch(apiUrl(`/api/admin/activities?zone=All&period=${encodeURIComponent(selectedPeriod)}`)),
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
                zone: act.clubs?.zone || "",
                date: act.start_time || act.created_at,
                category: act.activity_category || act.type || "Activity",
                status: act.status,
                description: act.description || "",
                venue: act.venue || "",
                coverImage: act.cover_image || null,
                supportingImage1: act.supporting_image_1 || null,
                supportingImage2: act.supporting_image_2 || null,
                beneficiaries: act.beneficiaries || 0,
                volunteers: act.volunteers || 0,
                volunteerHours: act.volunteer_hours || 0,
                expenses: act.activity_expenses || 0,
                avenues: Array.isArray(act.avenues) ? act.avenues : [],
              }))
          );
        }
        if (bulletinsRes.ok) {
          const rows = await bulletinsRes.json();
          setBulletins(
            (Array.isArray(rows) ? rows : [])
              .filter((row: any) => inPeriod(row.created_at, periodRange(selectedPeriod)))
              .map((row: any) => ({
                id: row.id,
                title: row.title,
                edition: row.edition || "",
                club: row.clubs?.name || "Unknown club",
                fileUrl: row.file_url || "",
                date: row.created_at,
              }))
          );
        } else {
          const err = await bulletinsRes.json().catch(() => ({}));
          setBulletinsError(err.error || `Could not load club bulletins (${bulletinsRes.status}).`);
        }
      } catch (err) {
        console.error("Failed to load publications:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedPeriod]);

  const filteredRequests = useMemo(
    () =>
      requests.filter((item) =>
        `${item.title} ${item.club} ${item.zone}`.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [requests, searchTerm]
  );

  const handleDownloadAll = async (item: PublicationRequest) => {
    const photos = photoList(item);
    if (!photos.length) return;
    setDownloading(true);
    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const ext = photo.url.split(".").pop()?.split("?")[0] || "jpg";
        const safeTitle = item.title.replace(/[^\w\-]+/g, "_").slice(0, 40);
        await downloadUrl(photo.url, `${safeTitle}_${photo.label.replace(/\s+/g, "")}.${ext}`);
        await new Promise((r) => setTimeout(r, 300));
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">
            Publications & Bulletins
          </h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            View-only PR desk: bulletin PDFs and projects clubs submitted for district social media.
          </p>
        </div>
        <ReportingPeriodSelect value={selectedPeriod} onChange={setSelectedPeriod} />
      </div>

      {loading ? (
        <div className="p-16 text-center text-electric-blue font-metadata text-xs uppercase">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading submissions...
        </div>
      ) : (
        <>
          <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 overflow-hidden">
            <div className="p-5 border-b border-slate-800/60">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-electric-blue" />
                Club bulletins
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                PDF newsletters from Portal → Bulletin (not the same as “Submit for District Publication” on a project).
              </p>
            </div>
            {bulletinsError ? (
              <div className="p-8 text-sm text-red-400">{bulletinsError}</div>
            ) : bulletins.length === 0 ? (
              <div className="p-8 text-sm text-slate-500 space-y-2">
                <p>No club bulletin PDFs in this period.</p>
                <p className="text-xs text-slate-600">
                  Clubs must upload via Command Center → Bulletin. Ticking “Submit for District Publication” on an
                  activity only adds a PR request below — it does not create a bulletin PDF row.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {bulletins.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.club} · {item.edition}
                        {item.date ? ` · ${new Date(item.date).toLocaleDateString("en-IN")}` : ""}
                      </p>
                    </div>
                    {item.fileUrl ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-electric-blue text-xs font-bold flex items-center gap-1"
                      >
                        Download PDF <Download className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No file</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 overflow-hidden">
            <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">Social / PR publication requests</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Projects with “Submit for District Publication”. Open a row for full details and photo downloads.
                </p>
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title or club..."
                className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 text-xs text-slate-300 focus:outline-none min-w-[220px]"
              />
            </div>

            {filteredRequests.length === 0 ? (
              <div className="p-8 text-sm text-slate-500">No publication requests in this period.</div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {filteredRequests.map((item) => {
                  const photos = photoList(item);
                  return (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-900/30 transition-colors"
                    >
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-800 bg-navy-deep shrink-0">
                        {item.coverImage ? (
                          <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {item.club}
                          {item.zone ? ` · ${item.zone}` : ""} · {item.category} · {item.status}
                          {item.date
                            ? ` · ${new Date(item.date).toLocaleDateString("en-IN")}`
                            : ""}
                          {photos.length ? ` · ${photos.length} photo${photos.length > 1 ? "s" : ""}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" /> View details
                        </button>
                        {photos.length > 0 && (
                          <button
                            type="button"
                            disabled={downloading}
                            onClick={() => handleDownloadAll(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-electric-blue/15 hover:bg-electric-blue/25 text-electric-blue text-xs font-bold disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" /> Photos
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassPanel>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <GlassPanel className="w-full max-w-3xl bg-navy-dark border-slate-700 relative z-10 overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
            <div className="relative h-48 w-full shrink-0 bg-navy-deep">
              {selected.coverImage ? (
                <img src={selected.coverImage} alt="" className="w-full h-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark to-transparent" />
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-navy-deep/60 hover:bg-navy-deep text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-metadata font-bold px-2 py-0.5 rounded border border-electric-blue/20 bg-electric-blue/15 text-electric-blue uppercase tracking-wide">
                  {selected.avenues[0] || selected.category}
                </span>
                <h3 className="font-headline text-xl font-bold text-white mt-2 leading-tight">{selected.title}</h3>
                <p className="text-xs text-slate-500 font-metadata mt-1">
                  {selected.club}
                  {selected.zone ? ` · ${selected.zone}` : ""} · {selected.status}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-navy-deep/50 p-4 rounded-xl border border-slate-800/80">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Date</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-electric-blue" />
                    {selected.date ? new Date(selected.date).toLocaleDateString("en-IN") : "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Beneficiaries</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-500" />
                    {selected.beneficiaries}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Vol. hours</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {selected.volunteerHours}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Expenses</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    ₹{Number(selected.expenses || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {selected.venue && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-ocean-glow" /> {selected.venue}
                </p>
              )}

              {selected.description && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-metadata">Description</h4>
                  <p className="text-xs text-slate-300 font-body leading-relaxed whitespace-pre-line">
                    {selected.description}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-metadata">Photos</h4>
                  {photoList(selected).length > 0 && (
                    <button
                      type="button"
                      disabled={downloading}
                      onClick={() => handleDownloadAll(selected)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric-blue text-navy-deep text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      <Download className="w-3 h-3" />
                      {downloading ? "Downloading…" : "Download all"}
                    </button>
                  )}
                </div>
                {photoList(selected).length === 0 ? (
                  <p className="text-xs text-slate-500">No photos attached to this report.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {photoList(selected).map((photo) => (
                      <div key={photo.label} className="flex flex-col gap-2">
                        <div className="aspect-video rounded-xl overflow-hidden border border-slate-800 bg-navy-deep/40">
                          <a href={photo.url} target="_blank" rel="noreferrer">
                            <img
                              src={photo.url}
                              alt={photo.label}
                              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            />
                          </a>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 font-metadata uppercase">{photo.label}</span>
                          <button
                            type="button"
                            onClick={() =>
                              downloadUrl(
                                photo.url,
                                `${selected.title.replace(/[^\w\-]+/g, "_").slice(0, 40)}_${photo.label.replace(/\s+/g, "")}.jpg`
                              )
                            }
                            className="text-[10px] text-electric-blue font-bold flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <a
                href={selected.coverImage || "#"}
                target="_blank"
                rel="noreferrer"
                className={`text-xs text-slate-500 flex items-center gap-1 ${selected.coverImage ? "hover:text-electric-blue" : "pointer-events-none opacity-40"}`}
              >
                Open original cover <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
