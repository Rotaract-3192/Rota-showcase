import React from "react";
import GlassPanel from "../GlassPanel";
import { Search, Filter, MoreHorizontal, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
  onFilterClick?: () => void;
  filterContent?: React.ReactNode;
}

export default function AdminDataTable<T>({
  title,
  description,
  data,
  columns,
  searchPlaceholder = "Search...",
  onSearch,
  actions,
  onFilterClick,
  filterContent
}: AdminDataTableProps<T>) {
  return (
    <GlassPanel className="p-0 border-slate-800/60 bg-navy-dark/40 flex flex-col overflow-hidden">
      {/* Table Header / Toolbar */}
      <div className="p-5 border-b border-slate-800/60 bg-navy-dark/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline text-lg font-bold text-white">{title}</h3>
          {description && (
            <p className="text-xs text-slate-400 font-metadata mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-electric-blue transition-colors" />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-navy-deep/80 border border-slate-700/60 text-sm text-white focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all w-full sm:w-64 font-body placeholder:text-slate-500"
            />
          </div>
          <button 
            onClick={onFilterClick}
            className="p-2 rounded-lg bg-navy-deep/80 border border-slate-700/60 hover:bg-slate-800 hover:text-white text-slate-400 transition-colors focus:outline-none"
          >
            <Filter className="w-4 h-4" />
          </button>
          {actions && (
            <div className="h-6 w-px bg-slate-700/60 mx-1" />
          )}
          {actions}
        </div>
      </div>
      
      {filterContent && (
        <div className="p-4 border-b border-slate-800/60 bg-navy-deep/30">
          {filterContent}
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-navy-deep/40 border-b border-slate-800/60">
              {columns.map((col, i) => (
                <th key={i} className="py-3 px-5 text-xs font-metadata font-bold text-slate-400 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-500 font-metadata text-sm">
                  No data found.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-slate-800/20 transition-colors group"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={cn("py-4 px-5 text-sm font-body text-slate-300", col.className)}>
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800/60 bg-navy-deep/20 flex items-center justify-between text-xs font-metadata text-slate-500">
        <span>Showing {data.length > 0 ? 1 : 0} to {data.length} entries</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors">Prev</button>
          <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 disabled:opacity-50 transition-colors">Next</button>
        </div>
      </div>
    </GlassPanel>
  );
}
