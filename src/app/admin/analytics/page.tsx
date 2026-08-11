"use client";

import React, { useMemo } from "react";
import GlassPanel from "@/components/GlassPanel";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, Users, Building } from "lucide-react";
import { useStore } from "@/store/useStore";

const COLORS = ["#00f0ff", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#14b8a6"];

export default function AdminAnalyticsPage() {
  const clubs = useStore(state => state.clubs);
  const projects = useStore(state => state.projects);

  // Compute live zone data
  const { zoneData, topZone, avgProjects, avgActive } = useMemo(() => {
    const zoneMap = new Map();
    let totalMembers = 0;
    
    clubs.forEach(club => {
      const z = club.zone || "Unknown";
      if (!zoneMap.has(z)) {
        zoneMap.set(z, { name: z, clubs: 0, projects: 0, members: 0 });
      }
      const zd = zoneMap.get(z);
      zd.clubs += 1;
      zd.projects += club.totalProjects || 0;
      zd.members += club.memberCount || 0;
      
      totalMembers += club.memberCount || 0;
    });

    const computedZoneData = Array.from(zoneMap.values()).map(zData => {
      const actualProjects = projects.filter(p => p.zone === zData.name).length;
      return {
        ...zData,
        projects: Math.max(zData.projects, actualProjects)
      };
    }).sort((a, b) => b.projects - a.projects);

    const top = computedZoneData.length > 0 ? computedZoneData[0] : { name: "N/A", projects: 0 };
    
    const totalProj = computedZoneData.reduce((acc, curr) => acc + curr.projects, 0);
    const avgProj = clubs.length > 0 ? (totalProj / clubs.length).toFixed(1) : "0";
    
    // Mocking avg active members since we don't have historical active data
    const activeMembers = totalMembers > 0 ? "82% Active" : "N/A";

    return {
      zoneData: computedZoneData,
      topZone: top,
      avgProjects: avgProj,
      avgActive: activeMembers
    };
  }, [clubs, projects]);

  // Compute live avenue data
  const avenueData = useMemo(() => {
    const avenueMap = new Map();
    projects.forEach(p => {
      const av = p.avenueOfService || "Other";
      avenueMap.set(av, (avenueMap.get(av) || 0) + 1);
    });
    return Array.from(avenueMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [projects]);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">District Analytics</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Deep-dive visual telemetry for District 3192.
          </p>
        </div>
      </div>

      {/* Analytics Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Top Performing Zone</span>
            <span className="text-xl font-headline font-bold text-white">{topZone.name} ({topZone.projects} Projects)</span>
          </div>
          <TrendingUp className="w-8 h-8 text-electric-blue opacity-30" />
        </GlassPanel>
        <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Avg. Projects per Club</span>
            <span className="text-xl font-headline font-bold text-white">{avgProjects} Projects</span>
          </div>
          <Building className="w-8 h-8 text-emerald-400 opacity-30" />
        </GlassPanel>
        <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Avg. Member Engagement</span>
            <span className="text-xl font-headline font-bold text-white">{avgActive}</span>
          </div>
          <Users className="w-8 h-8 text-amber-400 opacity-30" />
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Performance Chart */}
        <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
          <div>
            <h3 className="font-headline text-lg font-bold text-white">Zone-wise Metrics</h3>
            <p className="text-xs text-slate-400 font-metadata mt-1">Clubs, Projects, and Members across zones</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ fontSize: '10px', color: '#64748b' }}
                />
                <Bar dataKey="projects" fill="#00f0ff" radius={[4, 4, 0, 0]} name="Projects" />
                <Bar dataKey="members" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Members" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Avenue of Service Share */}
        <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
          <div>
            <h3 className="font-headline text-lg font-bold text-white">Avenues of Service</h3>
            <p className="text-xs text-slate-400 font-metadata mt-1">Distribution of district projects</p>
          </div>
          <div className="h-80 w-full flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={avenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {avenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-2">
              {avenueData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-slate-300 font-body">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
