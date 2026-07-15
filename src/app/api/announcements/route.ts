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

    // Verify User Role in Database
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
      .select("role")
      .eq("member_id", profileData.id)
      .is("deleted_at", null);

    if (rolesErr) {
      return NextResponse.json({ error: "Failed to verify user roles" }, { status: 500 });
    }

    const userRoles = (rolesData || []).map((r: any) => r.role);
    const isAdmin = userRoles.some((r: string) => ["District Admin", "District Core Team", "Super Admin", "Admin"].includes(r));
    const isPresident = userRoles.includes("President");
    const isSecretary = userRoles.includes("Secretary");

    // Build the query
    let query = supabase
      .from("announcements")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // Apply filtering based on roles if not admin
    if (!isAdmin) {
      const allowedAudiences = ["All Clubs"];
      if (isPresident) allowedAudiences.push("Presidents Only");
      if (isSecretary) allowedAudiences.push("Secretaries Only");
      
      query = query.in("target_audience", allowedAudiences);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching announcements:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ announcements: data || [] });
  } catch (err: any) {
    console.error("GET /api/announcements error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
