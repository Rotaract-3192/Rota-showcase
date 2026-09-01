import { NextResponse } from "next/server";
import { generateSupabaseJWT } from "@/lib/jwt";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const bearerToken = await generateSupabaseJWT('service_role');
    
    // Fetch clubs
    const res = await fetch(`${supabaseUrl}/rest/v1/clubs?select=id,name,logo_url,charter_date,member_count,total_projects,total_points,zone,description,email,club_type,club_email,partner_rotary_club&deleted_at=is.null&order=name`, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        'Range': '0-999',
        'Prefer': 'count=exact',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Supabase clubs fetch failed:", res.status, errorText);
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const clubsData = await res.json();
    
    // Fetch leaders
    const leadersRes = await fetch(`${supabaseUrl}/rest/v1/club_leaders_directory?select=club_name,name,designation,email,phone`, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    let leadersData = [];
    if (leadersRes.ok) {
      leadersData = await leadersRes.json();
    }
    
    // Merge leaders into clubs
    const clubsWithLeaders = clubsData.map((club: any) => {
      const clubLeaders = leadersData.filter((l: any) => l.club_name === club.name);
      return {
        ...club,
        leaders: clubLeaders
      };
    });

    return NextResponse.json(clubsWithLeaders);
  } catch (error: any) {
    console.error("Supabase clubs fetch exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
