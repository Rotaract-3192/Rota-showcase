import { NextRequest, NextResponse } from "next/server";
import { activityService } from "@/services/activity.service";
import { requirePortalActor, assertCanAccessClubRecord, AuthzError } from "@/lib/portal-auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing activity ID" }, { status: 400 });
  }

  try {
    const actor = await requirePortalActor();
    const existing = await activityService.getById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    assertCanAccessClubRecord(actor, existing.club_id);
    await activityService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AuthzError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Delete activity error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
