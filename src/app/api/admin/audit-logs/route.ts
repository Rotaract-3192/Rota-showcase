import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { jsonAuthzError, requireAdminActor } from "@/lib/portal-auth";

export async function GET(_req: NextRequest) {
  try {
    await requireAdminActor();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        id,
        action,
        created_at,
        table_name,
        new_data,
        actor_id,
        member_profiles:actor_id (
          first_name,
          last_name,
          email
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      const fallback = await supabase
        .from("audit_logs")
        .select("id, action, created_at, table_name, new_data, actor_id")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (fallback.error) {
        console.error("Error fetching audit logs:", fallback.error);
        return NextResponse.json({ error: fallback.error.message }, { status: 500 });
      }

      const actorIds = [...new Set((fallback.data || []).map((row) => row.actor_id).filter(Boolean))] as string[];
      let profilesById: Record<string, { first_name: string | null; last_name: string | null; email: string | null }> = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("member_profiles")
          .select("id, first_name, last_name, email")
          .in("id", actorIds);
        for (const profile of profiles || []) {
          profilesById[profile.id] = profile;
        }
      }

      const logs = (fallback.data || []).map((row) => ({
        ...row,
        member_profiles: row.actor_id ? profilesById[row.actor_id] || null : null,
      }));
      return NextResponse.json({ logs });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("GET /api/admin/audit-logs error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
