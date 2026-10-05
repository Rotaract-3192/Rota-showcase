"use client";

import React, { useMemo, useState } from "react";
import { X, Search, Download, Copy, Check, Mail, Phone } from "lucide-react";
import GlassPanel from "@/components/GlassPanel";

type Contact = { name: string; email: string | null; phone: string | null };

export type ClubReportingRow = {
  id: string;
  name: string;
  zone: string;
  reported: boolean;
  reports: number;
  published: number;
  lastReportDate: string | null;
  clubEmail: string | null;
  president: Contact | null;
  secretary: Contact | null;
};

type Tab = "pending" | "reported";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function contactEmails(row: ClubReportingRow) {
  return [row.president?.email, row.secretary?.email, row.clubEmail].filter(Boolean) as string[];
}

function ContactLine({ label, contact }: { label: string; contact: Contact | null }) {
  if (!contact) return <p className="text-[10px] text-slate-600">{label}: not on portal</p>;
  return (
    <div className="text-[11px] text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-0.5">
      <span>
        <span className="text-slate-500">{label}:</span> {contact.name || "—"}
      </span>
      {contact.email && (
        <a href={`mailto:${contact.email}`} className="text-electric-blue hover:underline flex items-center gap-1">
          <Mail className="w-3 h-3" /> {contact.email}
        </a>
      )}
      {contact.phone && (
        <a href={`tel:${contact.phone}`} className="text-electric-blue hover:underline flex items-center gap-1">
          <Phone className="w-3 h-3" /> {contact.phone}
        </a>
      )}
    </div>
  );
}

export default function ClubReportingModal({
  rows,
  periodLabel,
  onClose,
}: {
  rows: ClubReportingRow[];
  periodLabel: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const reportedCount = rows.filter((row) => row.reported).length;
  const pendingCount = rows.length - reportedCount;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (tab === "reported" ? row.reported : !row.reported) &&
        (!term ||
          `${row.name} ${row.zone} ${row.president?.name || ""} ${row.secretary?.name || ""}`
            .toLowerCase()
            .includes(term))
    );
  }, [rows, tab, search]);

  const handleCopyEmails = async () => {
    const emails = Array.from(new Set(visible.flatMap(contactEmails)));
    if (!emails.length) return;
    await navigator.clipboard.writeText(emails.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const header = [
      "Club",
      "Zone",
      "Status",
      "Reports",
      "Published",
      "Last project date",
      "President",
      "President email",
      "President phone",
      "Secretary",
      "Secretary email",
      "Secretary phone",
      "Club email",
    ];
    const lines = visible.map((row) =>
      [
        row.name,
        row.zone,
        row.reported ? "Reported" : "Not reported",
        row.reports,
        row.published,
        row.lastReportDate ? new Date(row.lastReportDate).toLocaleDateString("en-IN") : "",
        row.president?.name,
        row.president?.email,
        row.president?.phone,
        row.secretary?.name,
        row.secretary?.email,
        row.secretary?.phone,
        row.clubEmail,
      ]
        .map(csvCell)
        .join(",")
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clubs-${tab === "reported" ? "reported" : "not-reported"}-${periodLabel.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
      active ? "bg-electric-blue text-navy-deep" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={onClose} />
      <GlassPanel className="w-full max-w-4xl bg-navy-dark border-slate-700 relative z-10 overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-800/60 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-xl font-bold text-white">Club reporting status</h3>
            <p className="text-xs text-slate-400 mt-1">
              {reportedCount} of {rows.length} clubs have at least one submission · {periodLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-navy-deep/60 hover:bg-navy-deep text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === "pending")} onClick={() => setTab("pending")}>
              Not reported ({pendingCount})
            </button>
            <button type="button" className={tabClass(tab === "reported")} onClick={() => setTab("reported")}>
              Reported ({reportedCount})
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search club, zone, name..."
                className="pl-8 pr-3 py-2 rounded-lg bg-navy-deep border border-slate-800 text-xs text-slate-300 focus:outline-none min-w-[200px]"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyEmails}
              disabled={!visible.length}
              className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy emails"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!visible.length}
              className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar divide-y divide-slate-800/40">
          {visible.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              {tab === "pending" && !search ? "Every club has reported in this period 🎉" : "No clubs match."}
            </div>
          ) : (
            visible.map((row) => (
              <div key={row.id} className="p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white text-sm">{row.name}</p>
                    <p className="text-[10px] text-slate-500 font-metadata uppercase">{row.zone}</p>
                  </div>
                  {row.reported ? (
                    <div className="text-right">
                      <p className="text-xs text-emerald-400 font-bold">
                        {row.reports} report{row.reports === 1 ? "" : "s"} · {row.published} published
                      </p>
                      {row.lastReportDate && (
                        <p className="text-[10px] text-slate-500">
                          Latest project {new Date(row.lastReportDate).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 uppercase">
                      No submissions
                    </span>
                  )}
                </div>
                <ContactLine label="President" contact={row.president} />
                <ContactLine label="Secretary" contact={row.secretary} />
                {row.clubEmail && (
                  <a href={`mailto:${row.clubEmail}`} className="text-[11px] text-electric-blue hover:underline w-fit">
                    Club email: {row.clubEmail}
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
