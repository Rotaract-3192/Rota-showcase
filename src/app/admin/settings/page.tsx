"use client";

import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/GlassPanel";
import { Save, Globe, Lock, Bell, Palette, Loader2, CheckCircle2 } from "lucide-react";
import { getDistrictSettings, updateDistrictSettings } from "@/actions/settings.actions";

type Tab = "general" | "branding" | "security" | "notifications";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings State
  const [general, setGeneral] = useState({
    districtName: "",
    riYear: "",
    districtDrr: "",
    contactEmail: "",
    publicLeaderboard: true,
    maintenanceMode: false,
  });

  const [branding, setBranding] = useState({
    primaryColor: "#00F0FF",
    darkModeDefault: true,
  });

  const [security, setSecurity] = useState({
    enforce2fa: false,
    publicRegistrations: true,
    sessionTimeout: 60,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dailyDigest: true,
  });

  useEffect(() => {
    async function loadSettings() {
      const data = await getDistrictSettings();
      if (data) {
        setGeneral(data.general || general);
        setBranding(data.branding || branding);
        setSecurity(data.security || security);
        setNotifications(data.notifications || notifications);
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    let payload;
    if (activeTab === "general") payload = general;
    else if (activeTab === "branding") payload = branding;
    else if (activeTab === "security") payload = security;
    else if (activeTab === "notifications") payload = notifications;

    const success = await updateDistrictSettings(activeTab, payload);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const tabs = [
    { id: "general", label: "General Details", icon: Globe },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "security", label: "Security & Access", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Global configuration and preferences for District 3192 ecosystem.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 flex items-center gap-2 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Settings Navigation */}
        <div className="flex flex-col gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-left transition-colors ${
                  isActive 
                  ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/20" 
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 font-medium border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Settings Form */}
        <GlassPanel className="md:col-span-3 p-6 md:p-8 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-8 min-h-[400px]">
          
          {activeTab === "general" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="flex flex-col gap-2">
                <h3 className="font-headline text-lg font-bold text-white">District Information</h3>
                <p className="text-xs text-slate-400 font-metadata">Update your global district identity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">District Name</label>
                  <input 
                    type="text" 
                    value={general.districtName}
                    onChange={(e) => setGeneral({ ...general, districtName: e.target.value })}
                    className="px-4 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-sm text-white focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all font-body"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Rotary International Year</label>
                  <input 
                    type="text" 
                    value={general.riYear}
                    onChange={(e) => setGeneral({ ...general, riYear: e.target.value })}
                    className="px-4 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-sm text-white focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all font-body"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">DRR</label>
                  <input 
                    type="text" 
                    value={general.districtDrr}
                    onChange={(e) => setGeneral({ ...general, districtDrr: e.target.value })}
                    className="px-4 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-sm text-white focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all font-body"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Contact Email</label>
                  <input 
                    type="email" 
                    value={general.contactEmail}
                    onChange={(e) => setGeneral({ ...general, contactEmail: e.target.value })}
                    className="px-4 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-sm text-white focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all font-body"
                  />
                </div>
              </div>

              <div className="w-full h-px bg-slate-800/60 my-2" />

              <div className="flex flex-col gap-4">
                <h3 className="font-headline text-lg font-bold text-white">Feature Flags</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-navy-deep/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">Public Leaderboard</span>
                    <span className="text-xs text-slate-400 font-metadata">Show the live district rankings on the public showcase.</span>
                  </div>
                  <div 
                    onClick={() => setGeneral({ ...general, publicLeaderboard: !general.publicLeaderboard })}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${general.publicLeaderboard ? 'bg-electric-blue' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-sm transition-transform ${general.publicLeaderboard ? 'bg-navy-deep translate-x-6' : 'bg-slate-400 translate-x-0'}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-navy-deep/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">Maintenance Mode</span>
                    <span className="text-xs text-slate-400 font-metadata">Lock out club reporting portals for scheduled upgrades.</span>
                  </div>
                  <div 
                    onClick={() => setGeneral({ ...general, maintenanceMode: !general.maintenanceMode })}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${general.maintenanceMode ? 'bg-electric-blue' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-sm transition-transform ${general.maintenanceMode ? 'bg-navy-deep translate-x-6' : 'bg-slate-400 translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="flex flex-col gap-2">
                <h3 className="font-headline text-lg font-bold text-white">Branding Settings</h3>
                <p className="text-xs text-slate-400 font-metadata">Configure the visual appearance of the district portal.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Primary Brand Color</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input 
                      type="text" 
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="px-4 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-sm text-white focus:outline-none uppercase font-jetbrains"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-navy-deep/40 mt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">Enforce Dark Mode</span>
                    <span className="text-xs text-slate-400 font-metadata">Set the default appearance of the command center to dark mode.</span>
                  </div>
                  <div 
                    onClick={() => setBranding({ ...branding, darkModeDefault: !branding.darkModeDefault })}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${branding.darkModeDefault ? 'bg-electric-blue' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-sm transition-transform ${branding.darkModeDefault ? 'bg-navy-deep translate-x-6' : 'bg-slate-400 translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="flex flex-col gap-2">
                <h3 className="font-headline text-lg font-bold text-white">Security & Access</h3>
                <p className="text-xs text-slate-400 font-metadata">Manage user access policies and platform security.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-navy-deep/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">Enforce Two-Factor Authentication (2FA)</span>
                    <span className="text-xs text-slate-400 font-metadata">Require all district officers to use 2FA for logins.</span>
                  </div>
                  <div 
                    onClick={() => setSecurity({ ...security, enforce2fa: !security.enforce2fa })}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${security.enforce2fa ? 'bg-electric-blue' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-sm transition-transform ${security.enforce2fa ? 'bg-navy-deep translate-x-6' : 'bg-slate-400 translate-x-0'}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-navy-deep/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">Allow Public Club Registrations</span>
                    <span className="text-xs text-slate-400 font-metadata">Let new clubs register themselves on the portal.</span>
                  </div>
                  <div 
                    onClick={() => setSecurity({ ...security, publicRegistrations: !security.publicRegistrations })}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${security.publicRegistrations ? 'bg-electric-blue' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-sm transition-transform ${security.publicRegistrations ? 'bg-navy-deep translate-x-6' : 'bg-slate-400 translate-x-0'}`} />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Session Timeout (Minutes)</label>
                  <input 
                    type="number" 
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) || 60 })}
                    className="px-4 py-2.5 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-sm text-white focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all font-body max-w-[200px]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="flex flex-col gap-2">
                <h3 className="font-headline text-lg font-bold text-white">Notification Preferences</h3>
                <p className="text-xs text-slate-400 font-metadata">Manage automated district communications and alerts.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-navy-deep/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">Email Notifications</span>
                    <span className="text-xs text-slate-400 font-metadata">Send critical alerts via email to club presidents.</span>
                  </div>
                  <div 
                    onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notifications.emailNotifications ? 'bg-electric-blue' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-sm transition-transform ${notifications.emailNotifications ? 'bg-navy-deep translate-x-6' : 'bg-slate-400 translate-x-0'}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-navy-deep/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">SMS Notifications</span>
                    <span className="text-xs text-slate-400 font-metadata">Send SMS alerts for high-priority updates.</span>
                  </div>
                  <div 
                    onClick={() => setNotifications({ ...notifications, smsNotifications: !notifications.smsNotifications })}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notifications.smsNotifications ? 'bg-electric-blue' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-sm transition-transform ${notifications.smsNotifications ? 'bg-navy-deep translate-x-6' : 'bg-slate-400 translate-x-0'}`} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-navy-deep/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">Daily Summary Digest</span>
                    <span className="text-xs text-slate-400 font-metadata">Compile district activity reports into a single daily email.</span>
                  </div>
                  <div 
                    onClick={() => setNotifications({ ...notifications, dailyDigest: !notifications.dailyDigest })}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notifications.dailyDigest ? 'bg-electric-blue' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-sm transition-transform ${notifications.dailyDigest ? 'bg-navy-deep translate-x-6' : 'bg-slate-400 translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

        </GlassPanel>
      </div>
    </div>
  );
}
