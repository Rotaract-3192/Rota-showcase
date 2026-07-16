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
      .select("role")
      .eq("member_id", profileData.id)
      .is("deleted_at", null);

    if (rolesErr) {
      return NextResponse.json({ error: "Failed to verify user roles" }, { status: 500 });
    }

    const isAuthorized = (rolesData || []).some((r: any) =>
      ["District Admin", "District Core Team", "Super Admin", "Admin"].includes(r.role)
    );

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        id,
        action,
        created_at,
        table_name,
        new_data,
        member_profiles (
          first_name,
          last_name,
          email
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching audit logs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (err: any) {
    console.error("GET /api/admin/audit-logs error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
