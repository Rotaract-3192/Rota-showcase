"use client";

import React, { useState } from "react";
import GlassPanel from "@/components/GlassPanel";
import { Calendar, Plus, Clock, MapPin, ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DistrictEvent {
  id: string;
  title: string;
  date: string; // Format: "July DD, 2026"
  time: string;
  location: string;
  category: "Assembly" | "Installation" | "Service" | "Meeting";
}

const mockEvents: DistrictEvent[] = [
  { id: "e_1", title: "Rotaract District Assembly 2026", date: "July 12, 2026", time: "09:00 AM", location: "RVCE Auditorium, Bengaluru", category: "Assembly" },
  { id: "e_2", title: "Rotaract Club of Bengaluru South 35th Installation", date: "July 18, 2026", time: "06:00 PM", location: "Grand Palace Hall, Bengaluru", category: "Installation" },
  { id: "e_3", title: "Mega Tree Plantation Drive - Arnava", date: "July 25, 2026", time: "07:30 AM", location: "Turahalli Forest Reserve", category: "Service" },
];

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<DistrictEvent[]>(mockEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("15");
  const [time, setTime] = useState("10:00 AM");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<"Assembly" | "Installation" | "Service" | "Meeting">("Service");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !day) return;

    const newEvent: DistrictEvent = {
      id: `e_${Date.now()}`,
      title,
      date: `July ${day.padStart(2, '0')}, 2026`,
      time,
      location,
      category
    };

    setEvents([...events, newEvent]);
    setTitle("");
    setLocation("");
    setIsModalOpen(false);

    setSuccessMsg("Event scheduled successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // Helper to get category classes for calendar highlights
  const getDayStyles = (dayNum: number) => {
    const matchedEvent = events.find(e => e.date === `July ${dayNum.toString().padStart(2, '0')}, 2026` || e.date === `July ${dayNum}, 2026`);
    if (!matchedEvent) return "text-slate-500 hover:bg-slate-800/40";
    
    switch (matchedEvent.category) {
      case "Assembly":
        return "border border-electric-blue/40 bg-electric-blue/10 text-electric-blue font-bold shadow-[0_0_10px_rgba(0,240,255,0.1)]";
      case "Installation":
        return "border border-pink-500/40 bg-pink-500/10 text-pink-400 font-bold shadow-[0_0_10px_rgba(236,72,153,0.1)]";
      case "Service":
        return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]";
      case "Meeting":
        return "border border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]";
      default:
        return "text-slate-500";
    }
  };

  const renderDays = () => {
    const days = [];
    // July starts on Wednesday in 2026, so 3 empty slots for Sun, Mon, Tue
    for (let i = 0; i < 3; i++) {
      days.push(<div key={`empty-${i}`} className="py-4 text-slate-700 select-none">28</div>);
    }
    
    for (let d = 1; d <= 31; d++) {
      days.push(
        <div 
          key={`day-${d}`} 
          className={cn(
            "py-4 rounded-xl cursor-pointer transition-all duration-200 select-none",
            getDayStyles(d)
          )}
          title={events.find(e => e.date === `July ${d.toString().padStart(2, '0')}, 2026` || e.date === `July ${d}, 2026`)?.title || `July ${d}`}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-12 animate-fade-in relative">
      
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg border border-emerald-500/30 bg-navy-dark/90 text-emerald-400 text-xs font-bold font-metadata shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-2 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-electric-blue" />
            District Calendar
          </h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Schedule assemblies, installations, visits, and large-scale collaborative events.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 flex items-center gap-2 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar View Mockup */}
        <GlassPanel className="lg:col-span-2 p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <h3 className="font-headline text-lg font-bold text-white">July 2026</h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-metadata font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm font-metadata font-medium text-slate-400">
            {renderDays()}
          </div>
        </GlassPanel>

        {/* Upcoming List */}
        <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/40 flex flex-col gap-6">
          <div>
            <h3 className="font-headline text-lg font-bold text-white">Event Telemetry</h3>
            <p className="text-xs text-slate-400 font-metadata mt-1">Details for scheduled district activities</p>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
            {events.map((e) => (
              <div key={e.id} className="p-4 rounded-xl bg-navy-deep/60 border border-slate-800 flex flex-col gap-2 relative group">
                
                <button 
                  onClick={() => handleDelete(e.id)}
                  className="absolute top-3 right-3 p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Delete Event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <span className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded border self-start uppercase tracking-wider",
                  e.category === "Assembly" ? "bg-electric-blue/10 text-electric-blue border-electric-blue/20" :
                  e.category === "Installation" ? "bg-pink-500/10 text-pink-400 border-pink-500/20" :
                  e.category === "Meeting" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}>
                  {e.category}
                </span>
                <h4 className="text-sm font-bold text-white pr-4">{e.title}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-metadata">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  {e.date} at {e.time}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-metadata">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  {e.location}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <GlassPanel className="w-full max-w-lg p-6 bg-navy-dark border-slate-700 relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-electric-blue" />
                Schedule District Event
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Event Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Pravaha Officers Training Seminar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">July Day (1-31)</label>
                  <input 
                    type="number" 
                    min={1}
                    max={31}
                    required
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Time</label>
                  <input 
                    type="text" 
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Location</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. RVCE Auditorium"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-white focus:outline-none placeholder-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-metadata font-bold uppercase tracking-wider text-slate-500">Event Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Assembly">Assembly</option>
                    <option value="Installation">Installation</option>
                    <option value="Service">Service</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-2.5 rounded-lg bg-electric-blue hover:bg-ocean-glow text-navy-deep text-xs font-bold font-metadata transition-colors shadow-lg"
              >
                Schedule Event
              </button>
            </form>
          </GlassPanel>
        </div>
      )}

    </div>
  );
}
