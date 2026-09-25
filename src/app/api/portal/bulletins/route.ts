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
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { ok: res.ok, status: res.status, body, raw: text };
}

export async function GET() {
  try {
    const actor = await requirePortalActor();
    if (!actor.clubId) {
      return NextResponse.json({ bulletins: [] });
    }
    const result = await rest(
      `/club_bulletins?select=id,title,edition,file_url,created_at,club_id&club_id=eq.${actor.clubId}&order=created_at.desc`
    );
    if (!result.ok) {
      throw new Error(
        typeof result.body === "string"
          ? result.body
          : result.raw || "Failed to load bulletins"
      );
    }
    const rows = Array.isArray(result.body) ? result.body : [];
    return NextResponse.json({
      bulletins: rows.filter((row: any) => !row.deleted_at),
    });
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
        {
          error:
            "Your account is not linked to a club, so the bulletin cannot be saved. Ask district admin to set your club on Users.",
        },
        { status: 400 }
      );
    }
    const body = await req.json();
    const title = String(body.title || "").trim();
    const edition = String(body.edition || "").trim();
    const fileUrl = String(body.fileUrl || body.file_url || "").trim();
    if (!title || !edition || !fileUrl) {
      return NextResponse.json(
        { error: "Title, edition, and PDF are required." },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      club_id: actor.clubId,
      title,
      edition,
      file_url: fileUrl,
    };
    if (actor.profileId) {
      payload.submitted_by = actor.profileId;
    }

    let result = await rest("/club_bulletins", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    // Retry without submitted_by if the column/FK rejects it
    if (!result.ok && payload.submitted_by) {
      const { submitted_by: _drop, ...withoutSubmitter } = payload;
      result = await rest("/club_bulletins", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(withoutSubmitter),
      });
    }

    if (!result.ok) {
      const detail =
        typeof result.body === "object" && result.body
          ? JSON.stringify(result.body)
          : result.raw || "Failed to save bulletin";
      console.error("POST /api/portal/bulletins supabase error:", detail);
      throw new Error(detail);
    }

    const data = result.body;
    return NextResponse.json({
      success: true,
      bulletin: Array.isArray(data) ? data[0] : data,
    });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("POST /api/portal/bulletins error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
