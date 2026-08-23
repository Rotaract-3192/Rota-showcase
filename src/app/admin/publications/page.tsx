"use client";

import React, { useState } from "react";
import GlassPanel from "@/components/GlassPanel";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { FileText, Plus, Eye, Edit2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Publication {
  id: string;
  title: string;
  category: "Newsletter" | "Press Release" | "Circular" | "Blog";
  author: string;
  date: string;
  status: "Draft" | "Published";
}

const mockPublications: Publication[] = [
  { id: "pub_1", title: "District Assembly 2026: Official Guidelines", category: "Circular", author: "DRR Team", date: "2026-06-25", status: "Published" },
  { id: "pub_2", title: "Ocean of Impact: June 2026 Edition", category: "Newsletter", author: "Editorial Board", date: "2026-06-20", status: "Published" },
  { id: "pub_3", title: "Rotaract Day Celebrations in Pravaha", category: "Blog", author: "Rtr. Ananya", date: "2026-06-15", status: "Draft" },
];

export default function AdminPublicationsPage() {
  const [pubs, setPubs] = useState<Publication[]>(mockPublications);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Newsletter" | "Press Release" | "Circular" | "Blog">("Circular");
  const [author, setAuthor] = useState("DRR Team");
  const [status, setStatus] = useState<"Draft" | "Published">("Published");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    if (editingId) {
      setPubs(pubs.map(p => p.id === editingId ? {
        ...p,
        title,
        category,
        author,
        status
      } : p));
      setSuccessMsg("Publication updated successfully!");
    } else {
      const newPub: Publication = {
        id: `pub_${Date.now()}`,
        title,
        category,
        author,
        date: new Date().toISOString().split('T')[0],
        status
      };
      setPubs([newPub, ...pubs]);
      setSuccessMsg("Publication created successfully!");
    }

    setTitle("");
    setIsModalOpen(false);
    setEditingId(null);

    setSuccessMsg("Publication created successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDelete = (id: string) => {
    setPubs(pubs.filter(p => p.id !== id));
  };

  const filteredPubs = pubs.filter(pub => 
    pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pub.category.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Publications</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Manage official district announcements, newsletters, circulars, and media.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setTitle("");
            setCategory("Circular");
            setAuthor("DRR Team");
            setStatus("Published");
            setIsModalOpen(true);
          }}
          className="px-4 py-2 flex items-center gap-2 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          Create Publication
        </button>
      </div>

      <AdminDataTable<Publication>
        title="Official Publications"
        description="Write, edit, and release documents to all district members."
        data={filteredPubs}
        searchPlaceholder="Search title or category..."
        onSearch={setSearchTerm}
        columns={[
          {
            header: "Document",
            cell: (pub) => (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-navy-deep border border-slate-800">
                  <FileText className="w-5 h-5 text-electric-blue" />
                </div>
                <span className="font-bold text-white leading-snug">{pub.title}</span>
              </div>
            )
          },
          {
            header: "Category",
            accessorKey: "category",
            className: "text-xs font-metadata uppercase text-slate-400"
          },
          {
            header: "Author",
            accessorKey: "author",
            className: "text-xs font-body"
          },
          {
            header: "Release Date",
            accessorKey: "date",
            className: "text-xs font-metadata"
          },
          {
            header: "Status",
            cell: (pub) => (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border",
                pub.status === 'Published' 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-slate-700/30 text-slate-400 border-slate-700/60"
              )}>
                {pub.status}
              </span>
            )
          },
          {
            header: "",
            cell: (pub) => (
              <div className="flex items-center gap-2 justify-end">
                <button className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setEditingId(pub.id);
                    setTitle(pub.title);
                    setCategory(pub.category);
                    setAuthor(pub.author);
                    setStatus(pub.status);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" 
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(pub.id)}
                  className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          }
        ]}
      />

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <GlassPanel className="w-full max-w-lg p-6 bg-navy-dark border-slate-700 relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-electric-blue" />
                {editingId ? "Edit Publication" : "New Publication"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Document Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. District Branding Guidelines 2026/27"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Circular">Circular</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Press Release">Press Release</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Author</label>
                  <input 
                    type="text" 
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-2.5 rounded-lg bg-electric-blue hover:bg-ocean-glow text-navy-deep text-xs font-bold font-metadata transition-colors shadow-lg"
              >
                {editingId ? "Update Document" : "Create Document"}
              </button>
            </form>
          </GlassPanel>
        </div>
      )}

    </div>
  );
}
