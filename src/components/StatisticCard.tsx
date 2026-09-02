"use client";

import React, { useState, useEffect, useRef } from "react";
import GlassPanel from "./GlassPanel";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatisticCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  iconClassName?: string;
  duration?: number; // Animation duration in milliseconds
}

export default function StatisticCard({
  icon: Icon,
  value,
  label,
  prefix = "",
  suffix = "",
  className,
  iconClassName,
  duration = 1500,
}: StatisticCardProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let cancelled = false;
    let raf = 0;
    let started = false;

    const animateTo = (target: number) => {
      if (started) return;
      started = true;
      let startTime: number | null = null;

      const tick = (timestamp: number) => {
        if (cancelled) return;
        if (!startTime) startTime = timestamp;
        const percentage = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = percentage * (2 - percentage);
        setCount(Math.floor(easeProgress * target));

        if (percentage < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setCount(target);
        }
      };

      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          animateTo(value);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [value, duration]);

  return (
    <div ref={elementRef} className="w-full">
      <GlassPanel
        hoverEffect
        glowColor="blue"
        className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-5 p-3 sm:p-4 md:p-6 min-w-0 w-full", className)}
      >
        {/* Icon boundary container */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-electric-blue/5 border border-electric-blue/15 text-electric-blue shadow-sm shadow-electric-blue/5",
            iconClassName
          )}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </div>
  
        {/* Numerical Data Column */}
        <div className="flex flex-col gap-0.5 min-w-0 w-full">
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-metadata font-bold uppercase tracking-wider leading-tight">
            {label}
          </span>
          <h3 className="font-metadata text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-baseline flex-wrap">
            {prefix && <span className="text-xs sm:text-sm font-bold text-slate-400 mr-0.5">{prefix}</span>}
            <span>{count.toLocaleString()}</span>
            {suffix && <span className="text-electric-blue text-xs sm:text-sm font-bold ml-0.5">{suffix}</span>}
          </h3>
        </div>
      </GlassPanel>
    </div>
  );
}
