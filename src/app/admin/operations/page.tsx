"use client";

import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/GlassPanel";
import { 
  Briefcase, 
  Users, 
  BookOpen, 
  Tent, 
  Award, 
  Loader2, 
  Calendar, 
  Eye, 
  X,
  FileText,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Meeting {
  id: string;
  date: string;
  minutes_text: string | null;
  attendees_count: number | null;
  audio_url: string | null;
  transcript_text: string | null;
  created_at: string;
  clubs: { name: string } | null;
}

interface Orientation {
  id: string;
  date: string;
  speaker_name: string | null;
  new_members_inducted: number | null;
  remarks: string | null;
  created_at: string;
  clubs: { name: string } | null;
}

interface Installation {
  id: string;
  date: string;
  venue: string | null;
  chief_guest: string | null;
  created_at: string;
  clubs: { name: string } | null;
  incoming_president: { first_name: string; last_name: string } | null;
}

interface DOV {
  id: string;
  date: string;
  evaluation_score: number | null;
  remarks: string | null;
  created_at: string;
  clubs: { name: string } | null;
  visiting_official: { first_name: string; last_name: string } | null;
}

type TabType = "meetings" | "orientations" | "installations" | "dovs";

export default function AdminOperationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("meetings");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [orientations, setOrientations] = useState<Orientation[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [dovs, setDovs] = useState<DOV[]>([]);

  // Detailed Modal state
  const [selectedItem, setSelectedItem] = useState<{
    type: TabType;
    data: any;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await fetch("/api/admin/operations");
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load operations reports");
        }
        const data = await res.json();
        setMeetings(data.meetings || []);
        setOrientations(data.orientations || []);
        setInstallations(data.installations || []);
        setDovs(data.dovs || []);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Failed to fetch operational data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case "meetings":
        return meetings.filter(m => m.clubs?.name.toLowerCase().includes(query) || m.minutes_text?.toLowerCase().includes(query));
      case "orientations":
        return orientations.filter(o => o.clubs?.name.toLowerCase().includes(query) || o.speaker_name?.toLowerCase().includes(query) || o.remarks?.toLowerCase().includes(query));
      case "installations":
        return installations.filter(i => 
          i.clubs?.name.toLowerCase().includes(query) || 
          i.venue?.toLowerCase().includes(query) || 
          i.chief_guest?.toLowerCase().includes(query) ||
          `${i.incoming_president?.first_name} ${i.incoming_president?.last_name}`.toLowerCase().includes(query)
        );
      case "dovs":
        return dovs.filter(d => 
          d.clubs?.name.toLowerCase().includes(query) || 
          d.remarks?.toLowerCase().includes(query) ||
          `${d.visiting_official?.first_name} ${d.visiting_official?.last_name}`.toLowerCase().includes(query)
        );
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-12 animate-fade-in relative">
      {errorMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg border border-rose-500/30 bg-navy-dark/90 text-rose-400 text-xs font-bold font-metadata shadow-[0_0_15px_rgba(244,63,94,0.25)] flex items-center gap-2 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-electric-blue" />
            District Operations Review
          </h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Review submitted logs for club meetings, orientations, officer installations, and official visits (DOVs).
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800/60 gap-2 overflow-x-auto pb-1">
        {[
          { id: "meetings", label: "Meetings", icon: Users },
          { id: "orientations", label: "Orientations", icon: BookOpen },
          { id: "installations", label: "Installations", icon: Tent },
          { id: "dovs", label: "DOV Reports", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setSearchQuery("");
              }}
              className={cn(
                "px-4 py-2.5 rounded-t-lg font-metadata text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 border-b-2 cursor-pointer",
                isActive 
                  ? "border-electric-blue text-electric-blue bg-electric-blue/5"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/10"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/30 border border-slate-700 focus:border-electric-blue/40 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Content Panel */}
        <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
              <p className="text-slate-500 text-xs font-metadata">Retrieving logs...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <p className="text-slate-500 text-sm">No operations logs found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-deep/60 border-b border-slate-800/60">
                    <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Club</th>
                    <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    
                    {activeTab === "meetings" && (
                      <>
                        <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Attendees</th>
                        <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Minutes Summary</th>
                      </>
                    )}

                    {activeTab === "orientations" && (
                      <>
                        <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Speaker</th>
                        <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Inductions</th>
                      </>
                    )}

                    {activeTab === "installations" && (
                      <>
                        <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Incoming President</th>
                        <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Venue / Guest</th>
                      </>
                    )}

                    {activeTab === "dovs" && (
                      <>
                        <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Visiting Official</th>
                        <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider">Score</th>
                      </>
                    )}

                    <th className="px-5 py-3 text-[10px] font-metadata font-bold text-slate-400 uppercase tracking-wider text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredData.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3 font-bold text-slate-200">{item.clubs?.name || "Unknown Club"}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</td>

                      {activeTab === "meetings" && (
                        <>
                          <td className="px-5 py-3 text-xs text-slate-300 font-bold">{item.attendees_count || 0}</td>
                          <td className="px-5 py-3 text-xs text-slate-400 truncate max-w-[200px]">
                            {item.minutes_text || "No summary provided"}
                          </td>
                        </>
                      )}

                      {activeTab === "orientations" && (
                        <>
                          <td className="px-5 py-3 text-xs text-slate-300">{item.speaker_name || "N/A"}</td>
                          <td className="px-5 py-3 text-xs text-slate-300 font-bold">{item.new_members_inducted || 0}</td>
                        </>
                      )}

                      {activeTab === "installations" && (
                        <>
                          <td className="px-5 py-3 text-xs text-slate-300">
                            {item.incoming_president 
                              ? `${item.incoming_president.first_name} ${item.incoming_president.last_name}`
                              : "N/A"
                            }
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-400">
                            <div>{item.venue || "N/A"}</div>
                            <div className="text-[10px] text-slate-500">Guest: {item.chief_guest || "N/A"}</div>
                          </td>
                        </>
                      )}

                      {activeTab === "dovs" && (
                        <>
                          <td className="px-5 py-3 text-xs text-slate-300">
                            {item.visiting_official
                              ? `${item.visiting_official.first_name} ${item.visiting_official.last_name}`
                              : "N/A"
                            }
                          </td>
                          <td className="px-5 py-3">
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded",
                              (item.evaluation_score || 0) >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                              (item.evaluation_score || 0) >= 50 ? "bg-amber-500/10 text-amber-400" :
                              "bg-rose-500/10 text-rose-400"
                            )}>
                              {item.evaluation_score || "N/A"}
                            </span>
                          </td>
                        </>
                      )}

                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setSelectedItem({ type: activeTab, data: item })}
                          className="p-1.5 rounded bg-slate-800 hover:bg-electric-blue/15 text-slate-400 hover:text-electric-blue border border-slate-700 transition-colors inline-flex cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>
      </div>

      {/* Details View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          
          <GlassPanel className="w-full max-w-2xl p-6 bg-navy-dark border-slate-700 relative z-10 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-electric-blue" />
                  Operations Report Details
                </h3>
                <p className="text-[10px] text-slate-500 font-metadata uppercase tracking-wider mt-0.5">
                  Submitted by {selectedItem.data.clubs?.name}
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 font-body text-slate-300">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-800/40 pb-4">
                <div>
                  <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase tracking-widest block">Report Type</span>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">{selectedItem.type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase tracking-widest block">Event Date</span>
                  <span className="text-sm text-slate-300">{new Date(selectedItem.data.date).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedItem.type === "meetings" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">Attendees Count</span>
                      <span className="text-xs text-white">{selectedItem.data.attendees_count || 0} Members</span>
                    </div>
                    {selectedItem.data.audio_url && (
                      <div>
                        <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">Minutes Audio Link</span>
                        <a href={selectedItem.data.audio_url} target="_blank" rel="noreferrer" className="text-xs text-electric-blue hover:underline">
                          Listen to recording
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block mb-1">Minutes Summary</span>
                    <div className="p-3 bg-navy-deep rounded border border-slate-800/80 text-xs leading-relaxed whitespace-pre-wrap">
                      {selectedItem.data.minutes_text || "No summary text submitted"}
                    </div>
                  </div>
                  {selectedItem.data.transcript_text && (
                    <div>
                      <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block mb-1">Meeting Transcript</span>
                      <div className="p-3 bg-navy-deep rounded border border-slate-800/80 text-xs leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
                        {selectedItem.data.transcript_text}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedItem.type === "orientations" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">Speaker Name</span>
                      <span className="text-xs text-white">{selectedItem.data.speaker_name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">New Members Inducted</span>
                      <span className="text-xs text-white font-bold">{selectedItem.data.new_members_inducted || 0}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block mb-1">Remarks & Details</span>
                    <div className="p-3 bg-navy-deep rounded border border-slate-800/80 text-xs leading-relaxed whitespace-pre-wrap">
                      {selectedItem.data.remarks || "No remarks provided"}
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.type === "installations" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">Incoming President</span>
                      <span className="text-xs text-white">
                        {selectedItem.data.incoming_president 
                          ? `${selectedItem.data.incoming_president.first_name} ${selectedItem.data.incoming_president.last_name}`
                          : "N/A"
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">Chief Guest</span>
                      <span className="text-xs text-white">{selectedItem.data.chief_guest || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">Venue</span>
                    <span className="text-xs text-white">{selectedItem.data.venue || "N/A"}</span>
                  </div>
                </div>
              )}

              {selectedItem.type === "dovs" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">Visiting Official</span>
                      <span className="text-xs text-white">
                        {selectedItem.data.visiting_official
                          ? `${selectedItem.data.visiting_official.first_name} ${selectedItem.data.visiting_official.last_name}`
                          : "N/A"
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block">Evaluation Score</span>
                      <span className="text-xs text-white font-bold">{selectedItem.data.evaluation_score || "N/A"} / 100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-metadata font-bold text-slate-500 uppercase block mb-1">Official Remarks</span>
                    <div className="p-3 bg-navy-deep rounded border border-slate-800/80 text-xs leading-relaxed whitespace-pre-wrap">
                      {selectedItem.data.remarks || "No remarks provided"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
