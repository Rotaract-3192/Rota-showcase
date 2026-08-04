import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Verify Admin Role in Database
    const { data: profileData, error: profileErr } = await supabase
      .from("member_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profileErr || !profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const { data: rolesData, error: rolesErr } = await supabase
      .from("member_roles")
      .select("role, zone")
      .eq("member_id", profileData.id)
      .is("deleted_at", null);

    if (rolesErr || !rolesData) {
      return NextResponse.json({ error: "Failed to verify user roles" }, { status: 500 });
    }

    const zrrRole = rolesData.find((r: any) => r.role === "ZRR");
    const isSuperAdmin = rolesData.some((r: any) =>
      ["District Admin", "District Core Team", "Super Admin", "Admin"].includes(r.role)
    );

    const isAuthorized = isSuperAdmin || !!zrrRole;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const selectedZone = searchParams.get("zone");
    const userZone = zrrRole?.zone;
    const filterZone = (!isSuperAdmin && userZone) ? userZone : selectedZone;

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

    if (filterZone && filterZone !== "All") {
      meetingsQuery = meetingsQuery.eq("clubs.zone", filterZone);
      orientationsQuery = orientationsQuery.eq("clubs.zone", filterZone);
      installationsQuery = installationsQuery.eq("clubs.zone", filterZone);
      dovsQuery = dovsQuery.eq("clubs.zone", filterZone);
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
    console.error("GET /api/admin/operations error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
