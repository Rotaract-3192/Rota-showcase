import { NextRequest, NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";
import { jsonAuthzError, requirePortalActor } from "@/lib/portal-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function rest(path: string, init: RequestInit = {}) {
  const bearerToken = await generateSupabaseJWT("service_role");
  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text ? JSON.parse(text) : null, raw: text };
}

export async function GET() {
  try {
    const actor = await requirePortalActor();
    if (!actor.clubId) {
      return NextResponse.json({ bulletins: [] });
    }
    const result = await rest(
      `/club_bulletins?select=id,title,edition,file_url,created_at,club_id&club_id=eq.${actor.clubId}&deleted_at=is.null&order=created_at.desc`
    );
    if (!result.ok) {
      throw new Error(result.raw || "Failed to load bulletins");
    }
    return NextResponse.json({ bulletins: result.body || [] });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("GET /api/portal/bulletins error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requirePortalActor();
    if (!actor.clubId) {
      return NextResponse.json(
        { error: "Your account is not linked to a club, so the bulletin cannot be saved." },
        { status: 400 }
      );
    }
    const body = await req.json();
    const title = String(body.title || "").trim();
    const edition = String(body.edition || "").trim();
    const fileUrl = String(body.fileUrl || "").trim();
    if (!title || !edition || !fileUrl) {
      return NextResponse.json({ error: "Title, edition, and PDF are required." }, { status: 400 });
    }

    const result = await rest("/club_bulletins", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        club_id: actor.clubId,
        title,
        edition,
        file_url: fileUrl,
        submitted_by: actor.profileId,
      }),
    });
    if (!result.ok) {
      throw new Error(result.raw || "Failed to save bulletin");
    }
    const data = result.body;
    return NextResponse.json({ success: true, bulletin: Array.isArray(data) ? data[0] : data });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("POST /api/portal/bulletins error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
