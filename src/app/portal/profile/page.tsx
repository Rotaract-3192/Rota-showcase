"use client";

import React, { useState, useEffect } from "react";
import { User, Award, Layers, Mail, Phone, MapPin, Loader2, X, Check } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import GlassPanel from "@/components/GlassPanel";

export default function ProfilePage() {
  const { profile, club, district, primaryRole, isLoading, refreshProfile } = useProfile();
  
  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Initialize edit fields when profile is loaded
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setBloodGroup(profile.blood_group || "");
    }
  }, [profile, isEditing]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setIsSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const { error } = await supabase
        .from("member_profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          blood_group: bloodGroup
        })
        .eq("id", profile.id);

      if (error) throw error;

      await refreshProfile();
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg("");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24 text-electric-blue font-metadata font-bold text-xs uppercase tracking-widest animate-pulse">
        <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading profile...
      </div>
    );
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : "Member Profile";

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto relative">
      <div>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Member Profile</h1>
      </div>

      <div className="bg-navy-dark/40 border border-slate-800/60 rounded-2xl overflow-hidden">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-electric-blue/20 to-ocean-glow/20 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-2xl bg-navy-deep border border-slate-700/60 p-1 flex items-center justify-center">
              <div className="w-full h-full bg-navy-dark/80 rounded-xl flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Content */}
        <div className="pt-14 pb-8 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-white">{fullName}</h2>
              <p className="text-ocean-glow font-metadata text-xs font-bold uppercase tracking-wider mt-1">
                {primaryRole || "General Member"}, {club?.name || "Unassigned Club"}
              </p>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="flex flex-col gap-4 text-sm text-slate-300 font-body">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{profile?.phone || "No phone added"}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{district?.name || "District 3192"}</span>
              </div>
              {profile?.blood_group && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Blood Group:</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs">
                    {profile.blood_group}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-navy-deep/60 border border-slate-800">
                <p className="text-[10px] font-metadata text-slate-500 uppercase font-bold tracking-wider">Club Zone</p>
                <div className="flex items-center gap-2 mt-2 text-md font-headline font-bold text-white uppercase">
                  {club?.slug || "Zone 1"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-navy-deep/60 border border-slate-800">
                <p className="text-[10px] font-metadata text-slate-500 uppercase font-bold tracking-wider">Status</p>
                <div className="flex items-center gap-2 mt-2 text-md font-headline font-bold text-emerald-400 uppercase">
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-navy-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <GlassPanel glowColor="cyan" className="w-full max-w-md p-6 bg-navy-dark border-slate-800 flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-headline text-lg font-bold text-white">Edit Profile Details</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              {errorMsg && (
                <p className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg uppercase font-metadata tracking-wider">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg uppercase font-metadata tracking-wider flex items-center gap-2">
                  <Check className="w-4 h-4" /> {successMsg}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-500 font-metadata">First Name</label>
                  <input 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-deep border border-slate-800 text-sm text-white focus:outline-none focus:border-electric-blue/40" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-500 font-metadata">Last Name</label>
                  <input 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-deep border border-slate-800 text-sm text-white focus:outline-none focus:border-electric-blue/40" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-500 font-metadata">Phone Number</label>
                <input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-deep border border-slate-800 text-sm text-white focus:outline-none focus:border-electric-blue/40" 
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-500 font-metadata">Blood Group</label>
                <select 
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-deep border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-electric-blue/40"
                >
                  <option value="">Select Blood Group</option>
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

              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
