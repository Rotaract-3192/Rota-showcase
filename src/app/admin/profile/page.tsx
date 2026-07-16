"use client";

import React from "react";
import GlassPanel from "@/components/GlassPanel";
import { UserCircle, Shield, Mail, Key } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AdminProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="flex justify-center p-12 text-white">Loading profile...</div>;
  }

  const name = user?.fullName || user?.firstName || "Unknown User";
  const email = user?.primaryEmailAddress?.emailAddress || "No Email";

  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Admin Profile</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Manage your personal details and system credentials.
          </p>
        </div>
      </div>

      <GlassPanel className="p-6 md:p-8 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-slate-800/60 pb-5">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-10 h-10 text-slate-500" />
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="font-headline text-lg font-bold text-white leading-tight">{name}</h3>
            <span className="text-xs text-electric-blue font-metadata flex items-center gap-1 mt-1">
              <Shield className="w-3.5 h-3.5" />
              Administrator
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Email Address</span>
            <span className="text-sm font-body text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              {email}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Role Hierarchy</span>
            <span className="text-sm font-body text-slate-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-500" />
              Admin Access
            </span>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
