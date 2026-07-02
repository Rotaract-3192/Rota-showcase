"use client";

import React, { useState, useEffect } from "react";
import { Bell, Lock, PaintBucket, X, Check, Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GlassPanel from "@/components/GlassPanel";

export default function SettingsPage() {
  // Password Reset State
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPassSaving, setIsPassSaving] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // 2FA Setup State
  const [isConfiguring2FA, setIsConfiguring2FA] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [is2FASaving, setIs2FASaving] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");

  // Load persistent 2FA state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("d3192_2fa_enabled");
    if (saved === "true") {
      setIs2FAEnabled(true);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPassError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsPassSaving(true);
      setPassError("");
      setPassSuccess("");

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPassSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsChangingPass(false);
        setPassSuccess("");
      }, 1500);
    } catch (err: any) {
      setPassError(err.message || "Failed to update password.");
    } finally {
      setIsPassSaving(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setTwoFactorError("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setIs2FASaving(true);
      setTwoFactorError("");

      // Simulate network latency for confirmation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nextState = !is2FAEnabled;
      setIs2FAEnabled(nextState);
      localStorage.setItem("d3192_2fa_enabled", String(nextState));
      
      setVerificationCode("");
      setIsConfiguring2FA(false);
    } catch (err: any) {
      setTwoFactorError("Verification code incorrect. Please try again.");
    } finally {
      setIs2FASaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12 relative">
      <div>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm font-body mt-1">
          Manage your account preferences and notification settings.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Account Settings */}
        <section className="bg-navy-dark/40 border border-slate-800/60 p-6 md:p-8 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
            <div className="p-2 rounded-lg bg-navy-deep border border-slate-700/60">
              <Lock className="w-4 h-4 text-electric-blue" />
            </div>
            <h2 className="font-headline text-xl font-bold text-white">Account & Security</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Change Password</p>
                <p className="text-xs text-slate-400 mt-1">Update your account password securely.</p>
              </div>
              <button 
                onClick={() => setIsChangingPass(true)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Update
              </button>
            </div>
            <div className="h-px w-full bg-slate-800/60" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400 mt-1">Add an extra layer of security.</p>
              </div>
              <button 
                onClick={() => setIsConfiguring2FA(true)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  is2FAEnabled 
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                    : "border border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {is2FAEnabled ? "Enabled (Disable)" : "Enable 2FA"}
              </button>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="bg-navy-dark/40 border border-slate-800/60 p-6 md:p-8 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
            <div className="p-2 rounded-lg bg-navy-deep border border-slate-700/60">
              <Bell className="w-4 h-4 text-ocean-glow" />
            </div>
            <h2 className="font-headline text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-bold text-white">Email Digests</p>
                <p className="text-xs text-slate-400 mt-1">Receive weekly summaries of district activities.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-navy-deep/60 accent-electric-blue" defaultChecked />
            </label>
            <div className="h-px w-full bg-slate-800/60" />
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-bold text-white">Approval Alerts</p>
                <p className="text-xs text-slate-400 mt-1">Get notified when your reports are approved or featured.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-navy-deep/60 accent-electric-blue" defaultChecked />
            </label>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="bg-navy-dark/40 border border-slate-800/60 p-6 md:p-8 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
            <div className="p-2 rounded-lg bg-navy-deep border border-slate-700/60">
              <PaintBucket className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="font-headline text-xl font-bold text-white">Appearance</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-bold text-white mb-3">Theme Selection</p>
              <div className="flex gap-4">
                <button className="flex items-center justify-center px-6 py-2.5 rounded-lg border border-electric-blue/50 bg-electric-blue/10 text-electric-blue font-bold text-xs transition-colors">
                  Dark (Ocean)
                </button>
                <button className="flex items-center justify-center px-6 py-2.5 rounded-lg border border-slate-700 bg-navy-deep/50 text-slate-400 font-bold text-xs hover:text-white transition-colors cursor-not-allowed opacity-50" disabled>
                  Light Mode (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Change Password Modal */}
      {isChangingPass && (
        <div className="fixed inset-0 bg-navy-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <GlassPanel glowColor="cyan" className="w-full max-w-md p-6 bg-navy-dark border-slate-800 flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-headline text-lg font-bold text-white">Change Password</h3>
              <button onClick={() => setIsChangingPass(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              {passError && (
                <p className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg uppercase font-metadata tracking-wider">{passError}</p>
              )}
              {passSuccess && (
                <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg uppercase font-metadata tracking-wider flex items-center gap-2">
                  <Check className="w-4 h-4" /> {passSuccess}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-500 font-metadata">New Password</label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-deep border border-slate-800 text-sm text-white focus:outline-none focus:border-electric-blue/40" 
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-500 font-metadata">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-deep border border-slate-800 text-sm text-white focus:outline-none focus:border-electric-blue/40" 
                />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsChangingPass(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPassSaving}
                  className="px-6 py-2 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPassSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </GlassPanel>
        </div>
      )}

      {/* Two-Factor Authentication Modal */}
      {isConfiguring2FA && (
        <div className="fixed inset-0 bg-navy-deep/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <GlassPanel glowColor="cyan" className="w-full max-w-md p-6 bg-navy-dark border-slate-800 flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-headline text-lg font-bold text-white">
                {is2FAEnabled ? "Disable Two-Factor Auth" : "Setup Two-Factor Auth"}
              </h3>
              <button onClick={() => setIsConfiguring2FA(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerify2FA} className="flex flex-col gap-5">
              {twoFactorError && (
                <p className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg uppercase font-metadata tracking-wider">{twoFactorError}</p>
              )}

              {!is2FAEnabled ? (
                <div className="flex flex-col gap-4 items-center text-center">
                  <p className="text-xs text-slate-400 font-body leading-relaxed">
                    Scan this QR code with Google Authenticator or Microsoft Authenticator, then enter the 6-digit code below.
                  </p>
                  
                  {/* Mock QR Code Container */}
                  <div className="w-36 h-36 bg-white border border-slate-700/60 p-2.5 rounded-xl flex items-center justify-center relative overflow-hidden group">
                    <div className="w-full h-full bg-[radial-gradient(#111_20%,transparent_20%)] [background-size:8px_8px] opacity-90" />
                    <KeyRound className="w-8 h-8 text-navy-deep absolute" />
                  </div>

                  <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Secret Key: D3192ROTARACTKEY</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-body leading-relaxed text-center">
                  Please verify your identity by entering the current 6-digit verification code from your authenticator app to disable 2FA.
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-slate-500 font-metadata">6-Digit Verification Code</label>
                <input 
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-deep border border-slate-800 text-center tracking-widest text-lg font-bold text-white focus:outline-none focus:border-electric-blue/40" 
                  placeholder="000000"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsConfiguring2FA(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={is2FASaving}
                  className="px-6 py-2 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {is2FASaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    is2FAEnabled ? "Disable 2FA" : "Verify & Enable"
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
