import { NextRequest, NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";
import { clubIdsInZone, jsonAuthzError, resolveAdminZoneFilter } from "@/lib/portal-auth";
import { activityAvenues } from "@/lib/avenues";
import { canonicalizeZone, isDummyZone } from "@/lib/zones";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function supabaseFetch(path: string, extraHeaders: Record<string, string> = {}) {
  const bearerToken = await generateSupabaseJWT("service_role");
  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase error (${res.status}): ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function fetchAll(path: string) {
  const pageSize = 1000;
  const rows: any[] = [];
  let from = 0;
  while (true) {
    const batch = await supabaseFetch(path, {
      Range: `${from}-${from + pageSize - 1}`,
      Prefer: "count=exact",
    });
    const list = Array.isArray(batch) ? batch : [];
    rows.push(...list);
    if (list.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { filterZone } = await resolveAdminZoneFilter(searchParams.get("zone"));
    const clubIds = filterZone ? await clubIdsInZone(filterZone) : null;

    let clubsPath = "/clubs?select=id,name,zone,member_count,total_projects&deleted_at=is.null";
    let activitiesPath =
      "/activities?select=id,status,avenues,club_id,clubs(name,zone)&deleted_at=is.null";
    if (clubIds) {
      if (clubIds.length === 0) {
        return NextResponse.json({
          totals: { reported: 0, published: 0, pending: 0, unspecifiedAvenue: 0 },
          avenueData: [],
          zoneData: [],
        });
      }
      const filter = `id=in.(${clubIds.join(",")})`;
      const clubFilter = `club_id=in.(${clubIds.join(",")})`;
      clubsPath += `&${filter}`;
      activitiesPath += `&${clubFilter}`;
    }

    const [clubs, activities] = await Promise.all([fetchAll(clubsPath), fetchAll(activitiesPath)]);

    const published = activities.filter((act: any) => act.status === "PUBLISHED");
    const pending = activities.filter((act: any) =>
      ["PENDING", "SUBMITTED", "DRAFT"].includes(act.status)
    );

    const avenueMap = new Map<string, number>();
    let unspecifiedAvenue = 0;
    published.forEach((act: any) => {
      const tags = activityAvenues(act.avenues);
      const primary = tags[0];
      if (!primary) {
        unspecifiedAvenue += 1;
        avenueMap.set("Unspecified", (avenueMap.get("Unspecified") || 0) + 1);
        return;
      }
      avenueMap.set(primary, (avenueMap.get(primary) || 0) + 1);
    });

    const avenueData = Array.from(avenueMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const zoneProjectCounts = new Map<string, number>();
    published.forEach((act: any) => {
      const zone = canonicalizeZone(act.clubs?.zone) || act.clubs?.zone || "Unassigned";
      if (isDummyZone(zone) && zone !== "Unassigned") return;
      zoneProjectCounts.set(zone, (zoneProjectCounts.get(zone) || 0) + 1);
    });

    const zoneData = clubs
      .filter((club: any) => !isDummyZone(club.zone))
      .reduce((acc: any[], club: any) => {
        const zone = canonicalizeZone(club.zone) || club.zone;
        let row = acc.find((item) => item.name === zone);
        if (!row) {
          row = { name: zone, clubs: 0, members: 0, projects: 0 };
          acc.push(row);
        }
        row.clubs += 1;
        row.members += club.member_count || 0;
        return acc;
      }, []);

    zoneData.forEach((row: any) => {
      row.projects = zoneProjectCounts.get(row.name) || 0;
    });
    zoneData.sort((a: any, b: any) => b.projects - a.projects);

    return NextResponse.json({
      totals: {
        reported: activities.length,
        published: published.length,
        pending: pending.length,
        unspecifiedAvenue,
      },
      avenueData,
      zoneData,
    });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("GET /api/admin/analytics error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
