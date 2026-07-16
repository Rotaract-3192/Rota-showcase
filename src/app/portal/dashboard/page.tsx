"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Layers,
  Users,
  Clock,
  HeartHandshake,
  CircleDollarSign,
  TrendingUp,
  Activity,
  Sparkles,
  Megaphone,
  ArrowRight,
  Bell,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock Data for Charts
const activityTrendData = [
  { name: "Jan", activities: 12 },
  { name: "Feb", activities: 19 },
  { name: "Mar", activities: 25 },
  { name: "Apr", activities: 32 },
  { name: "May", activities: 28 },
  { name: "Jun", activities: 45 },
];

const avenueData = [
  { name: "Community Service", value: 45 },
  { name: "Professional Dev", value: 22 },
  { name: "Club Service", value: 18 },
  { name: "Public Relations", value: 15 },
  { name: "International Service", value: 12 },
];
const COLORS = ["#00f0ff", "#0088fe", "#00c49f", "#ffbb28", "#ff8042"];

const KpiCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
  <div className="bg-navy-dark/40 border border-slate-800/60 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-electric-blue/5 rounded-full blur-2xl group-hover:bg-electric-blue/10 transition-all" />
    <div className="flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-navy-deep border border-slate-700/60 text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-metadata text-slate-400 uppercase font-bold tracking-wider">
          {title}
        </span>
      </div>
    </div>
    <div className="z-10 flex items-end justify-between">
      <h3 className="font-headline text-3xl font-bold text-white">{value}</h3>
      <div className={`flex items-center gap-1 text-[10px] font-metadata font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
        <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
        {trendValue}
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const stats = useStore((state) => state.stats);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAnnouncements(data.announcements?.slice(0, 3) || []);
      } catch (err) {
        console.error("Error loading dashboard announcements:", err);
      } finally {
        setLoadingAnnouncements(false);
      }
    }
    loadAnnouncements();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Mission Control</h1>
        <p className="text-slate-400 text-sm font-body mt-1">
          Welcome to the district operations overview. Here's what's happening across the current.
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Projects" value={stats.totalProjects} icon={Layers} trend="up" trendValue="+12%" />
        <KpiCard title="Volunteers" value={stats.totalVolunteers} icon={Users} trend="up" trendValue="+5%" />
        <KpiCard title="Vol. Hours" value={`${(stats.volunteerHours / 1000).toFixed(1)}k`} icon={Clock} trend="up" trendValue="+18%" />
        <KpiCard title="Beneficiaries" value={`${(stats.totalBeneficiaries / 1000).toFixed(1)}k`} icon={HeartHandshake} trend="up" trendValue="+24%" />
        <KpiCard title="Contributions" value={`₹${(stats.contributions / 1000000).toFixed(1)}M`} icon={CircleDollarSign} trend="up" trendValue="+8%" />
        <KpiCard title="Active Clubs" value={stats.activeClubs} icon={Activity} trend="up" trendValue="+2%" />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Trend (Line/Area) */}
        <div className="lg:col-span-2 bg-navy-dark/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white">Club Activity Trend</h3>
            <p className="text-xs text-slate-400 font-metadata">Monthly project submissions across all zones</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f0ff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="activities" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorActivities)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avenues Breakdown (Pie/Donut) */}
        <div className="bg-navy-dark/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white">Activities by Avenue</h3>
          </div>
          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={avenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {avenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {avenueData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-[10px] text-slate-400 font-metadata truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Announcements and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Announcements Panel */}
        <div className="bg-navy-dark/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-electric-blue" />
                </div>
                <h3 className="text-sm font-bold text-white">Recent Announcements</h3>
              </div>
              <Link 
                href="/portal/announcements" 
                className="text-xs text-electric-blue hover:text-ocean-glow flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {loadingAnnouncements ? (
                <p className="text-xs text-slate-500 font-metadata">Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-500">No active announcements</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-3.5 rounded-xl bg-navy-deep/40 border border-slate-800/60 flex items-start gap-3 hover:border-slate-800 transition-colors">
                    <div className="p-1.5 rounded bg-slate-800 shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5 text-electric-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{ann.title}</h4>
                      <p className="text-[11px] text-slate-400 font-body line-clamp-2 mt-1 leading-relaxed">
                        {ann.content}
                      </p>
                      <span className="text-[9px] text-slate-500 font-metadata block mt-2 uppercase tracking-wider">
                        {ann.sender} • {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-r from-navy-dark/80 to-navy-dark/40 border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-electric-blue/5 to-transparent pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-electric-blue animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Operations Insights</h3>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-metadata text-slate-500 uppercase font-bold">Most Active Avenue</span>
                <span className="text-sm font-body text-slate-200">Community Service (45 Projects)</span>
                <span className="text-xs text-slate-400 mt-1">Driving 65% of total volunteer hours this quarter.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-metadata text-slate-500 uppercase font-bold">Highest Impact</span>
                <span className="text-sm font-body text-ocean-glow">Project Jal Dhara</span>
                <span className="text-xs text-slate-400 mt-1">Achieved a peak score of 98/100 across 12k beneficiaries.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-metadata text-slate-500 uppercase font-bold">Growth Alert</span>
                <span className="text-sm font-body text-emerald-400">+24% Beneficiary Reach</span>
                <span className="text-xs text-slate-400 mt-1">Significant spike detected due to Zone 2 health camps.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
