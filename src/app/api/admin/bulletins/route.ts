import { NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";
import { jsonAuthzError, requireAdminActor } from "@/lib/portal-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function supabaseFetch(path: string) {
  const bearerToken = await generateSupabaseJWT("service_role");
  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase error (${res.status}): ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

export async function GET() {
  try {
    await requireAdminActor();
    const rows = await supabaseFetch(
      "/club_bulletins?select=id,title,edition,file_url,created_at,club_id,clubs(name)&deleted_at=is.null&order=created_at.desc"
    );
    return NextResponse.json(rows || []);
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("GET /api/admin/bulletins error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
