"use client";

import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/GlassPanel";
import { Users, Plus, X, Trash2, Mail, Phone, Loader2, Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface MemberRole {
  id: string;
  role: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  blood_group: string | null;
  created_at: string;
  member_roles: MemberRole[];
}

export default function PortalMembersPage() {
  const { user } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [role, setRole] = useState("Member");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/portal/members");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load members");
      }
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          memberEmail: email,
          phone,
          bloodGroup,
          role,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add member");
      }

      await fetchMembers(); // Refresh the list
      
      setIsModalOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setBloodGroup("");
      setRole("Member");
      
      setSuccessMsg("Member added successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      setErrorMsg("");
      const res = await fetch(`/api/portal/members?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete member");
      }

      setMembers(members.filter((m) => m.id !== id));
      setSuccessMsg("Member removed successfully");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const filteredMembers = members.filter(m => 
    `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-12 animate-fade-in relative">
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg border border-emerald-500/30 bg-navy-dark/90 text-emerald-400 text-xs font-bold font-metadata shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-2 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg border border-rose-500/30 bg-navy-dark/90 text-rose-400 text-xs font-bold font-metadata shadow-[0_0_15px_rgba(244,63,94,0.25)] flex items-center gap-2 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-electric-blue" />
            Club Members
          </h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Manage your club's roster, add new members, and organize leadership roles.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 flex items-center gap-2 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 focus:border-electric-blue/40 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="text-xs font-metadata text-slate-400">
            Total Members: <span className="text-electric-blue font-bold">{members.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
            <p className="text-slate-500 text-xs font-metadata">Loading members roster...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-12 h-12 text-slate-600" />
            <p className="text-slate-400 text-sm">No members found in your club.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy-deep/60 border-b border-slate-800/60">
                  <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Member</th>
                  <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Blood Group</th>
                  <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center text-electric-blue font-bold text-xs uppercase">
                          {member.first_name[0]}{member.last_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-200">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-metadata">
                            Added: {new Date(member.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {member.member_roles?.map(r => (
                          <span key={r.id} className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                            r.role === "President" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            r.role === "Secretary" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            r.role === "Vice President" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            "bg-slate-700/50 text-slate-300 border-slate-600/50"
                          )}>
                            {r.role}
                          </span>
                        ))}
                        {(!member.member_roles || member.member_roles.length === 0) && (
                          <span className="text-[10px] text-slate-500 italic">No role</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" /> {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Phone className="w-3 h-3 text-slate-500" /> {member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-slate-300">
                        {member.blood_group || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        onClick={() => handleDelete(member.id)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors inline-flex cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <GlassPanel className="w-full max-w-lg p-6 bg-navy-dark border-slate-700 relative z-10 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-electric-blue" />
                Add Club Member
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">First Name <span className="text-rose-400">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Last Name <span className="text-rose-400">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Email Address <span className="text-rose-400">*</span></label>
                <input 
                  type="email" 
                  required
                  placeholder="member@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Role <span className="text-rose-400">*</span></label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Member">Member</option>
                    <option value="President">President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Vice President">Vice President</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Sergeant-at-Arms">Sergeant-at-Arms</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Blood Group</label>
                  <select 
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 rounded-lg bg-electric-blue hover:bg-ocean-glow text-navy-deep text-xs font-bold font-metadata transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Adding Member...</>
                ) : (
                  "Confirm Add Member"
                )}
              </button>
            </form>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
