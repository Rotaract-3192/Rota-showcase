"use client";

import React, { useState } from "react";
import WaveBackground from "@/components/WaveBackground";
import GlassPanel from "@/components/GlassPanel";
import {
  Users,
  Compass,
  Calendar,
  ChevronDown,
  ChevronUp,
  Mail,
  Award,
  Globe,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Trophy,
} from "lucide-react";

interface Leader {
  name: string;
  role: string;
  club: string;
  email: string;
  image: string;
}

const leadershipList: Leader[] = [
  {
    name: "Rtr. Divyanshu Prasad",
    role: "District Rotaract Representative (DRR)",
    club: "Rotaract Club of Bengaluru South",
    email: "drr@rotaract3192.org",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Rtr. Sanjana Gowda",
    role: "District General Secretary",
    club: "Rotaract Club of RV College of Engineering",
    email: "secretary@rotaract3192.org",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Rtr. Haris Kidwai",
    role: "District Trainer & Adviser",
    club: "Rotaract Club of Bengaluru West",
    email: "trainer@rotaract3192.org",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Rtr. Rohan Hegde",
    role: "District Treasurer",
    club: "Rotaract Club of Indira Nagar",
    email: "treasurer@rotaract3192.org",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Rtr. Nidhi Jain",
    role: "District Public Image Chair",
    club: "Rotaract Club of Jayanagar",
    email: "publicimage@rotaract3192.org",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
  },
];

const zoneDetails = [
  {
    name: "Zone 1 (Bengaluru South & Rural)",
    description: "Covers the southern metropolitan regions and surrounding rural zones like Kanakapura and Channapatna.",
    clubsCount: 14,
    clubs: ["RC Bengaluru South", "RC RV College of Engineering", "RC Jayanagar", "RC Dayananda Sagar"],
  },
  {
    name: "Zone 2 (Bengaluru East & Central)",
    description: "Focuses on the central commercial zones, tech corridors (Whitefield, Outer Ring Road), and Indiranagar.",
    clubsCount: 16,
    clubs: ["RC Indira Nagar", "RC PES University", "RC Bengaluru West", "RC Christ University"],
  },
  {
    name: "Zone 3 (Tumakuru, Kengeri & North)",
    description: "Covers highway belts, Kengeri suburbs, and outstation clubs in Tumakuru and rural Kolar.",
    clubsCount: 12,
    clubs: ["RC Tumakuru Elite", "RC Kengeri Central", "RC Kolar Gold Fields", "RC Tumakuru Town"],
  },
];

const timelineMilestones = [
  {
    month: "July 2025",
    title: "District Assembly & DRR Installation",
    description: "Over 800 Rotaractors assembled in Bengaluru to inaugurate the new Rotary year under the 'Ocean of Impact' theme.",
  },
  {
    month: "October 2025",
    title: "District Mega Blood Donation Day",
    description: "Collaborated across 30 clubs to secure 1,240 units of blood in a single day, setting a district record.",
  },
  {
    month: "January 2026",
    title: "Project Jal Dhara Deployment",
    description: "Successfully set up gravity-fed water purifiers in five remote villages, benefiting 12,000+ residents.",
  },
  {
    month: "March 2026",
    title: "Lake Restoration & Eco Corridor Initiative",
    description: "Coordinated volunteer efforts with local environmentalists to restore the offshoot canal channel in Kengeri.",
  },
  {
    month: "May 2026",
    title: "Vocational Conclave 'Ignite'",
    description: "Mentored 120 college students in project business modeling, funding three early-stage student startups.",
  },
];

const upcomingEvents = [
  {
    date: "June 20, 2026",
    title: "District Conference 'Sagar'",
    location: "Chowdiah Memorial Hall, Bengaluru",
    time: "09:00 AM - 05:00 PM",
  },
  {
    date: "July 15, 2026",
    title: "Leadership Boot Camp: Ripple 2026",
    location: "Rotary House of Friendship, Lavelle Road",
    time: "10:30 AM - 04:00 PM",
  },
  {
    date: "August 10, 2026",
    title: "Environmental Conclave: Wave Summit",
    location: "IISc Seminar Hall, Bengaluru",
    time: "02:00 PM - 06:00 PM",
  },
];

