"use client";

import React, { useState, useEffect } from "react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { UserCircle, Shield, Mail, Loader2, Settings2, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  clubId: string;
  clubName: string;
  role: string;
  status: 'Active' | 'Suspended' | 'Pending';
  joinedDate: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal and invitation state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    phone: "",
    clubId: "",
    role: "General Member"
  });
  const [inviting, setInviting] = useState(false);

  // CRUD state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    club_id: "",
    role: "Member"
  });
  const [saving, setSaving] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/users'));
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const mapped = data.map((u: any) => ({
          id: u.id,
          name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unknown User",
          email: u.email || "",
          phone: u.phone || "",
          clubId: u.club_id || "",
          clubName: u.clubs?.name || "No Club Affiliation",
          role: u.member_roles?.[0]?.role || "Member",
          status: (u.auth_id?.startsWith("pending_") ? "Pending" : "Active") as 'Active' | 'Suspended' | 'Pending',
          joinedDate: u.created_at || new Date().toISOString()
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await fetch(apiUrl('/api/clubs'));
      if (res.ok) {
        const data = await res.json();
        setClubs(data || []);
      }
    } catch (err) {
      console.error("Failed to load clubs:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchClubs();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email || !inviteForm.role) {
      alert("Name, email, and role are required.");
      return;
    }
    setInviting(true);
    try {
      const res = await fetch(apiUrl('/api/admin/users/invite'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to invite user");
      }
      alert("User successfully invited! An email invitation was triggered.");
      setIsInviteModalOpen(false);
      setInviteForm({
        name: "",
        email: "",
        phone: "",
        clubId: "",
        role: "General Member"
      });
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/admin/users'), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          ...editForm
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/users?id=${userToDelete.id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }
      setUserToDelete(null);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.clubName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Manage roles, access, and accounts across the district.
          </p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 flex items-center gap-2 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          <Shield className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-24 text-electric-blue font-metadata font-bold text-xs uppercase tracking-widest animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading Users...
        </div>
      ) : (
        <AdminDataTable
          title="District Users"
          description="All registered users, admins, and pending accounts."
          data={filteredUsers}
        searchPlaceholder="Search by name, email, or club..."
        onSearch={setSearchTerm}
        columns={[
          {
            header: "User",
            cell: (user) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <UserCircle className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white leading-snug truncate">{user.name}</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-metadata truncate mt-0.5">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                </div>
              </div>
            )
          },
          {
            header: "Club Affiliation",
            accessorKey: "clubName",
            className: "text-slate-300 font-body text-xs"
          },
          {
            header: "Role",
            cell: (user) => {
              const isAdmin = user.role.includes("Admin");
              return (
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border",
                  isAdmin ? "bg-electric-blue/10 text-electric-blue border-electric-blue/20" : "bg-slate-800 text-slate-300 border-slate-700"
                )}>
                  {isAdmin && <Shield className="w-3 h-3 mr-1" />}
                  {user.role}
                </span>
              );
            }
          },
          {
            header: "Status",
            cell: (user) => (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border",
                user.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                user.status === 'Pending' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                "bg-rose-500/10 text-rose-400 border-rose-500/20"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", 
                  user.status === 'Active' ? "bg-emerald-400 animate-pulse" : 
                  user.status === 'Pending' ? "bg-amber-400" : "bg-rose-400"
                )} />
                {user.status}
              </span>
            )
          },
          {
            header: "Actions",
            cell: (user) => (
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => setSelectedUser(user)}
                  className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setEditForm({
                      first_name: user.name.split(' ')[0] || '',
                      last_name: user.name.split(' ').slice(1).join(' ') || '',
                      phone: user.phone || '',
                      club_id: user.clubId || '',
                      role: user.role || 'Member'
                    });
                    setEditingUser(user);
                  }}
                  className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Edit User"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(user)}
                  className="p-1.5 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          }
        ]}
      />
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-navy-dark/90 border border-slate-800/80 p-6 rounded-2xl max-w-md w-full shadow-2xl flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-electric-blue" />
                Invite New User
              </h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4 text-sm font-body">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. john@example.com"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 9876543210"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Club Affiliation</label>
                <select
                  value={inviteForm.clubId}
                  onChange={(e) => setInviteForm({ ...inviteForm, clubId: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50 font-body appearance-none cursor-pointer"
                >
                  <option value="" className="bg-navy-deep text-slate-400">Select a club...</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id} className="bg-navy-deep text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Role / Position</label>
                <select
                  required
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50 font-body appearance-none cursor-pointer font-bold"
                >
                  <option value="General Member" className="bg-navy-deep text-white">General Member</option>
                  <option value="President" className="bg-navy-deep text-white">Club President</option>
                  <option value="Secretary" className="bg-navy-deep text-white">Club Secretary</option>
                  <option value="Board Member" className="bg-navy-deep text-white">Club Board Member</option>
                  <option value="District Admin" className="bg-navy-deep text-white">District Admin</option>
                  <option value="District Core Team" className="bg-navy-deep text-white">District Core Team</option>
                  <option value="District Rotaract Secretary" className="bg-navy-deep text-white">District Rotaract Secretary</option>
                  <option value="Super Admin" className="bg-navy-deep text-white">Super Admin</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={inviting}
                className="w-full py-2.5 rounded-lg bg-electric-blue hover:bg-ocean-glow text-navy-deep font-bold transition-all mt-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  "Send Invitation Email"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-navy-dark/90 border border-rose-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scale-in text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="font-headline text-xl font-bold text-white">Delete User?</h3>
            <p className="text-sm text-slate-300 font-body">
              Are you sure you want to delete <span className="font-bold text-white">{userToDelete.name}</span>? This action cannot be undone and will remove all their access.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-navy-dark/90 border border-slate-800/80 p-6 rounded-2xl max-w-md w-full shadow-2xl flex flex-col gap-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-electric-blue" />
                User Details
              </h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-sm font-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Name</span>
                  <span className="text-white font-bold">{selectedUser.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Email</span>
                  <span className="text-white">{selectedUser.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Phone</span>
                  <span className="text-white">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Status</span>
                  <span className="text-white">{selectedUser.status}</span>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Role</span>
                  <span className="text-white">{selectedUser.role}</span>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Club Affiliation</span>
                  <span className="text-white">{selectedUser.clubName}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 pt-4 border-t border-slate-800/60">
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-navy-dark/90 border border-slate-800/80 p-6 rounded-2xl max-w-md w-full shadow-2xl flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-400" />
                Edit User
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 text-sm font-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Last Name</label>
                  <input 
                    type="text" 
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Phone Number</label>
                <input 
                  type="tel" 
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Club Affiliation</label>
                <select
                  value={editForm.club_id}
                  onChange={(e) => setEditForm({ ...editForm, club_id: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50 font-body appearance-none cursor-pointer"
                >
                  <option value="" className="bg-navy-deep text-slate-400">Select a club...</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id} className="bg-navy-deep text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider font-bold">Role / Position</label>
                <select
                  required
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-700/60 text-white focus:outline-none focus:border-electric-blue/50 font-body appearance-none cursor-pointer font-bold"
                >
                  <option value="General Member" className="bg-navy-deep text-white">General Member</option>
                  <option value="President" className="bg-navy-deep text-white">Club President</option>
                  <option value="Secretary" className="bg-navy-deep text-white">Club Secretary</option>
                  <option value="Board Member" className="bg-navy-deep text-white">Club Board Member</option>
                  <option value="District Admin" className="bg-navy-deep text-white">District Admin</option>
                  <option value="District Core Team" className="bg-navy-deep text-white">District Core Team</option>
                  <option value="Super Admin" className="bg-navy-deep text-white">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
