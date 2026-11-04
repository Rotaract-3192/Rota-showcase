import { NextRequest, NextResponse } from "next/server";
import { jsonAuthzError, requireAdminActor } from "@/lib/portal-auth";
import { invitePortalUser } from "@/lib/invite-user";

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminActor();
    const { name, email, phone, clubId, role, zone } = await req.json();

    const result = await invitePortalUser({
      name,
      email,
      phone,
      clubId,
      role,
      zone,
      actorId: actor.profileId,
    });

    const message = result.inviteSent
      ? `Access ready for ${result.email}. Clerk invite email was sent.`
      : `Access ready for ${result.email}. They already have (or could not receive) a Clerk invite — ask them to sign in with this exact email.${
          result.inviteWarning ? ` (${result.inviteWarning})` : ""
        }`;

    return NextResponse.json({ success: true, ...result, message });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("POST /api/admin/users/invite error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
