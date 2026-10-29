"use client";

import React, { useState } from "react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import GlassPanel from "@/components/GlassPanel";
import { useStore, Club } from "@/store/useStore";
import { useAuthContext } from "@/components/providers/auth-provider";
import { DISTRICT_ZONES, isDistrictWideAdminRole } from "@/lib/zones";
import { apiUrl } from "@/lib/api";
import { 
  ShieldCheck, 
  MoreHorizontal, 
  ExternalLink, 
  Download,
  ArrowLeft,
  Building2,
  Users,
  Trophy,
  Layers,
  Mail,
  Calendar,
  Award,
  Plus,
  Loader2
} from "lucide-react";

const EMPTY_OFFICIAL = { name: "", email: "", phone: "" };

const EMPTY_FORM = {
  name: "",
  zone: "",
  clubType: "Community Based",
  email: "",
  partnerClub: "",
  charterDate: "",
  description: "",
  president: { ...EMPTY_OFFICIAL },
  secretary: { ...EMPTY_OFFICIAL },
};

export default function AdminClubsPage() {
  const clubs = useStore((state) => state.clubs);
  const setClubs = useStore((state) => state.setClubs);
  const projects = useStore((state) => state.projects);
  const { profileData } = useAuthContext();
  const canAddClub = profileData?.roles.some((r) => isDistrictWideAdminRole(r.role)) ?? false;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedClubType, setSelectedClubType] = useState("All");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const setSelectedProjectId = useStore((state) => state.setSelectedProjectId);

  const zones = DISTRICT_ZONES;
  const clubTypes = ["Community Based", "Institution Based"];

  const handleAddClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.zone) {
      setFormError("Club name and zone are required.");
      return;
    }
    if (!form.president.name.trim() || !form.president.email.trim()) {
      setFormError("President name and email are required so they can sign in to the portal.");
      return;
    }
    const secretaryFilled =
      form.secretary.name.trim() || form.secretary.email.trim() || form.secretary.phone.trim();
    if (secretaryFilled && (!form.secretary.name.trim() || !form.secretary.email.trim())) {
      setFormError("Secretary needs both a name and an email, or leave that section blank.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(apiUrl("/api/admin/clubs"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to add club");
      const created = json.club;
      const mapped: Club = {
        id: created.id,
        name: created.name,
        logo: created.logo_url || "",
        leaders: [
          form.president.name ? { designation: "President", name: form.president.name } : null,
          form.secretary.name ? { designation: "Secretary", name: form.secretary.name } : null,
        ].filter(Boolean) as { designation: string; name: string }[],
        charterYear: created.charter_date
          ? new Date(created.charter_date).getFullYear().toString()
          : new Date().getFullYear().toString(),
        memberCount: created.member_count || 0,
        totalProjects: created.total_projects || 0,
        totalPoints: created.total_points || 0,
        zone: created.zone,
        description: created.description || "",
        email: created.email || created.club_email || "",
        clubType: created.club_type || form.clubType,
        partnerClub: created.partner_rotary_club || "",
      };
      setClubs([mapped, ...clubs]);
      const invited = Array.isArray(json.invited) ? json.invited : [];
      const inviteErrors = Array.isArray(json.inviteErrors) ? json.inviteErrors : [];
      const invitedLabel = invited.length
        ? ` Clerk invites sent to ${invited.map((p: { role: string; email: string }) => `${p.role} (${p.email})`).join(" and ")}.`
        : "";
      const warnLabel = inviteErrors.length ? ` Invite issue: ${inviteErrors.join(" ")}` : "";
      setSuccessMsg(`${created.name} is on the portal.${invitedLabel}${warnLabel}`);
      setIsAddOpen(false);
      setForm({
        ...EMPTY_FORM,
        president: { ...EMPTY_OFFICIAL },
        secretary: { ...EMPTY_OFFICIAL },
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to add club");
    } finally {
      setSaving(false);
    }
  };

  const sortedClubs = [...clubs].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.totalProjects - a.totalProjects;
  });

  const filteredClubs = sortedClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) || (club.zone || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === "All" || club.zone === selectedZone;
    const matchesType = selectedClubType === "All" || (club.clubType && club.clubType === selectedClubType);
    return matchesSearch && matchesZone && matchesType;
  });

  // If a club is selected, render the Club Details View
  if (selectedClubId) {
    const club = clubs.find((c) => c.id === selectedClubId);
    
    if (club) {
      const clubProjects = projects.filter((p) => p.clubId === club.id);
      const rank = sortedClubs.findIndex(c => c.id === club.id) + 1;
      


      return (
        <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-12 animate-fade-in">
          <div>
            <button 
              onClick={() => setSelectedClubId(null)}
              className="inline-flex items-center gap-2 text-xs font-metadata font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Clubs Directory
            </button>
          </div>

          {/* Profile Header */}
          <GlassPanel className="p-6 md:p-8 border-slate-800/60 bg-navy-dark/40 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-20 h-20 rounded-2xl bg-navy-deep border border-slate-800 flex items-center justify-center p-2 shrink-0">
                {club.logo ? (
                  <img src={club.logo} alt={club.name} className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                  {club.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs font-metadata">
                  <span className="text-electric-blue font-bold uppercase tracking-wider">{club.zone}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {club.email}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Chartered {club.charterYear}
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-metadata uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" /> Active Status
            </span>
          </GlassPanel>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">District Standings</span>
                <span className="text-2xl font-headline font-bold text-white">Rank #{rank}</span>
              </div>
              <Trophy className="w-8 h-8 text-amber-500 opacity-20" />
            </GlassPanel>

            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Registered Members</span>
                <span className="text-2xl font-headline font-bold text-white">{club.memberCount} Members</span>
              </div>
              <Users className="w-8 h-8 text-pink-500 opacity-20" />
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Showcase Projects</span>
                <span className="text-2xl font-headline font-bold text-white">{club.totalProjects} Completed</span>
              </div>
              <Layers className="w-8 h-8 text-emerald-400 opacity-20" />
            </GlassPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* About & Office Bearers */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* About */}
              <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4">
                <h3 className="font-headline text-base font-bold text-white border-b border-slate-800/60 pb-2">About Club</h3>
                <p className="text-xs text-slate-300 font-body leading-relaxed">
                  {club.description || "No description provided for this club. This club represents active Rotaractors working on local community developments, environmental conservation, and youth leadership training."}
                </p>
              </GlassPanel>

              {/* Officers */}
              <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4">
                <h3 className="font-headline text-base font-bold text-white border-b border-slate-800/60 pb-2">Club Officers</h3>
                <div className="flex flex-col gap-3">
                  {club.leaders && club.leaders.length > 0 ? (
                    club.leaders.map((officer: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-navy-deep/40 border border-slate-800/60">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{officer.name}</span>
                          <span className="text-[10px] text-slate-500 font-metadata">{officer.email || officer.phone || "No contact info"}</span>
                        </div>
                        <span className="text-[9px] font-metadata font-bold px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 uppercase">
                          {officer.designation}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 font-body py-4 text-center">No club officers listed.</div>
                  )}
                </div>
              </GlassPanel>
            </div>

            {/* Club's Showcase Projects list */}
            <div className="lg:col-span-2">
              <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-4 h-full">
                <h3 className="font-headline text-base font-bold text-white border-b border-slate-800/60 pb-2">Showcase Projects</h3>
                
                {clubProjects.length > 0 ? (
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
                    {clubProjects.map((project) => (
                      <div 
                        key={project.id} 
                        className="p-4 rounded-xl bg-navy-deep/40 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/60 transition-colors group"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded bg-navy-deep border border-slate-700 overflow-hidden shrink-0 group-hover:border-electric-blue/50 transition-colors">
                            <img src={project.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white leading-snug truncate group-hover:text-electric-blue transition-colors">{project.title}</span>
                            <span className="text-[9px] text-slate-500 font-metadata uppercase tracking-wider mt-0.5">
                              Projects: {club.totalProjects}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs font-body gap-2">
                    <Layers className="w-8 h-8 opacity-40 text-slate-600" />
                    <span>No projects submitted yet</span>
                  </div>
                )}
              </GlassPanel>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Club Management</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Manage all Rotaract clubs within District 3192.
          </p>
          {successMsg && (
            <p className="text-xs text-emerald-400 mt-2">{successMsg}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canAddClub && (
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setIsAddOpen(true);
              }}
              className="px-4 py-2 flex items-center gap-2 rounded-lg bg-electric-blue hover:bg-ocean-glow text-navy-deep text-xs font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add club
            </button>
          )}
          <button 
            onClick={() => {
              const headers = ["ID", "Name", "President", "Charter Year", "Members", "Projects", "Points", "Zone", "Email"];
              const getPres = (leaders: any[]) => {
                const pres = leaders.find(l => l.designation.toLowerCase().includes("president"));
                return pres ? pres.name : "N/A";
              };
              const rows = clubs.map(c => [c.id, `"${c.name}"`, `"${getPres(c.leaders)}"`, c.charterYear, c.memberCount, c.totalProjects, c.totalPoints, c.zone, c.email]);
              const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", "District_3192_Clubs_Directory.csv");
              link.click();
            }}
            className="px-4 py-2 flex items-center gap-2 rounded-lg bg-navy-deep border border-slate-700 hover:border-slate-500 text-xs font-bold text-white transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Directory
          </button>
        </div>
      </div>

      <AdminDataTable<Club>
        title="District Clubs Directory"
        description="Complete list of active and inactive clubs."
        data={filteredClubs}
        searchPlaceholder="Search by name or zone..."
        onSearch={setSearchTerm}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-2 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-xs text-slate-300 focus:outline-none focus:border-electric-blue/50"
            >
              <option value="All">All Zones</option>
              {zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <select
              value={selectedClubType}
              onChange={(e) => setSelectedClubType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-xs text-slate-300 focus:outline-none focus:border-electric-blue/50"
            >
              <option value="All">All Types</option>
              {clubTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        }
        columns={[
          {
            header: "Club Identity",
            cell: (club) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-deep border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {club.logo ? (
                    <img src={club.logo} alt={club.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex flex-col">
                  <button 
                    onClick={() => setSelectedClubId(club.id)}
                    className="font-bold text-white text-left leading-snug hover:text-electric-blue transition-colors cursor-pointer"
                  >
                    {club.name}
                  </button>
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider">{club.zone}</span>
                </div>
              </div>
            )
          },
          {
            header: "Members",
            accessorKey: "memberCount",
            className: "font-metadata font-bold text-electric-blue"
          },
          {
            header: "Rank",
            cell: (club) => {
              const rank = sortedClubs.findIndex(c => c.id === club.id) + 1;
              return (
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-ocean-glow/10 text-ocean-glow font-metadata text-xs font-bold border border-ocean-glow/20">
                    {rank}
                  </span>
                </div>
              );
            }
          },

          {
            header: "Status",
            cell: () => (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            )
          },
          {
            header: "",
            cell: (club) => (
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => setSelectedClubId(club.id)}
                  className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="View Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )
          }
        ]}
      />

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-navy-dark/90 border border-slate-800/80 p-6 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-electric-blue" />
                Add a club
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Adds the club to the directory and sends Clerk invites to the President (and Secretary, if filled) so they can sign in.
            </p>
            {formError && (
              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                {formError}
              </div>
            )}
            <form onSubmit={handleAddClub} className="flex flex-col gap-4 text-sm font-body">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Club name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rotaract Club of Jayanagar"
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Zone</label>
                  <select
                    required
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50 appearance-none cursor-pointer"
                  >
                    <option value="">Select zone...</option>
                    {DISTRICT_ZONES.map((zone) => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Club type</label>
                  <select
                    value={form.clubType}
                    onChange={(e) => setForm({ ...form, clubType: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50 appearance-none cursor-pointer"
                  >
                    {clubTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Club email (optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="club@example.com"
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Charter date (optional)</label>
                  <input
                    type="date"
                    value={form.charterDate}
                    onChange={(e) => setForm({ ...form, charterDate: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Partner Rotary club (optional)</label>
                <input
                  type="text"
                  value={form.partnerClub}
                  onChange={(e) => setForm({ ...form, partnerClub: e.target.value })}
                  placeholder="e.g. Rotary Club of Bengaluru Jayanagar"
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Short description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Shown on the public club directory."
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50 resize-none"
                />
              </div>

              <div className="border-t border-slate-800/60 pt-4 flex flex-col gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-electric-blue" />
                    Club officials
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    They get an email invite to create a portal login. President is required; Secretary is optional.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 p-3 flex flex-col gap-3">
                  <p className="text-[10px] font-metadata uppercase tracking-wider font-bold text-electric-blue">President</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={form.president.name}
                      onChange={(e) => setForm({ ...form, president: { ...form.president, name: e.target.value } })}
                      placeholder="Full name"
                      className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                    />
                    <input
                      type="email"
                      required
                      value={form.president.email}
                      onChange={(e) => setForm({ ...form, president: { ...form.president, email: e.target.value } })}
                      placeholder="email@example.com"
                      className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <input
                    type="tel"
                    value={form.president.phone}
                    onChange={(e) => setForm({ ...form, president: { ...form.president, phone: e.target.value } })}
                    placeholder="Phone (optional)"
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div className="rounded-xl border border-slate-800/80 p-3 flex flex-col gap-3">
                  <p className="text-[10px] font-metadata uppercase tracking-wider font-bold text-slate-400">Secretary (optional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={form.secretary.name}
                      onChange={(e) => setForm({ ...form, secretary: { ...form.secretary, name: e.target.value } })}
                      placeholder="Full name"
                      className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                    />
                    <input
                      type="email"
                      value={form.secretary.email}
                      onChange={(e) => setForm({ ...form, secretary: { ...form.secretary, email: e.target.value } })}
                      placeholder="email@example.com"
                      className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <input
                    type="tel"
                    value={form.secretary.phone}
                    onChange={(e) => setForm({ ...form, secretary: { ...form.secretary, phone: e.target.value } })}
                    placeholder="Phone (optional)"
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-electric-blue hover:bg-ocean-glow text-navy-deep font-bold transition-all mt-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving club...
                  </>
                ) : (
                  "Save club"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
