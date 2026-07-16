import { NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const bearerToken = await generateSupabaseJWT('service_role');
    const res = await fetch(`${supabaseUrl}/rest/v1/clubs?select=id,name&deleted_at=is.null&order=name`, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Supabase clubs fetch failed:", res.status, errorText);
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Supabase clubs fetch exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
