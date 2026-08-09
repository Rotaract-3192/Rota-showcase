"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Plus, Search, ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { useActivityList, useDeleteActivity, activityKeys } from "@/queries/activity.queries";
import { useQueryClient } from "@tanstack/react-query";
import ActivityDetailModal from "@/components/ActivityDetailModal";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  coverImage: string;
  uploadDate: string;
  avenueOfService: string;
  impactScore: number;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const { data: listResult, isLoading } = useActivityList({
    pagination: { page: 1, pageSize: 50 },
    sort: { column: "start_time", ascending: false }
  });
  
  // Cast or map the API data to match the UI's expected Project interface
  const projects = React.useMemo(() => {
    return (listResult?.data || []).map((activity: any) => ({
      id: activity.id,
      title: activity.title || "Untitled Activity",
      coverImage: activity.cover_image || "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80",
      uploadDate: activity.created_at || new Date().toISOString(),
      avenueOfService: activity.avenues?.[0] || "General",
      impactScore: activity.status === 'PUBLISHED' ? 100 : 50,
    }));
  }, [listResult?.data]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = React.useMemo<ColumnDef<Project>[]>(() => [
    {
      accessorKey: "coverImage",
      header: "Cover",
      cell: ({ row }) => (
        <img
          src={row.original.coverImage}
          alt="cover"
          className="w-10 h-10 rounded-lg object-cover border border-slate-700/60"
        />
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-bold text-slate-300 hover:text-white"
        >
          Activity Name
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-headline font-bold text-sm text-white">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "uploadDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-slate-400">
          {new Date(row.original.uploadDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "avenueOfService",
      header: "Avenue",
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[10px] font-bold uppercase tracking-wider">
          {row.original.avenueOfService}
        </span>
      ),
    },
    {
      accessorKey: "impactScore",
      header: "Status",
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
          Approved
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const queryClient = useQueryClient();
        const deleteActivity = useDeleteActivity();
        const id = row.original.id;

        const handleDelete = async () => {
          if (window.confirm(`Are you sure you want to delete ${row.original.title}? This action cannot be undone.`)) {
            try {
              await deleteActivity.mutateAsync(id);
              queryClient.invalidateQueries({ queryKey: activityKeys.all });
            } catch (err) {
              console.error(err);
              alert("Failed to delete activity.");
            }
          }
        };

        const handleView = () => {
          setSelectedActivityId(id);
        };

        const handleEdit = () => {
          router.push(`/portal/activities/report?edit=${id}`);
        };

        return (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={handleView} className="p-1.5 text-slate-400 hover:text-ocean-glow transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={handleEdit} className="p-1.5 text-slate-400 hover:text-electric-blue transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: projects,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Club Activities</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Manage your reported community projects, events, and initiatives.
          </p>
        </div>
        <Link
          href="/portal/activities/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-ocean-glow hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Report Activity
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-navy-dark/40 border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-navy-dark/60">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-navy-deep border border-slate-800 focus:border-electric-blue/40 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
              placeholder="Search activities..."
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-800/60 bg-navy-deep/40">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 font-metadata text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-navy-light/10 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-body text-sm">
                    No activities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between bg-navy-dark/60 text-xs font-metadata text-slate-400">
          <div>
            Showing page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 rounded bg-navy-deep border border-slate-800 disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 rounded bg-navy-deep border border-slate-800 disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {selectedActivityId && (
        <ActivityDetailModal 
          activityId={selectedActivityId} 
          onClose={() => setSelectedActivityId(null)} 
        />
      )}
    </div>
  );
}
