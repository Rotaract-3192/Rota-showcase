"use client";

import React, { useEffect, useState } from "react";
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
  Cell,
} from "recharts";
import { TrendingUp, Building, Loader2, Users, HeartHandshake, CircleDollarSign, ClipboardCheck } from "lucide-react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { canonicalizeZone, DISTRICT_ZONES, isDistrictWideAdminRole } from "@/lib/zones";
import { AVENUES_OF_SERVICE } from "@/lib/avenues";
import { apiUrl } from "@/lib/api";
import ReportingPeriodSelect from "@/components/admin/ReportingPeriodSelect";

const COLORS = ["#00f0ff", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#14b8a6"];

export default function AdminAnalyticsPage() {
  const { profileData } = useAuthContext();
  const zrrRole = profileData?.roles.find((r) => r.role === "ZRR");
  const isSuperAdmin = profileData?.roles.some((r) => isDistrictWideAdminRole(r.role)) ?? false;
  const userZone = canonicalizeZone(zrrRole?.zone);
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState("ry");
  const [selectedAvenue, setSelectedAvenue] = useState("All");
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    reported: 0,
    published: 0,
    pending: 0,
    unspecifiedAvenue: 0,
    volunteers: 0,
    beneficiaries: 0,
    fundsRaised: 0,
    clubsReported: 0,
    clubsTotal: 0,
  });
  const [avenueData, setAvenueData] = useState<{ name: string; value: number }[]>([]);
  const [zoneData, setZoneData] = useState<{ name: string; clubs: number; members: number; projects: number }[]>([]);

  useEffect(() => {
    if (!isSuperAdmin && userZone) setSelectedZone(userZone);
  }, [userZone, isSuperAdmin]);

  useEffect(() => {
    const filter = !isSuperAdmin && userZone ? userZone : selectedZone;
    setLoading(true);
    fetch(
      apiUrl(
        `/api/admin/analytics?zone=${encodeURIComponent(filter)}&period=${encodeURIComponent(selectedPeriod)}&avenue=${encodeURIComponent(selectedAvenue)}`
      )
    )
      .then((res) => res.json())
      .then((data) => {
        setTotals(data.totals || {
          reported: 0, published: 0, pending: 0, unspecifiedAvenue: 0,
          volunteers: 0, beneficiaries: 0, fundsRaised: 0, clubsReported: 0, clubsTotal: 0,
        });
        setAvenueData(data.avenueData || []);
        setZoneData(data.zoneData || []);
      })
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, [selectedZone, selectedPeriod, selectedAvenue, userZone, isSuperAdmin]);

  const topZone = zoneData[0] || { name: "N/A", projects: 0 };
  const avgProjects = zoneData.reduce((sum, row) => sum + row.clubs, 0)
    ? (totals.published / zoneData.reduce((sum, row) => sum + row.clubs, 0)).toFixed(1)
    : "0";
  const avenueSum = avenueData.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">District Analytics</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Live counts from every reported activity, not a 100-project sample.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-end">
          <ReportingPeriodSelect value={selectedPeriod} onChange={setSelectedPeriod} />
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Filter by Zone</label>
            <select
              value={!isSuperAdmin && userZone ? userZone : selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              disabled={!isSuperAdmin && !!userZone}
              className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 text-xs text-slate-300 focus:outline-none disabled:opacity-60"
            >
              {isSuperAdmin && <option value="All">All Zones</option>}
              {DISTRICT_ZONES.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Filter by Avenue</label>
            <select
              value={selectedAvenue}
              onChange={(e) => setSelectedAvenue(e.target.value)}
              className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="All">All Avenues</option>
              {AVENUES_OF_SERVICE.map((avenue) => (
                <option key={avenue} value={avenue}>{avenue}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-electric-blue font-metadata text-xs uppercase tracking-widest">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40">
              <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Projects executed</span>
              <p className="text-xl font-headline font-bold text-white mt-1">{totals.reported}</p>
              <p className="text-[10px] text-slate-500 mt-1">{totals.published} published · {totals.pending} drafts</p>
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40">
              <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold flex items-center gap-1"><Users className="w-3 h-3" /> Volunteers engaged</span>
              <p className="text-xl font-headline font-bold text-white mt-1">{totals.volunteers.toLocaleString("en-IN")}</p>
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40">
              <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold flex items-center gap-1"><HeartHandshake className="w-3 h-3" /> Beneficiaries impacted</span>
              <p className="text-xl font-headline font-bold text-white mt-1">{totals.beneficiaries.toLocaleString("en-IN")}</p>
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40">
              <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> Funds raised</span>
              <p className="text-xl font-headline font-bold text-white mt-1">₹{totals.fundsRaised.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-slate-500 mt-1">Cash + in-kind, else project cost</p>
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40">
              <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold flex items-center gap-1"><ClipboardCheck className="w-3 h-3" /> Clubs completed reporting</span>
              <p className="text-xl font-headline font-bold text-white mt-1">{totals.clubsReported} / {totals.clubsTotal}</p>
              <p className="text-[10px] text-slate-500 mt-1">Clubs with at least one submission in this period</p>
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Top zone</span>
                <p className="text-xl font-headline font-bold text-white mt-1">{topZone.name} ({topZone.projects})</p>
              </div>
              <TrendingUp className="w-8 h-8 text-electric-blue opacity-30" />
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Avg. published / club</span>
                <p className="text-xl font-headline font-bold text-white mt-1">{avgProjects}</p>
              </div>
              <Building className="w-8 h-8 text-emerald-400 opacity-30" />
            </GlassPanel>
            <GlassPanel className="p-5 border-slate-800/60 bg-navy-dark/40">
              <span className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider font-bold">Published projects</span>
              <p className="text-xl font-headline font-bold text-white mt-1">{totals.published}</p>
              <p className="text-[10px] text-slate-500 mt-1">Used for avenue chart</p>
            </GlassPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">Zone-wise Metrics</h3>
                <p className="text-xs text-slate-400 font-metadata mt-1">Published projects counted from activities, not club.total_projects</p>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0b1120", borderColor: "#1e293b", borderRadius: "8px" }} />
                    <Bar dataKey="projects" fill="#00f0ff" radius={[4, 4, 0, 0]} name="Published projects" />
                    <Bar dataKey="members" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Members" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">Avenues of Service</h3>
                <p className="text-xs text-slate-400 font-metadata mt-1">
                  {avenueSum} published projects by primary avenue
                  {totals.unspecifiedAvenue ? ` · ${totals.unspecifiedAvenue} have no avenue tagged` : ""}
                </p>
              </div>
              <div className="h-80 w-full flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={avenueData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                        {avenueData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0b1120", borderColor: "#1e293b", borderRadius: "8px" }} />
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
                  {avenueData.length === 0 && (
                    <span className="text-xs text-slate-500">No published projects in this filter.</span>
                  )}
                </div>
              </div>
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}
