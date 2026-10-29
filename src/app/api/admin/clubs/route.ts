import { NextRequest, NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";
import { AuthzError, jsonAuthzError, requireAdminActor } from "@/lib/portal-auth";
import { invitePortalUser } from "@/lib/invite-user";
import { canonicalizeZone } from "@/lib/zones";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const CLUB_TYPES = new Set(["Community Based", "Institution Based"]);

type OfficialInput = { name: string; email: string; phone: string; role: "President" | "Secretary" };

function parseOfficial(value: unknown, role: "President" | "Secretary") {
  if (!value || typeof value !== "object") return { official: null as OfficialInput | null, error: null };
  const raw = value as Record<string, unknown>;
  const name = String(raw.name || "").trim();
  const email = String(raw.email || "").trim().toLowerCase();
  const phone = String(raw.phone || "").trim();
  if (!name && !email && !phone) return { official: null, error: null };
  if (!name || !email) {
    return {
      official: null,
      error: `${role} needs both a name and an email so they can be invited to the portal.`,
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { official: null, error: `${role} email looks invalid.` };
  }
  return { official: { name, email, phone, role }, error: null };
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || `club-${Date.now()}`;
}

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

async function uniqueSlug(base: string) {
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const existing = await rest(`/clubs?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    const taken = Array.isArray(existing.body) && existing.body.length > 0;
    if (!taken) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminActor();
    if (!actor.isDistrictWide) {
      throw new AuthzError("Only DRS / District Admin can add clubs.", 403);
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const zone = canonicalizeZone(body.zone);
    const clubType = String(body.clubType || body.club_type || "Community Based").trim();
    const email = String(body.email || body.clubEmail || body.club_email || "").trim();
    const partnerClub = String(body.partnerClub || body.partner_rotary_club || "").trim();
    const description = String(body.description || "").trim();
    const charterDateRaw = String(body.charterDate || body.charter_date || "").trim();
    const president = parseOfficial(body.president, "President");
    const secretary = parseOfficial(body.secretary, "Secretary");

    if (president.error) {
      return NextResponse.json({ error: president.error }, { status: 400 });
    }
    if (secretary.error) {
      return NextResponse.json({ error: secretary.error }, { status: 400 });
    }
    if (
      president.official &&
      secretary.official &&
      president.official.email === secretary.official.email
    ) {
      return NextResponse.json(
        { error: "President and Secretary need different email addresses." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json({ error: "Club name is required." }, { status: 400 });
    }
    if (!zone) {
      return NextResponse.json(
        { error: "Select a zone (Arnava, Pravaha, Taranga, Varuna, Sagara, or Samudhra)." },
        { status: 400 }
      );
    }
    if (!CLUB_TYPES.has(clubType)) {
      return NextResponse.json(
        { error: "Club type must be Community Based or Institution Based." },
        { status: 400 }
      );
    }

    const duplicates = await rest(
      `/clubs?select=id,name&deleted_at=is.null&name=eq.${encodeURIComponent(name)}`
    );
    if (Array.isArray(duplicates.body) && duplicates.body.length > 0) {
      return NextResponse.json(
        { error: `A club named “${duplicates.body[0].name}” already exists.` },
        { status: 409 }
      );
    }

    const districtRows = await rest("/clubs?select=district_id&deleted_at=is.null&limit=1");
    const districtId = Array.isArray(districtRows.body) ? districtRows.body[0]?.district_id : null;
    if (!districtId) {
      return NextResponse.json(
        { error: "Could not resolve District 3192. Ask a developer to set districts before adding clubs." },
        { status: 500 }
      );
    }

    const slug = await uniqueSlug(slugify(name));
    const payload: Record<string, unknown> = {
      district_id: districtId,
      name,
      slug,
      status: "ACTIVE",
      zone,
      club_type: clubType,
      email: email || null,
      club_email: email || null,
      partner_rotary_club: partnerClub || null,
      description: description || null,
      charter_date: charterDateRaw || null,
      member_count: 0,
      total_projects: 0,
      total_points: 0,
    };

    const result = await rest("/clubs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      const detail =
        typeof result.body === "object" && result.body
          ? JSON.stringify(result.body)
          : result.raw || "Failed to create club";
      console.error("POST /api/admin/clubs supabase error:", detail);
      throw new Error(detail);
    }

    const club = Array.isArray(result.body) ? result.body[0] : result.body;
    const invited: { role: string; email: string }[] = [];
    const inviteErrors: string[] = [];

    for (const official of [president.official, secretary.official]) {
      if (!official || !club?.id) continue;
      try {
        await invitePortalUser({
          name: official.name,
          email: official.email,
          phone: official.phone,
          clubId: club.id,
          role: official.role,
          actorId: actor.profileId,
        });
        invited.push({ role: official.role, email: official.email });
      } catch (inviteErr: any) {
        console.error(`Failed to invite ${official.role}:`, inviteErr);
        inviteErrors.push(
          `${official.role} (${official.email}): ${inviteErr.message || "invite failed"}`
        );
      }
    }

    return NextResponse.json({ success: true, club, invited, inviteErrors });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("POST /api/admin/clubs error:", err);
    return NextResponse.json({ error: err.message || "Failed to create club" }, { status: 500 });
  }
}
