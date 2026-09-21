"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import GlassPanel from "@/components/GlassPanel";

export default function BulletinUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !month) return;

    setIsSubmitting(true);
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
      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit bulletin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center gap-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Bulletin Uploaded Successfully!</h1>
          <p className="text-slate-400 font-body">Your club bulletin "{title}" for {month} has been submitted to the district for review.</p>
        </div>
        <button 
          onClick={() => { setIsSuccess(false); setFile(null); setTitle(""); setMonth(""); }}
          className="mt-4 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700"
        >
          Upload Another Bulletin
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-electric-blue" />
          Club Bulletin
        </h1>
        <p className="text-slate-400 text-sm font-body">
          Upload your club's monthly bulletin or newsletter in PDF format.
        </p>
      </div>

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
                accept=".pdf"
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
    </div>
  );
}
