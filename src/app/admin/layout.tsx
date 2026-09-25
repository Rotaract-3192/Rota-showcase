import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";
import { getPortalActor } from "@/lib/portal-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId || !user) {
    redirect("/sign-in");
  }

  const actor = await getPortalActor();
  if (!actor?.isDistrict) {
    redirect("/portal/dashboard");
  }

  const publicationsOnly = Boolean(
    actor.isPrTeam && !actor.isDistrictWide && !actor.isZrr
  );

  const email =
    user.emailAddresses[0]?.emailAddress || actor.email || "";

  return (
    <AdminLayoutClient
      access={publicationsOnly ? "publications" : "full"}
      user={{
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Administrator",
        email,
        roleLabel: publicationsOnly
          ? "PR Team"
          : actor.isZrr
            ? `ZRR${actor.zone ? ` · ${actor.zone}` : ""}`
            : actor.roles[0] || "Administrator",
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
