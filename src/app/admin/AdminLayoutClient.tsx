"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopNav from "@/components/admin/AdminTopNav";
import CommandPalette from "@/components/admin/CommandPalette";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  access: "full" | "publications";
  user: {
    name: string;
    email: string;
    roleLabel?: string;
  };
}

const PR_ALLOWED = ["/admin/publications", "/admin/profile"];

export default function AdminLayoutClient({
  children,
  access,
  user,
}: AdminLayoutClientProps) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (access !== "publications") return;
    const allowed = PR_ALLOWED.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );
    if (!allowed) {
      router.replace("/admin/publications");
    }
  }, [access, pathname, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-navy-deep flex text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-electric-blue overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        access={access}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminTopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-gradient-to-b from-navy-deep to-navy-dark/40 relative">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.03] pointer-events-none -z-10" />
          {children}
        </main>
      </div>

      {access === "full" && <CommandPalette />}
    </div>
  );
}
