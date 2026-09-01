import React from "react";
import Sidebar from "@/components/Sidebar";
import TopNavigation from "@/components/TopNavigation";
import { PortalUserProvider } from "@/components/PortalUserProvider";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMemberRoles, linkAndLoadMemberProfile } from "@/lib/member-sync";

export const metadata = {
  title: "Command Center | District 3192",
  description: "Operations dashboard for Rotaract District 3192",
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const user = await currentUser();
  const emails = (user?.emailAddresses || []).map((e) => e.emailAddress).filter(Boolean);

  try {
    const profile = await linkAndLoadMemberProfile(userId, emails);

    if (!profile) {
      redirect("/login?error=unauthorized");
    }

    const roles = await fetchMemberRoles(profile.id);
    const roleName = roles[0] || "Member";
    const fullName = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ");

    const portalUser = {
      name: fullName || "Rotaractor",
      role: roleName,
    };

    return (
      <PortalUserProvider user={portalUser}>
        <div className="min-h-screen bg-navy-deep text-slate-200 font-body">
          <Sidebar />

          <div className="md:pl-64 flex flex-col min-h-screen">
            <TopNavigation />
            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </PortalUserProvider>
    );
  } catch (err) {
    console.error("[PortalLayout] Error fetching profile:", err);
    redirect("/login?error=unauthorized");
  }
}
