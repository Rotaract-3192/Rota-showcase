import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { sendEmailBroadcast } from "@/lib/mail";

export async function POST(req: NextRequest) {
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
      .eq("member_id", profileData.id);

    if (rolesErr || !rolesData) {
      return NextResponse.json({ error: "Failed to verify user roles" }, { status: 403 });
    }

    const isAuthorized = rolesData.some((r: any) =>
      ["District Admin", "District Core Team", "Super Admin", "Admin"].includes(r.role)
    );

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    // Parse Body
    const { title, content, sender, targetAudience, sendEmail } = await req.json();
    if (!title || !content || !sender || !targetAudience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert announcement into Supabase
    const { data: announcement, error: insertErr } = await supabase
      .from("announcements")
      .insert({
        title,
        content,
        sender,
        target_audience: targetAudience,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert announcement error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // 2. Fetch recipients based on targetAudience
    let recipientsQuery = supabase.from("member_profiles").select("email");

    if (targetAudience === "Presidents Only" || targetAudience === "Secretaries Only") {
      const targetRole = targetAudience === "Presidents Only" ? "President" : "Secretary";
      
      const { data: roleMembers, error: roleMembersErr } = await supabase
        .from("member_roles")
        .select("member_id")
        .eq("role", targetRole)
        .is("deleted_at", null);

      if (roleMembersErr) {
        console.error("Fetch role members error:", roleMembersErr);
      } else {
        const memberIds = roleMembers.map((rm) => rm.member_id);
        recipientsQuery = recipientsQuery.in("id", memberIds);
      }
    }

    const { data: recipients, error: recipientsErr } = await recipientsQuery.is("deleted_at", null);
    if (recipientsErr) {
      console.error("Fetch recipients error:", recipientsErr);
    }

    const emails = (recipients || []).map((r) => r.email).filter(Boolean);

    // 3. Send Email Broadcast (async) if requested
    if (sendEmail && emails.length > 0) {
      // Strip out [Development] from subject if present (in case of legacy/dev tests)
      const cleanSubject = title.replace(/\[Development\]\s*/gi, '').trim();

      sendEmailBroadcast({
        to: emails,
        subject: cleanSubject,
        content: content,
        senderName: sender,
      }).catch((err) => {
        console.error("Failed to send broadcast emails:", err);
      });
    }

    return NextResponse.json({ success: true, announcement });
  } catch (err: any) {
    console.error("POST /api/admin/announcements error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    // Verify Admin Role
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
      .eq("member_id", profileData.id);

    if (rolesErr || !rolesData) {
      return NextResponse.json({ error: "Failed to verify user roles" }, { status: 403 });
    }

    const isAuthorized = rolesData.some((r: any) =>
      ["District Admin", "District Core Team", "Super Admin", "Admin"].includes(r.role)
    );

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing announcement id" }, { status: 400 });
    }

    const { error: deleteErr } = await supabase
      .from("announcements")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
