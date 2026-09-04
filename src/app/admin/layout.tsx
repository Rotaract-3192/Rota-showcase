import { auth, currentUser } from "@clerk/nextjs/server";
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

  const email =
    user.emailAddresses[0]?.emailAddress || actor.email || "";

  return (
    <AdminLayoutClient
      user={{
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Administrator",
        email,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
