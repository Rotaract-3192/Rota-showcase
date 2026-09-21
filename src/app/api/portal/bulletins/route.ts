import { NextRequest, NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";
import { jsonAuthzError, requirePortalActor } from "@/lib/portal-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const actor = await requirePortalActor();
    const body = await req.json();
    const title = String(body.title || "").trim();
    const edition = String(body.edition || "").trim();
    const fileUrl = String(body.fileUrl || "").trim();
    if (!title || !edition || !fileUrl) {
      return NextResponse.json({ error: "Title, edition, and PDF are required." }, { status: 400 });
    }

    const bearerToken = await generateSupabaseJWT("service_role");
    const res = await fetch(`${supabaseUrl}/rest/v1/club_bulletins`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        club_id: actor.clubId,
        title,
        edition,
        file_url: fileUrl,
        submitted_by: actor.profileId,
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to save bulletin");
    }
    const data = await res.json();
    return NextResponse.json({ success: true, bulletin: Array.isArray(data) ? data[0] : data });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("POST /api/portal/bulletins error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
