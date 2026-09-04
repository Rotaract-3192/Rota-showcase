"use client";

import React, { useState, useEffect } from "react";
import AdminKPICard from "@/components/admin/AdminKPICard";
import GlassPanel from "@/components/GlassPanel";
import { 
  Building2, 
  Layers, 
  Users, 
  Clock, 
  Heart, 
  CheckCircle2, 
  Award,
  Activity
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { useAuthContext } from "@/components/providers/auth-provider";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
import { describeAuditAction } from "@/lib/audit-log";

export default function AdminDashboardPage() {
  const { profileData } = useAuthContext();
  const zrrRole = profileData?.roles.find(r => r.role === 'ZRR');
  const isSuperAdmin = profileData?.roles.some(r => 
    ["District Admin", "District Core Team", "Super Admin", "Admin", "Administrator"].includes(r.role)
  );
  const userZone = zrrRole?.zone;

  const { clubs, projects } = useStore(useShallow((state) => ({
    clubs: state.clubs,
    projects: state.projects
  })));

  const [selectedZone, setSelectedZone] = useState<string>("All");

  // Set default zone if user is ZRR
  useEffect(() => {
    if (!isSuperAdmin && userZone) {
      setSelectedZone(userZone);
    }
  }, [userZone, isSuperAdmin]);

  const activeZone = (!isSuperAdmin && userZone) ? userZone : selectedZone;

  // Filter lists based on selected zone
  // We now rely solely on the backend stats API for telemetry instead of mock data from the store
  const filteredClubs = activeZone === "All" ? clubs : clubs.filter(c => c.zone === activeZone);
  const filteredProjects = activeZone === "All" ? projects : projects.filter(p => p.zone === activeZone);

  // Removed static performanceData and scaledPerformanceData since we use the real API data now.

  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);

  // Fetch telemetry (audit logs)
  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await fetch('/api/admin/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setAuditLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Error fetching telemetry:", err);
      } finally {
        setLoadingTelemetry(false);
      }
    }
    
    if (isSuperAdmin) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 30000); // refresh every 30s
      return () => clearInterval(interval);
    } else {
      setLoadingTelemetry(false);
    }
  }, [isSuperAdmin]);

  // Fetch dashboard stats
  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const res = await fetch(`/api/admin/dashboard/stats?zone=${encodeURIComponent(activeZone || 'All')}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    if (activeZone) {
      fetchStats();
    }
  }, [activeZone]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Just Now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getTelemetryIconStyles = (action: string, index: number) => {
    if (index === 0) {
      return {
        border: "border-electric-blue",
        dot: "bg-electric-blue shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-pulse"
      };
    }
    
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return { border: "border-emerald-500/50", dot: "bg-emerald-400" };
      case 'update':
        return { border: "border-amber-500/50", dot: "bg-amber-400" };
      case 'delete':
        return { border: "border-rose-500/50", dot: "bg-rose-400" };
      default:
        return { border: "border-slate-700", dot: "bg-slate-500" };
    }
  };

  // Helper to parse trend values for the AdminKPICard which expects a number
  const parseTrend = (trendStr: string) => {
    if (!trendStr) return 0;
    return parseFloat(trendStr.replace(/[^\d.-]/g, ''));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Mission Control</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            District 3192 operational overview and telemetry{activeZone !== "All" && ` for Zone ${activeZone}`}.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Zone Filter Dropdown */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[9px] uppercase font-bold text-slate-500 font-metadata">Filter by Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              disabled={!isSuperAdmin && !!userZone}
              className="px-3 py-1.5 rounded-lg bg-navy-deep border border-slate-800 text-xs text-slate-300 focus:outline-none disabled:opacity-60"
            >
              {isSuperAdmin && <option value="All">All Zones</option>}
              <option value="Arnava">Arnava</option>
              <option value="Pravaha">Pravaha</option>
              <option value="Taranga">Taranga</option>
              <option value="Varuna">Varuna</option>
              <option value="Sagara">Sagara</option>
              <option value="Samudhra">Samudhra</option>
            </select>
          </div>

          <button className="px-4 py-2 mt-4 rounded-lg bg-navy-deep border border-slate-700 hover:border-slate-500 text-xs font-bold text-white transition-colors shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKPICard 
          title="Total Clubs" 
          value={loadingStats ? "..." : (stats?.metrics?.totalClubs || 0)} 
          icon={<Building2 className="w-5 h-5 text-electric-blue" />}
          trend={stats?.trends ? { value: parseTrend(stats.trends.clubs), label: "from last month" } : undefined}
        />
        <AdminKPICard 
          title="Total Projects" 
          value={loadingStats ? "..." : (stats?.metrics?.totalProjects || 0).toLocaleString()} 
          icon={<Layers className="w-5 h-5 text-ocean-glow" />}
          trend={stats?.trends ? { value: parseTrend(stats.trends.projects), label: "from last month" } : undefined}
          glowColor="blue"
        />
        <AdminKPICard 
          title="Total Volunteers" 
          value={loadingStats ? "..." : (stats?.metrics?.totalVolunteers || 0).toLocaleString()} 
          icon={<Users className="w-5 h-5 text-emerald-400" />}
          trend={stats?.trends ? { value: parseTrend(stats.trends.volunteers), label: "from last month" } : undefined}
          glowColor="white"
        />
        <AdminKPICard 
          title="Volunteer Hours" 
          value={loadingStats ? "..." : (stats?.metrics?.totalVolunteerHours || 0).toLocaleString()} 
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          trend={stats?.trends ? { value: parseTrend(stats.trends.volunteerHours), label: "from last month" } : undefined}
          glowColor="white"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminKPICard 
          title="Beneficiaries" 
          value={loadingStats ? "..." : (stats?.metrics?.totalBeneficiaries || 0).toLocaleString()} 
          icon={<Heart className="w-5 h-5 text-rose-400" />}
        />
        <AdminKPICard 
          title="Funds Raised" 
          value={loadingStats ? "..." : `₹${(stats?.metrics?.totalFundsRaised || 0).toLocaleString()}`} 
          icon={<Award className="w-5 h-5 text-emerald-500" />}
        />
        <AdminKPICard 
          title="Pending Reviews" 
          value={stats?.metrics?.pendingReviews ?? 0} 
          icon={<CheckCircle2 className="w-5 h-5 text-orange-400" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Main Trend Chart */}
        <GlassPanel className="lg:col-span-2 p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
          <div>
            <h3 className="font-headline text-lg font-bold text-white">District Velocity</h3>
            <p className="text-xs text-slate-400 font-metadata mt-1">Project and volunteer trajectory over 6 months</p>
          </div>
          <div className="h-72 w-full">
            {loadingStats ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Loading chart data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.velocityData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  <linearGradient id="colorVolunteers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', color: '#64748b' }}
                />
                <Area type="monotone" dataKey="volunteers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVolunteers)" />
                <Area type="monotone" dataKey="projects" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorProjects)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </GlassPanel>

        {/* Live Feed */}
        <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 flex flex-col overflow-hidden h-96 lg:h-[380px]">
          <div className="p-5 border-b border-slate-800/60 bg-navy-dark/60 sticky top-0 z-10">
            <h3 className="font-headline text-lg font-bold text-white">Live Telemetry Feed</h3>
            <p className="text-[10px] text-slate-400 font-metadata uppercase tracking-wider mt-1">Real-time Activity</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-4">
            
            {loadingTelemetry ? (
              <div className="text-center text-slate-500 text-xs py-10">Loading telemetry feed...</div>
            ) : !isSuperAdmin ? (
              <div className="text-center text-slate-500 text-xs py-10">Telemetry feed restricted to Super Admins.</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-10">No recent activity found.</div>
            ) : (
              auditLogs.slice(0, 15).map((log, i) => {
                const styles = getTelemetryIconStyles(log.action, i);
                const userName = log.member_profiles 
                  ? `${log.member_profiles.first_name} ${log.member_profiles.last_name}`.trim()
                  : 'System';
                  
                return (
                  <div key={log.id} className="relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-slate-800/80 last:before:hidden">
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-navy-deep border-2 ${styles.border} flex items-center justify-center z-10`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-metadata font-bold ${i === 0 ? 'text-electric-blue' : 'text-slate-500'}`}>
                        {formatTimeAgo(log.created_at)}
                      </span>
                      <p className="text-xs text-slate-300 font-body leading-snug">
                        <span className="font-bold text-white">{userName}</span> {log.action.toLowerCase()}d a record in <span className="text-slate-300 italic">{log.table_name}</span>.
                      </p>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </GlassPanel>
      </div>
      
    </div>
  );
}
