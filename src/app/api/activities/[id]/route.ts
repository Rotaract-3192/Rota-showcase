import { NextRequest, NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing activity ID" }, { status: 400 });
  }

  try {
    // Basic implementation using service role
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const bearerToken = await generateSupabaseJWT('service_role');

    const res = await fetch(`${supabaseUrl}/rest/v1/activities?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete activity error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
