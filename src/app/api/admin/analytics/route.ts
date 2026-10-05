import { NextRequest, NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";
import { clubIdsInZone, jsonAuthzError, resolveAdminZoneFilter } from "@/lib/portal-auth";
import { activityAvenues, activityMatchesAvenue } from "@/lib/avenues";
import { canonicalizeZone, isDummyZone } from "@/lib/zones";
import { periodRange, restTimeFilter } from "@/lib/reporting-period";

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

type ClubContact = { name: string; email: string | null; phone: string | null };

async function loadClubContacts(clubIds: string[]) {
  const byClub = new Map<string, Record<string, ClubContact>>();
  if (clubIds.length === 0) return byClub;
  try {
    const rows = await fetchAll(
      `/member_roles?select=role,club_id,member_profiles(first_name,last_name,email,phone,club_id,deleted_at)` +
        `&role=in.(President,Secretary)&deleted_at=is.null`
    );
    const wanted = new Set(clubIds);
    rows.forEach((row: any) => {
      const profile = row.member_profiles;
      const clubId = row.club_id || profile?.club_id;
      if (!clubId || !wanted.has(clubId) || !profile || profile.deleted_at) return;
      const contacts = byClub.get(clubId) || {};
      if (!contacts[row.role]) {
        contacts[row.role] = {
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
          email: profile.email || null,
          phone: profile.phone || null,
        };
      }
      byClub.set(clubId, contacts);
    });
  } catch (err) {
    // Contacts are a convenience; never fail the analytics response over them.
    console.error("Failed to load club contacts:", err);
  }
  return byClub;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { filterZone } = await resolveAdminZoneFilter(searchParams.get("zone"));
    const range = periodRange(searchParams.get("period") || "ry");
    const avenueFilter = searchParams.get("avenue") || "All";
    const clubIds = filterZone ? await clubIdsInZone(filterZone) : null;

    let clubsPath =
      "/clubs?select=id,name,zone,member_count,total_projects,email,club_email&deleted_at=is.null";
    let activitiesPath =
      "/activities?select=id,status,avenues,club_id,start_time,volunteers,beneficiaries,activity_expenses,cash_contribution,in_kind_contribution,clubs(name,zone)&deleted_at=is.null";
    activitiesPath += restTimeFilter("start_time", range);
    if (clubIds) {
      if (clubIds.length === 0) {
        return NextResponse.json({
          totals: {
            reported: 0,
            published: 0,
            pending: 0,
            unspecifiedAvenue: 0,
            volunteers: 0,
            beneficiaries: 0,
            fundsRaised: 0,
            clubsReported: 0,
            clubsTotal: 0,
          },
          avenueData: [],
          zoneData: [],
          clubReporting: [],
        });
      }
      const filter = `id=in.(${clubIds.join(",")})`;
      const clubFilter = `club_id=in.(${clubIds.join(",")})`;
      clubsPath += `&${filter}`;
      activitiesPath += `&${clubFilter}`;
    }

    const [clubs, rawActivities] = await Promise.all([fetchAll(clubsPath), fetchAll(activitiesPath)]);
    const activities = (rawActivities || []).filter((act: any) =>
      activityMatchesAvenue(act.avenues, avenueFilter)
    );

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

    let volunteers = 0;
    let beneficiaries = 0;
    let fundsRaised = 0;
    const reportedClubIds = new Set<string>();
    const clubActivity = new Map<string, { reports: number; published: number; lastReportDate: string | null }>();
    activities.forEach((act: any) => {
      volunteers += Number(act.volunteers) || 0;
      beneficiaries += Number(act.beneficiaries) || 0;
      const cash = Number(act.cash_contribution) || 0;
      const inKind = Number(act.in_kind_contribution) || 0;
      const expenses = Number(act.activity_expenses) || 0;
      fundsRaised += cash + inKind > 0 ? cash + inKind : expenses;
      if (act.club_id) {
        reportedClubIds.add(act.club_id);
        const entry = clubActivity.get(act.club_id) || { reports: 0, published: 0, lastReportDate: null };
        entry.reports += 1;
        if (act.status === "PUBLISHED") entry.published += 1;
        if (act.start_time && (!entry.lastReportDate || act.start_time > entry.lastReportDate)) {
          entry.lastReportDate = act.start_time;
        }
        clubActivity.set(act.club_id, entry);
      }
    });

    const contactsByClub = await loadClubContacts(clubs.map((club: any) => club.id));
    const clubReporting = clubs
      .map((club: any) => {
        const stats = clubActivity.get(club.id);
        const contacts = contactsByClub.get(club.id) || {};
        return {
          id: club.id,
          name: club.name,
          zone: canonicalizeZone(club.zone) || club.zone || "Unassigned",
          reported: reportedClubIds.has(club.id),
          reports: stats?.reports || 0,
          published: stats?.published || 0,
          lastReportDate: stats?.lastReportDate || null,
          clubEmail: club.club_email || club.email || null,
          president: contacts.President || null,
          secretary: contacts.Secretary || null,
        };
      })
      .sort((a: any, b: any) => a.zone.localeCompare(b.zone) || a.name.localeCompare(b.name));

    return NextResponse.json({
      totals: {
        reported: activities.length,
        published: published.length,
        pending: pending.length,
        unspecifiedAvenue,
        volunteers,
        beneficiaries,
        fundsRaised,
        clubsReported: reportedClubIds.size,
        clubsTotal: clubs.length,
      },
      avenueData,
      zoneData,
      clubReporting,
    });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("GET /api/admin/analytics error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
