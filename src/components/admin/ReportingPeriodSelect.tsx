"use client";

import React from "react";
import { periodOptions } from "@/lib/reporting-period";

export default function ReportingPeriodSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[220px]">
      <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Reporting period</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-navy-deep border border-slate-800 text-xs text-slate-300 focus:outline-none"
      >
        {periodOptions().map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
