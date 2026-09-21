"use client";

import React, { useEffect, useState } from "react";
import { Upload, FileText, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import GlassPanel from "@/components/GlassPanel";

function isPdfFile(file: File) {
  const type = (file.type || "").toLowerCase();
  return type === "application/pdf" || type === "application/x-pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function BulletinUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitted, setSubmitted] = useState<any[]>([]);

  async function loadSubmitted() {
    try {
      const res = await fetch("/api/portal/bulletins");
      const json = await res.json();
      if (res.ok) setSubmitted(json.bulletins || []);
    } catch {
      // keep the form usable even if history fails
    }
  }

  useEffect(() => {
    loadSubmitted();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    if (!isPdfFile(selectedFile)) {
      setErrorMsg("Please upload a PDF file.");
      return;
    }
    setErrorMsg("");
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !month) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || "Failed to upload PDF");

      const saveRes = await fetch("/api/portal/bulletins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, edition: month, fileUrl: uploadJson.url }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveJson.error || "Failed to submit bulletin");
      setSuccessMsg(`Saved “${title}” for ${month}. District can open it under Admin → Publications.`);
      setFile(null);
      setTitle("");
      setMonth("");
      await loadSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit bulletin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-electric-blue" />
          Club Bulletin
        </h1>
        <p className="text-slate-400 text-sm font-body">
          Upload your club's monthly bulletin or newsletter in PDF format. Submitted files stay listed below.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm">{errorMsg}</div>
      )}

      <GlassPanel className="p-6 md:p-8 border-slate-800/60 bg-navy-dark/40">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-metadata">
                Bulletin Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Rotaract Chronicle"
                className="w-full px-4 py-3 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-metadata">
                Month/Edition
              </label>
              <select
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none transition-all"
              >
                <option value="" disabled>Select Month...</option>
                <option value="July 2026">July 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="December 2026">December 2026</option>
                <option value="January 2027">January 2027</option>
                <option value="February 2027">February 2027</option>
                <option value="March 2027">March 2027</option>
                <option value="April 2027">April 2027</option>
                <option value="May 2027">May 2027</option>
                <option value="June 2027">June 2027</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-metadata">
              Upload PDF File
            </label>
            <div className="relative group cursor-pointer w-full flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed border-slate-700/60 hover:border-electric-blue/50 rounded-2xl bg-navy-deep/50 hover:bg-navy-deep transition-all">
              <input
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
                <div className="p-4 rounded-full bg-slate-800/80 text-electric-blue group-hover:scale-110 group-hover:bg-electric-blue/10 transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">{file.name}</span>
                    <span className="text-[10px] font-metadata text-emerald-400 uppercase">Ready for upload</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">Click or drag PDF to upload</span>
                    <span className="text-xs text-slate-500 font-body">Maximum file size: 10MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex justify-end">
            <button
              type="submit"
              disabled={!file || !title || !month || isSubmitting}
              className="px-6 py-3 rounded-xl bg-electric-blue hover:bg-ocean-glow text-navy-deep font-bold text-sm tracking-wide flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Uploading..." : "Submit Bulletin"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </GlassPanel>

      <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 overflow-hidden">
        <div className="p-5 border-b border-slate-800/60">
          <h3 className="font-headline text-lg font-bold text-white">Submitted bulletins</h3>
          <p className="text-xs text-slate-400 mt-1">If a file is listed here, district can see it on Admin → Publications.</p>
        </div>
        {submitted.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No bulletins submitted yet.</div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {submitted.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-500">
                    {item.edition}
                    {item.created_at ? ` · ${new Date(item.created_at).toLocaleString("en-IN")}` : ""}
                  </p>
                </div>
                {item.file_url ? (
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="text-electric-blue text-xs font-bold flex items-center gap-1">
                    Open PDF <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
