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
    const supabase = await createServerSupabaseClient();

    // 1. Get current user's profile and roles
    const { data: profile, error: profileErr } = await supabase
      .from("member_profiles")
      .select("id, club_id")
      .eq("email", email)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    if (!profile.club_id) {
      return NextResponse.json({ error: "Not associated with a club" }, { status: 403 });
    }

    // 2. Fetch all members of this club
    const { data: members, error: membersErr } = await supabase
      .from("member_profiles")
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        blood_group,
        created_at,
        member_roles ( id, role )
      `)
      .eq("club_id", profile.club_id)
      .is("deleted_at", null)
      .order("first_name", { ascending: true });

    if (membersErr) {
      console.error("Fetch members error:", membersErr);
      return NextResponse.json({ error: membersErr.message }, { status: 500 });
    }

    return NextResponse.json({ members });
  } catch (err: any) {
    console.error("GET /api/portal/members error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const supabase = await createServerSupabaseClient();

    // 1. Verify user is President, Vice President, or Secretary
    const { data: profile, error: profileErr } = await supabase
      .from("member_profiles")
      .select("id, club_id")
      .eq("email", email)
      .single();

    if (profileErr || !profile || !profile.club_id) {
      return NextResponse.json({ error: "Club profile not found" }, { status: 403 });
    }

    const { data: roles, error: rolesErr } = await supabase
      .from("member_roles")
      .select("role")
      .eq("member_id", profile.id)
      .is("deleted_at", null);

    if (rolesErr) {
      return NextResponse.json({ error: "Failed to verify roles" }, { status: 500 });
    }

    const hasPermission = (roles || []).some((r: any) =>
      ["President", "Vice President", "Secretary", "Super Admin", "Admin", "District Admin"].includes(r.role)
    );

    if (!hasPermission) {
      return NextResponse.json({ error: "Only Club Presidents, Vice Presidents, or Secretaries can add members" }, { status: 403 });
    }

    // 2. Parse payload
    const { firstName, lastName, memberEmail, phone, bloodGroup, role } = await req.json();

    if (!firstName || !lastName || !memberEmail || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Create placeholder auth_id
    const placeholderAuthId = `pending_${crypto.randomUUID()}`;

    // 4. Insert into member_profiles
    const { data: newMember, error: insertErr } = await supabase
      .from("member_profiles")
      .insert({
        auth_id: placeholderAuthId,
        club_id: profile.club_id,
        first_name: firstName,
        last_name: lastName,
        email: memberEmail,
        phone: phone || null,
        blood_group: bloodGroup || null,
      })
      .select()
      .single();

    if (insertErr) {
      // If error is unique constraint on email, handle it
      if (insertErr.code === '23505') {
        return NextResponse.json({ error: "A member with this email already exists" }, { status: 400 });
      }
      console.error("Insert member error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // 5. Insert into member_roles
    const { error: roleErr } = await supabase
      .from("member_roles")
      .insert({
        member_id: newMember.id,
        club_id: profile.club_id,
        role: role,
      });

    if (roleErr) {
      console.error("Insert role error:", roleErr);
      // Try to clean up
      await supabase.from("member_profiles").delete().eq("id", newMember.id);
      return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
    }

    // 6. Log Audit
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      table_name: "member_profiles",
      record_id: newMember.id,
      action: "CREATE_MEMBER",
      new_data: { email: memberEmail, role },
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (err: any) {
    console.error("POST /api/portal/members error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const email = user.emailAddresses[0]?.emailAddress;
    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");
    if (!memberId) return NextResponse.json({ error: "Missing member ID" }, { status: 400 });

    const { data: profile, error: profileErr } = await supabase
      .from("member_profiles")
      .select("id, club_id")
      .eq("email", email)
      .single();

    if (profileErr || !profile || !profile.club_id) return NextResponse.json({ error: "Club profile not found" }, { status: 403 });

    const { data: roles } = await supabase
      .from("member_roles")
      .select("role")
      .eq("member_id", profile.id)
      .is("deleted_at", null);

    const hasPermission = (roles || []).some((r: any) =>
      ["President", "Vice President", "Secretary", "Super Admin", "Admin", "District Admin"].includes(r.role)
    );

    if (!hasPermission) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Ensure member belongs to same club
    const { data: targetMember } = await supabase
      .from("member_profiles")
      .select("club_id, email")
      .eq("id", memberId)
      .single();

    if (!targetMember || targetMember.club_id !== profile.club_id) {
      return NextResponse.json({ error: "Member not found in your club" }, { status: 404 });
    }

    // Soft delete member
    const { error: delErr } = await supabase
      .from("member_profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", memberId);

    if (delErr) throw delErr;

    // Log Audit
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      table_name: "member_profiles",
      record_id: memberId,
      action: "DELETE_MEMBER",
      old_data: { email: targetMember.email },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/portal/members error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
