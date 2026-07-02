"use client";

import React from "react";
import Link from "next/link";
import WaveBackground from "@/components/WaveBackground";
import GlassPanel from "@/components/GlassPanel";
import StatisticCard from "@/components/StatisticCard";
import ProjectCard from "@/components/ProjectCard";
import { useStore, selectFilteredProjects } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import {
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  Award,
  Globe,
  Coins,
  Shield,
  Heart,
  GraduationCap,
  Megaphone,
  Briefcase,
  Layers,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const projects = useStore(useShallow(selectFilteredProjects));
  const stats = useStore((state) => state.stats);

  // Take top 4 sorted projects for the featured section
  const featuredProjects = projects.slice(0, 4);

  const avenues = [
    {
      icon: Briefcase,
      title: "Club Service",
      description: "Strengthening fellowship, administrative efficacy, and relationship building within our clubs.",
      count: 18,
    },
    {
      icon: Heart,
      title: "Community Service",
      description: "Implementing structural programs addressing literacy, water access, healthcare, and economic relief.",
      count: 45,
    },
    {
      icon: GraduationCap,
      title: "Professional Development",
      description: "Empowering youth with leadership, project management, public speaking, and entrepreneurship skills.",
      count: 22,
    },
    {
      icon: Globe,
      title: "International Service",
      description: "Fostering global peace, understanding, and joint projects with Rotaract networks worldwide.",
      count: 12,
    },
    {
      icon: Megaphone,
      title: "Public Relations",
      description: "Broadcasting service footprints to secure community support, partnerships, and advocacy.",
      count: 15,
    },
    {
      icon: Shield,
      title: "Public Image",
      description: "Elevating the Rotary brand and demonstrating structural transparency across public platforms.",
      count: 14,
    },
    {
      icon: Zap,
      title: "Next Gen",
      description: "Investing in the talent of tomorrow through mentorships, school projects, and early skill training.",
      count: 20,
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Dynamic ocean particle backdrop */}
      <WaveBackground intensity={0.65} particleCount={45} />

      {/* ================= SECTION 1 – HERO ================= */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 md:px-8 py-20 text-center overflow-hidden">
        {/* Soft atmospheric gradient top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 ocean-glow-top -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 z-10">
          {/* Accent Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-electric-blue/10 border border-electric-blue/30 text-electric-blue backdrop-blur-md animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>District 3192 Flagship Portal</span>
          </div>

          {/* High-Impact caslon display title */}
          <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.15]">
            ROTARACT DISTRICT 3192
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base md:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Discover the projects, people, and ripples of impact creating positive,
            sustainable change across communities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-electric-blue to-ocean-glow text-navy-deep font-bold text-sm uppercase tracking-wider shadow-lg shadow-electric-blue/20 hover:scale-105 transition-transform duration-300"
            >
              Explore Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-slate-700/60 bg-navy-dark/40 text-slate-200 font-semibold text-sm uppercase tracking-wider hover:bg-navy-light hover:border-slate-500/80 transition-all duration-300"
            >
              View Rankings
            </Link>
          </div>
        </div>

        {/* ================= HERO LIVE IMPACT METRICS ================= */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-20 px-4 z-10">
          <StatisticCard icon={Layers} value={stats.totalProjects} label="Projects Finished" suffix="+" />
          <StatisticCard icon={Users} value={stats.activeClubs} label="Active Clubs" />
          <StatisticCard icon={Award} value={stats.totalBeneficiaries} label="People Reached" suffix="+" />
          <StatisticCard icon={Clock} value={stats.volunteerHours} label="Vol. Hours" suffix=" hrs" />
          <StatisticCard icon={Coins} value={stats.contributions} label="Contributions" prefix="₹" suffix="+" />
        </div>
      </section>

      {/* ================= SECTION 2 – FEATURED STORIES ================= */}
      <section className="relative py-24 px-6 md:px-8 bg-gradient-to-b from-transparent to-navy-dark/80">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-metadata text-xs font-bold text-electric-blue uppercase tracking-widest">
                Collective Ripples
              </span>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mt-2">
                Featured Impact Stories
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-glow hover:text-electric-blue transition-colors group font-metadata"
            >
              <span>Explore all showcase projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Draggable/Overflow Carousel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProjects.map((project) => (
              <div key={project.id} className="h-full">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 3 – DISTRICT IMPACT ================= */}
      <section className="relative py-24 px-6 md:px-8 bg-navy-dark/90 border-y border-slate-800/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Visual pitch */}
          <div className="flex flex-col gap-5 text-center lg:text-left">
            <span className="font-metadata text-xs font-bold text-electric-blue uppercase tracking-widest">
              Measure of our current
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-white leading-tight">
              A Unified Ecosystem of Growth
            </h2>
            <p className="text-slate-400 font-body leading-relaxed">
              Every drop makes the ocean. We track numbers in real-time, matching
              our community projects with the United Nations Sustainable Development
              Goals to ensure compliance, transparency, and verified output.
            </p>
          </div>

          {/* Grid counters */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-navy-deep/60 border border-slate-800/60">
              <span className="font-metadata text-xs text-slate-500 uppercase font-bold">Total Operations</span>
              <h3 className="font-headline text-4xl font-black text-white mt-2">450+</h3>
              <p className="text-xs text-slate-400 font-body mt-2">Certified projects executed across urban & rural areas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-navy-deep/60 border border-slate-800/60">
              <span className="font-metadata text-xs text-slate-500 uppercase font-bold">Volunteer Current</span>
              <h3 className="font-headline text-4xl font-black text-electric-blue mt-2">2,500+</h3>
              <p className="text-xs text-slate-400 font-body mt-2">Active youth leaders committed to social transformation.</p>
            </div>
            <div className="p-6 rounded-2xl bg-navy-deep/60 border border-slate-800/60">
              <span className="font-metadata text-xs text-slate-500 uppercase font-bold">Direct Beneficiaries</span>
              <h3 className="font-headline text-4xl font-black text-ocean-glow mt-2">120K+</h3>
              <p className="text-xs text-slate-400 font-body mt-2">Families and individuals uplifted via structural programs.</p>
            </div>
            <div className="p-6 rounded-2xl bg-navy-deep/60 border border-slate-800/60">
              <span className="font-metadata text-xs text-slate-500 uppercase font-bold">District Capital</span>
              <h3 className="font-headline text-4xl font-black text-emerald-400 mt-2">₹5.2M+</h3>
              <p className="text-xs text-slate-400 font-body mt-2">Funds raised and transparently mobilized for social relief.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4 – AVENUES OF SERVICE ================= */}
      <section className="relative py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-metadata text-xs font-bold text-electric-blue uppercase tracking-widest">
              Waves of service
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mt-2">
              Avenues of Service
            </h2>
            <p className="text-slate-400 text-sm font-body mt-4 leading-relaxed">
              We structure our initiatives into 7 key areas, aligning efforts
              for maximum focus, capability, and targeted development.
            </p>
          </div>

          {/* Avenues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {avenues.map((ave, idx) => {
              const IconComp = ave.icon;
              return (
                <GlassPanel
                  key={idx}
                  hoverEffect
                  glowColor="blue"
                  className="flex flex-col justify-between p-6 cursor-pointer relative overflow-hidden group min-h-[200px]"
                >
                  {/* Subtle ripple line overlay in card bg */}
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-electric-blue/5 group-hover:bg-electric-blue/10 group-hover:scale-150 transition-all duration-500 -z-10" />

                  <div className="flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-electric-blue/10 border border-electric-blue/30 text-electric-blue flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-headline text-lg font-bold text-white group-hover:text-electric-blue transition-colors">
                      {ave.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-body leading-relaxed">
                      {ave.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between font-metadata text-[10px] font-bold text-slate-500 group-hover:text-ocean-glow transition-colors">
                    <span>ACTIVE INITIATIVES</span>
                    <span className="text-white bg-navy-dark px-2.5 py-1 rounded-full text-xs">
                      {ave.count}
                    </span>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SECTION 5 – MISSION & VISION ================= */}
      <section className="relative py-24 px-6 md:px-8 bg-gradient-to-t from-navy-dark/95 to-navy-dark/40 border-t border-slate-800/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Title block */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="font-metadata text-xs font-bold text-electric-blue uppercase tracking-widest">
              Core Principles
            </span>
            <h2 className="font-headline text-4xl lg:text-5xl font-bold text-white leading-tight">
              Connecting drops of action into a tidal movement.
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-electric-blue to-ocean-glow rounded-full mt-4" />
          </div>

          {/* Values Block */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 font-body">
            <div className="flex flex-col gap-3">
              <h3 className="font-headline text-xl font-bold text-white border-b border-slate-800/40 pb-2">
                Our Mission
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                To equip young leaders with the skills, partnerships, and resources
                necessary to execute sustainable service projects that solve critical
                social, economic, and environmental problems.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-headline text-xl font-bold text-white border-b border-slate-800/40 pb-2">
                Our Vision
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A highly connected, transparent, and digitally unified District where
                every volunteer action contributes to a larger, measurable wave of progress,
                improving human welfare across our territories.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:col-span-2">
              <h3 className="font-headline text-xl font-bold text-white border-b border-slate-800/40 pb-2">
                Core District Values
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                {[
                  "Servant Leadership",
                  "Radical Transparency",
                  "Inclusive Fellowship",
                  "Eco Sustainability",
                  "Technical Innovation",
                  "Professional Credibility",
                ].map((val, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2.5 rounded-lg bg-navy-deep/60 border border-slate-800/60 text-xs font-metadata text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue" />
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6 – FINAL CTA ================= */}
      <section className="relative py-28 px-6 md:px-8 overflow-hidden">
        {/* Ambient background glow circle */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.06)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto z-10 text-center">
          <GlassPanel
            glowColor="cyan"
            className="flex flex-col items-center gap-6 py-16 px-8 md:px-12 bg-navy-dark/50 border border-electric-blue/20"
          >
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-white leading-tight">
              Ready to Explore the Ocean of Impact?
            </h2>
            <p className="font-body text-slate-300 text-base max-w-xl leading-relaxed">
              Join active clubs, upload project portfolios, assess rankings, or
              verify community metrics in Rotaract District 3192.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-electric-blue text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-ocean-glow hover:scale-105 transition-all duration-300"
              >
                Explore Projects
              </Link>
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-transparent border border-slate-700/60 text-slate-200 font-semibold text-xs uppercase tracking-wider hover:bg-navy-light transition-all duration-300"
              >
                Explore Clubs
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-navy-dark text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 font-medium text-xs uppercase tracking-wider transition-all duration-300"
              >
                Club Login
              </Link>
            </div>
          </GlassPanel>
        </div>
      </section>
    </div>
  );
}
