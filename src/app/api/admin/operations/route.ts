import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { clubIdsInZone, jsonAuthzError, resolveAdminZoneFilter } from "@/lib/portal-auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { filterZone } = await resolveAdminZoneFilter(searchParams.get("zone"));
    const clubIds = filterZone ? await clubIdsInZone(filterZone) : null;

    const supabase = await createServerSupabaseClient();

    // Fetch reports from all 4 tables in parallel
    let meetingsQuery = supabase
      .from("meetings")
      .select(`
        id,
        date,
        minutes_text,
        attendees_count,
        audio_url,
        transcript_text,
        created_at,
        cover_image,
        supporting_image_1,
        supporting_image_2,
        clubs!inner ( name, zone )
      `)
      .is("deleted_at", null)
      .order("date", { ascending: false });

    let orientationsQuery = supabase
      .from("orientations")
      .select(`
        id,
        date,
        speaker_name,
        new_members_inducted,
        remarks,
        created_at,
        cover_image,
        supporting_image_1,
        supporting_image_2,
        clubs!inner ( name, zone )
      `)
      .is("deleted_at", null)
      .order("date", { ascending: false });

    let installationsQuery = supabase
      .from("installations")
      .select(`
        id,
        name,
        date,
        venue,
        chief_guest,
        created_at,
        cover_image,
        supporting_image_1,
        supporting_image_2,
        clubs!inner ( name, zone ),
        incoming_president:member_profiles!incoming_president_id ( first_name, last_name )
      `)
      .is("deleted_at", null)
      .order("date", { ascending: false });

    let dovsQuery = supabase
      .from("dovs")
      .select(`
        id,
        date,
        evaluation_score,
        remarks,
        created_at,
        cover_image,
        supporting_image_1,
        supporting_image_2,
        clubs!inner ( name, zone ),
        visiting_official:member_profiles!visiting_official_id ( first_name, last_name )
      `)
      .is("deleted_at", null)
      .order("date", { ascending: false });

    if (clubIds) {
      if (clubIds.length === 0) {
        return NextResponse.json({ meetings: [], orientations: [], installations: [], dovs: [] });
      }
      meetingsQuery = meetingsQuery.in("club_id", clubIds);
      orientationsQuery = orientationsQuery.in("club_id", clubIds);
      installationsQuery = installationsQuery.in("club_id", clubIds);
      dovsQuery = dovsQuery.in("club_id", clubIds);
    }

    const [meetingsRes, orientationsRes, installationsRes, dovsRes] = await Promise.all([
      meetingsQuery,
      orientationsQuery,
      installationsQuery,
      dovsQuery
    ]);

    if (meetingsRes.error) throw meetingsRes.error;
    if (orientationsRes.error) throw orientationsRes.error;
    if (installationsRes.error) throw installationsRes.error;
    if (dovsRes.error) throw dovsRes.error;

    return NextResponse.json({
      meetings: meetingsRes.data || [],
      orientations: orientationsRes.data || [],
      installations: installationsRes.data || [],
      dovs: dovsRes.data || []
    });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("GET /api/admin/operations error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
