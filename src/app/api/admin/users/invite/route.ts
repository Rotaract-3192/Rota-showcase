import { NextRequest, NextResponse } from "next/server";
import { jsonAuthzError, requireAdminActor } from "@/lib/portal-auth";
import { invitePortalUser } from "@/lib/invite-user";

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminActor();
    const { name, email, phone, clubId, role, zone } = await req.json();

    await invitePortalUser({
      name,
      email,
      phone,
      clubId,
      role,
      zone,
      actorId: actor.profileId,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("POST /api/admin/users/invite error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