const districtEvents = [
  { id: "e_1", title: "Rotaract District Assembly 2026", date: "July 12, 2026", day: 12, time: "09:00 AM - 05:00 PM", location: "RVCE Auditorium, Bengaluru", category: "Assembly", desc: "The grand annual training conclave for all incoming club officers in District 3192." },
  { id: "e_2", title: "Leadership Boot Camp: Ripple 2026", date: "July 15, 2026", day: 15, time: "10:30 AM - 04:00 PM", location: "Rotary House of Friendship, Lavelle Road", category: "Training", desc: "A rigorous leadership training workshop focusing on project design and volunteer mobilization." },
  { id: "e_3", title: "RC Bengaluru South 35th Installation", date: "July 18, 2026", day: 18, time: "06:00 PM - 09:00 PM", location: "Grand Palace Hall, Bengaluru", category: "Installation", desc: "The formal board induction ceremony for the incoming president Rtr. Ananya Sharma and her board." },
  { id: "e_4", title: "Mega Tree Plantation Drive - Zone 1", date: "July 25, 2026", day: 25, time: "07:30 AM - 12:00 PM", location: "Turahalli Forest Reserve", category: "Service", desc: "District-wide environmental service project focusing on native tree afforestation." }
];

export default function DistrictPage() {
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(12);

  const toggleZone = (index: number) => {
    setActiveZone(activeZone === index ? null : index);
  };

  return (
    <div className="relative min-h-screen pb-24 px-6 md:px-8">
      {/* Animated waves background */}
      <WaveBackground intensity={0.4} particleCount={20} />

      <div className="max-w-7xl mx-auto pt-12">
        {/* Editorial Header */}
        <div className="mb-16">
          <span className="font-metadata text-xs font-bold text-electric-blue uppercase tracking-widest">
            Administration & Governance
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-white mt-2">
            Rotaract District 3192
          </h1>
          <p className="font-body text-slate-400 text-sm mt-3 max-w-2xl leading-relaxed">
            Welcome to District 3192. Serving as the administrative anchor, we direct, support, 
            and synthesize activities across clubs to drive structural social progress.
          </p>
        </div>

        {/* ================= SECTION 1: ABOUT DISTRICT ================= */}
        <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white">
              Who We Are
            </h2>
            <p className="text-slate-300 font-body leading-relaxed text-sm md:text-base">
              Rotaract District 3192 consists of numerous clubs located across academic 
              institutions, urban suburbs, and rural communities. We are part of Rotaract, 
              a global youth-led service organization sponsored by Rotary International.
            </p>
            <p className="text-slate-400 font-body leading-relaxed text-sm">
              We empower university students and young professionals to tackle local 
              and global challenges. Our members coordinate large-scale community service, 
              foster international collaboration, and cultivate professional leadership. 
              By operating under a unified standard, we transform individual drops of action 
              into a powerful wave of progress.
            </p>
          </div>
          
          <div className="lg:col-span-5">
            <GlassPanel className="p-8 border-slate-800/60 bg-navy-dark/30 text-center flex flex-col gap-4">
              <Compass className="w-12 h-12 text-electric-blue mx-auto mb-2" />
              <h3 className="font-headline text-xl font-bold text-white">Geographic Jurisdiction</h3>
              <p className="text-xs text-slate-400 font-body leading-relaxed">
                Our district governs clubs operating in Bengaluru Urban, Bengaluru Rural, Ramanagara, Channapatna, Tumakuru, and Kolar districts.
              </p>
              <div className="flex justify-center gap-6 mt-4 font-metadata text-xs font-bold text-white">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-ocean-glow" />
                  <span>3 Zones</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-ocean-glow" />
                  <span>42+ Active Clubs</span>
                </div>
              </div>
            </GlassPanel>
          </div>
        </section>

        {/* ================= SECTION 2: DISTRICT LEADERSHIP ================= */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-10 pb-3 border-b border-slate-800/40 max-w-sm">
            <Users className="w-6 h-6 text-electric-blue" />
            <h2 className="font-headline text-2xl font-bold text-white">
              District Council 2025-26
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {leadershipList.map((leader, index) => (
              <GlassPanel
                key={index}
                hoverEffect
                glowColor="blue"
                className="flex flex-col items-center text-center p-5 relative overflow-hidden group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-700 bg-navy-medium p-0.5 shadow-md mb-4">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover rounded-full filter grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="font-headline text-sm font-bold text-white line-clamp-1">
                  {leader.name}
                </h3>
                <p className="text-[10px] text-electric-blue font-metadata font-bold mt-1 line-clamp-2 min-h-[30px] leading-tight">
                  {leader.role}
                </p>
                <p className="text-[9px] text-slate-500 font-metadata font-bold mt-2 truncate w-full">
                  {leader.club}
                </p>
                
                <a
                  href={`mailto:${leader.email}`}
                  className="mt-4 p-2 rounded-full bg-navy-dark border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white transition-all focus:outline-none"
                  title={`Email ${leader.name}`}
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </GlassPanel>
            ))}
          </div>
        </section>

        {/* ================= SECTION 3: ZONES ================= */}
        <section className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Zones expanding Accordion */}
          <div>
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-slate-800/40">
              <Compass className="w-6 h-6 text-electric-blue" />
              <h2 className="font-headline text-2xl font-bold text-white">
                Zone Classifications
              </h2>
            </div>
            
            <div className="flex flex-col gap-4">
              {zoneDetails.map((zone, idx) => {
                const isOpen = activeZone === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800/60 overflow-hidden bg-navy-dark/30 transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleZone(idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-slate-800/20"
                    >
                      <div>
                        <h3 className="font-headline text-md font-bold text-white">
                          {zone.name}
                        </h3>
                        <p className="text-[10px] font-metadata text-slate-500 font-bold mt-0.5 uppercase">
                          {zone.clubsCount} Active Clubs
                        </p>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 border-t border-slate-800/40 text-xs leading-relaxed font-body">
                        <p className="text-slate-400 mb-4">{zone.description}</p>
                        <p className="font-metadata font-bold uppercase text-[9px] text-slate-500 mb-2">
                          Key Clubs:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {zone.clubs.map((c, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2.5 py-1 rounded bg-navy-deep/80 border border-slate-800/60 text-slate-300 font-metadata text-[10px]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline milestones */}
          <div>
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-slate-800/40">
              <Award className="w-6 h-6 text-electric-blue" />
              <h2 className="font-headline text-2xl font-bold text-white">
                District Timeline
              </h2>
            </div>

            <div className="relative border-l border-slate-800/80 ml-2 pl-6 flex flex-col gap-8">
              {timelineMilestones.map((m, idx) => (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-electric-blue ring-4 ring-navy-deep" />
                  
                  <span className="font-metadata text-[10px] font-bold text-electric-blue uppercase">
                    {m.month}
                  </span>
                  <h3 className="font-headline text-sm font-bold text-white mt-1">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-body mt-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: INTERACTIVE DISTRICT MAP ================= */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8 pb-3 border-b border-slate-800/40 max-w-sm">
            <Compass className="w-6 h-6 text-electric-blue" />
            <h2 className="font-headline text-2xl font-bold text-white">
              Interactive Club Map
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* SVG Visual Map Container */}
            <div className="lg:col-span-8">
              <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/30 min-h-[450px] flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.02)_0%,transparent_70%)] pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4 z-10">
                  <div>
                    <h3 className="font-headline text-md font-bold text-white">District 3192 Geographic Footprint</h3>
                    <p className="text-slate-500 font-metadata text-[10px] uppercase font-bold mt-0.5">Click pins to drill down club details</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-metadata">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Zone 1
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-metadata">
                      <span className="w-2.5 h-2.5 rounded-full bg-electric-blue" /> Zone 2
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-metadata">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Zone 3
                    </span>
                  </div>
                </div>

                {/* SVG MAP SHAPE REPRESENTING DISTRICT */}
                <div className="relative flex-grow flex items-center justify-center p-4">
                  <svg viewBox="0 0 800 500" className="w-full max-w-[650px] aspect-[800/500] fill-none stroke-slate-800/60 stroke-[1.5]">
                    {/* Zone 3 Outline (North / Tumakuru) */}
                    <path d="M 100 150 L 320 80 L 380 200 L 300 350 L 150 320 Z" fill="rgba(236, 72, 153, 0.02)" stroke="rgba(236, 72, 153, 0.2)" strokeDasharray="4 4" className="transition-all hover:fill-pink-500/[0.04]" />
                    {/* Zone 1 Outline (South / Rural) */}
                    <path d="M 300 350 L 420 220 L 520 300 L 490 450 L 350 420 Z" fill="rgba(16, 185, 129, 0.02)" stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="4 4" className="transition-all hover:fill-emerald-500/[0.04]" />
                    {/* Zone 2 Outline (Central / East / Kolar) */}
                    <path d="M 420 220 L 550 150 L 750 180 L 700 320 L 520 300 Z" fill="rgba(0, 240, 255, 0.02)" stroke="rgba(0, 240, 255, 0.2)" strokeDasharray="4 4" className="transition-all hover:fill-electric-blue/[0.04]" />

                    {/* Regional Labels */}
                    <text x="200" y="240" fill="rgba(236, 72, 153, 0.4)" className="font-metadata font-black text-xs uppercase tracking-widest pointer-events-none">Tumakuru Zone</text>
                    <text x="440" y="390" fill="rgba(16, 185, 129, 0.4)" className="font-metadata font-black text-xs uppercase tracking-widest pointer-events-none">Bengaluru South</text>
                    <text x="590" y="250" fill="rgba(0, 240, 255, 0.4)" className="font-metadata font-black text-xs uppercase tracking-widest pointer-events-none">Kolar / Central</text>
                  </svg>

                  {/* Club Pins Overlay */}
                  {[
                    { id: "p1", name: "RC Bengaluru South", x: 45, y: 55, zone: "Zone 1", color: "bg-emerald-500 shadow-emerald-500/20", president: "Rtr. Ananya Sharma", projects: 32, points: 1250, location: "Kanakapura Rural" },
                    { id: "p2", name: "RC RV College of Engineering", x: 40, y: 52, zone: "Zone 1", color: "bg-emerald-500 shadow-emerald-500/20", president: "Rtr. Rohan Kamath", projects: 45, points: 1580, location: "Mysore Road, RVCE" },
                    { id: "p3", name: "RC Jayanagar", x: 47, y: 50, zone: "Zone 1", color: "bg-emerald-500 shadow-emerald-500/20", president: "Rtr. Kavya Shree", projects: 36, points: 1350, location: "Jayanagar" },
                    { id: "p4", name: "RC Dayananda Sagar", x: 46, y: 58, zone: "Zone 1", color: "bg-emerald-500 shadow-emerald-500/20", president: "Rtr. Kiran Kumar", projects: 25, points: 890, location: "Kanakapura Road" },
                    { id: "p5", name: "RC Indira Nagar", x: 53, y: 44, zone: "Zone 2", color: "bg-electric-blue shadow-electric-blue/20", president: "Rtr. Vikram Aditya", projects: 28, points: 1420, location: "Indiranagar" },
                    { id: "p6", name: "RC PES University", x: 38, y: 46, zone: "Zone 2", color: "bg-electric-blue shadow-electric-blue/20", president: "Rtr. Meghna Iyer", projects: 39, points: 1100, location: "Banashankari" },
                    { id: "p7", name: "RC Bengaluru West", x: 43, y: 42, zone: "Zone 2", color: "bg-electric-blue shadow-electric-blue/20", president: "Rtr. Sneha Patel", projects: 41, points: 1610, location: "Rajajinagar" },
                    { id: "p8", name: "RC Christ University", x: 49, y: 47, zone: "Zone 2", color: "bg-electric-blue shadow-electric-blue/20", president: "Rtr. David Paul", projects: 30, points: 950, location: "Hosur Road" },
                    { id: "p9", name: "RC Tumakuru Elite", x: 25, y: 30, zone: "Zone 3", color: "bg-pink-500 shadow-pink-500/20", president: "Rtr. Siddarth Gowda", projects: 24, points: 980, location: "Tumakuru" },
                    { id: "p10", name: "RC Kengeri Central", x: 32, y: 48, zone: "Zone 3", color: "bg-pink-500 shadow-pink-500/20", president: "Rtr. Harish Kumar", projects: 18, points: 720, location: "Kengeri" },
                    { id: "p11", name: "RC Kolar Gold Fields", x: 78, y: 40, zone: "Zone 3", color: "bg-pink-500 shadow-pink-500/20", president: "Rtr. Divya N", projects: 15, points: 650, location: "Kolar" },
                    { id: "p12", name: "RC Tumakuru Town", x: 23, y: 25, zone: "Zone 3", color: "bg-pink-500 shadow-pink-500/20", president: "Rtr. Manoj S", projects: 20, points: 780, location: "Tumakuru Town" }
                  ].map((pin) => (
                    <button
                      key={pin.id}
                      onClick={() => setSelectedPin(pin)}
                      className="absolute group/pin focus:outline-none transition-all duration-300 hover:scale-125 z-10"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    >
                      {/* Pulse Ring */}
                      <span className={`absolute -inset-1.5 rounded-full animate-ping opacity-60 ${
                        pin.zone === "Zone 1" ? "bg-emerald-500" : pin.zone === "Zone 2" ? "bg-electric-blue" : "bg-pink-500"
                      }`} />
                      {/* Anchor pin dot */}
                      <div className={`w-3.5 h-3.5 rounded-full border border-white/60 shadow-lg ${pin.color}`} />
                      
                      {/* Hover Mini Tooltip */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/pin:opacity-100 transition-opacity duration-300 pointer-events-none bg-navy-deep border border-slate-700/80 px-2.5 py-1.5 rounded-lg whitespace-nowrap text-[10px] text-white shadow-xl">
                        <span className="font-headline font-bold">{pin.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                          <span>{pin.zone}</span>
                          <span>•</span>
                          <span>{pin.location}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Club Details Panel */}
            <div className="lg:col-span-4 flex flex-col">
              {selectedPin ? (
                <GlassPanel glowColor="cyan" className="p-6 border-slate-800/85 bg-navy-dark/40 flex flex-col justify-between h-full flex-grow animate-fade-in">
                  <div className="flex flex-col gap-5">
                    <div>
                      <span className="px-2.5 py-1 rounded bg-navy-deep/80 border border-slate-800 text-electric-blue font-metadata text-[10px] font-bold uppercase tracking-wider">
                        {selectedPin.zone}
                      </span>
                      <h3 className="font-headline text-xl font-bold text-white mt-3 leading-snug">
                        {selectedPin.name}
                      </h3>
                      <p className="text-slate-500 font-metadata text-[11px] mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {selectedPin.location}
                      </p>
                    </div>

                    <div className="h-px w-full bg-slate-800/60" />

                    <div className="flex flex-col gap-3 font-body text-xs text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">President:</span>
                        <span className="font-bold text-white">{selectedPin.president}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Active Projects:</span>
                        <span className="font-bold text-white flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" /> {selectedPin.projects}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Total Points:</span>
                        <span className="font-bold text-electric-blue flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> {selectedPin.points.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      href="/clubs"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-electric-blue text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-ocean-glow transition-all"
                    >
                      Visit Club Directory
                    </Link>
                  </div>
                </GlassPanel>
              ) : (
                <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/20 flex flex-col items-center justify-center text-center h-full flex-grow border-dashed">
                  <Info className="w-8 h-8 text-slate-600 mb-3" />
                  <h4 className="font-headline text-sm font-bold text-white">Select a Club Location</h4>
                  <p className="text-slate-500 text-xs mt-1 font-body max-w-[200px] leading-relaxed">
                    Click any pulsating node on the map to review the club officers and performance scores.
                  </p>
                </GlassPanel>
              )}
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: DYNAMIC MONTH CALENDAR ================= */}
        <section>
          <div className="flex items-center gap-3 mb-8 pb-3 border-b border-slate-800/40 max-w-sm">
            <Calendar className="w-6 h-6 text-electric-blue" />
            <h2 className="font-headline text-2xl font-bold text-white">
              District Calendar
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Monthly Calendar Grid */}
            <div className="lg:col-span-7">
              <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/30 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-headline text-md font-bold text-white flex items-center gap-2">
                    July 2026
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500">
                    <button className="p-2 rounded-lg bg-navy-deep/80 border border-slate-800 hover:border-slate-700 text-slate-400 cursor-not-allowed opacity-50" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-navy-deep/80 border border-slate-800 hover:border-slate-700 text-slate-400 cursor-not-allowed opacity-50" disabled>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Header */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-metadata font-bold text-slate-500 uppercase tracking-wider">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty offsets for Wednesday start (Sun, Mon, Tue empty) */}
                  {[1, 2, 3].map((val) => (
                    <div key={`offset-${val}`} className="aspect-square flex items-center justify-center text-[10px] text-slate-700 select-none">
                      28
                    </div>
                  ))}

                  {/* Day Blocks */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                    const matchedEvent = districtEvents.find(e => e.day === d);
                    const isSelected = selectedDay === d;
                    
                    return (
                      <button
                        key={`day-${d}`}
                        onClick={() => setSelectedDay(d)}
                        className={`aspect-square rounded-xl border flex flex-col justify-between p-2 select-none transition-all duration-300 relative ${
                          isSelected
                            ? "border-electric-blue bg-electric-blue/15 text-electric-blue font-bold shadow-[0_0_15px_rgba(0,240,255,0.15)] scale-105 z-10"
                            : matchedEvent
                              ? matchedEvent.category === "Assembly"
                                ? "border-electric-blue/40 bg-electric-blue/5 text-electric-blue font-bold"
                                : matchedEvent.category === "Installation"
                                  ? "border-pink-500/40 bg-pink-500/5 text-pink-400 font-bold"
                                  : matchedEvent.category === "Training"
                                    ? "border-amber-500/40 bg-amber-500/5 text-amber-400 font-bold"
                                    : "border-emerald-500/40 bg-emerald-500/5 text-emerald-400 font-bold"
                              : "border-slate-800/80 bg-navy-deep/20 text-slate-400 hover:border-slate-700 hover:bg-navy-deep/40"
                        }`}
                      >
                        <span className="text-xs">{d}</span>
                        {/* Event Dot */}
                        {matchedEvent && (
                          <span className={`w-1.5 h-1.5 rounded-full mx-auto ${
                            matchedEvent.category === "Assembly"
                              ? "bg-electric-blue"
                              : matchedEvent.category === "Installation"
                                ? "bg-pink-500"
                                : matchedEvent.category === "Training"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>

            {/* Event Details Card Panel */}
            <div className="lg:col-span-5 flex flex-col">
              {selectedDay && districtEvents.find(e => e.day === selectedDay) ? (() => {
                const evt = districtEvents.find(e => e.day === selectedDay)!;
                return (
                  <GlassPanel glowColor="cyan" className="p-6 border-slate-800/80 bg-navy-dark/40 flex flex-col justify-between h-full flex-grow animate-fade-in">
                    <div className="flex flex-col gap-5">
                      <div>
                        <span className={`px-2.5 py-1 rounded bg-navy-deep/80 border border-slate-800 font-metadata text-[10px] font-bold uppercase tracking-wider ${
                          evt.category === "Assembly"
                            ? "text-electric-blue"
                            : evt.category === "Installation"
                              ? "text-pink-400"
                              : evt.category === "Training"
                                ? "text-amber-400"
                                : "text-emerald-400"
                        }`}>
                          {evt.category}
                        </span>
                        <h3 className="font-headline text-lg font-bold text-white mt-3 leading-snug">
                          {evt.title}
                        </h3>
                        <p className="text-slate-400 font-body text-xs mt-2 leading-relaxed">
                          {evt.desc}
                        </p>
                      </div>

                      <div className="h-px w-full bg-slate-800/40" />

                      <div className="flex flex-col gap-3 font-body text-xs text-slate-300">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Date:</span>
                          <span className="font-bold text-white">{evt.date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Time:</span>
                          <span className="font-bold text-white">{evt.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Location:</span>
                          <span className="font-bold text-white truncate max-w-[200px]" title={evt.location}>{evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                      <button className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all">
                        Register
                      </button>
                      <button className="flex-1 px-4 py-2.5 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow text-xs font-bold transition-all">
                        Add to Calendar
                      </button>
                    </div>
                  </GlassPanel>
                );
              })() : (
                <GlassPanel className="p-6 border-slate-800/60 bg-navy-dark/20 flex flex-col items-center justify-center text-center h-full flex-grow border-dashed">
                  <Calendar className="w-8 h-8 text-slate-600 mb-3" />
                  <h4 className="font-headline text-sm font-bold text-white">Select Event Date</h4>
                  <p className="text-slate-500 text-xs mt-1 font-body max-w-[200px] leading-relaxed">
                    Click any date highlighted with a indicator dot to review the schedule and register.
                  </p>
                </GlassPanel>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
