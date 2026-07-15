import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to call Supabase REST API
async function supabaseFetch(path: string, options: RequestInit = {}) {
  const bearerToken = await generateSupabaseJWT('service_role');
  const headers = {
    'apikey': apiKey,
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errorText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter (clubs, projects, leaderboard)' }, { status: 400 });
    }

    if (type === 'clubs') {
      // 1. Fetch Clubs
      const clubs = await supabaseFetch('/clubs?select=id,name,charter_date,status&deleted_at=is.null');

      // 2. Fetch Profiles for member count aggregation
      const profiles = await supabaseFetch('/member_profiles?select=id,club_id&deleted_at=is.null');

      // 3. Fetch Activities for project count aggregation
      const activities = await supabaseFetch('/activities?select=id,club_id,status&deleted_at=is.null');

      // 4. Fetch Point Ledgers for points summation
      const ledgers = await supabaseFetch('/point_ledgers?select=club_id,points&deleted_at=is.null');

      // Aggregate
      const memberCounts: Record<string, number> = {};
      profiles.forEach((p: any) => {
        if (p.club_id) {
          memberCounts[p.club_id] = (memberCounts[p.club_id] || 0) + 1;
        }
      });

      const projectCounts: Record<string, number> = {};
      activities.forEach((a: any) => {
        if (a.club_id) {
          projectCounts[a.club_id] = (projectCounts[a.club_id] || 0) + 1;
        }
      });

      const pointsSum: Record<string, number> = {};
      ledgers.forEach((l: any) => {
        if (l.club_id) {
          pointsSum[l.club_id] = (pointsSum[l.club_id] || 0) + (l.points || 0);
        }
      });

      const result = clubs.map((c: any) => ({
        id: c.id,
        name: c.name,
        charterDate: c.charter_date || 'N/A',
        status: c.status || 'ACTIVE',
        memberCount: memberCounts[c.id] || 0,
        totalProjects: projectCounts[c.id] || 0,
        totalPoints: pointsSum[c.id] || 0
      }));

      return NextResponse.json(result);
    } 
    
    if (type === 'projects') {
      // Fetch all activities along with their club names
      const activities = await supabaseFetch('/activities?select=id,title,status,created_at,type,start_time,description,venue,clubs(name)&deleted_at=is.null');
      
      const result = (activities || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        type: a.type || 'N/A',
        status: a.status || 'DRAFT',
        clubName: a.clubs?.name || 'Independent Member',
        startDate: a.start_time || 'N/A',
        venue: a.venue || 'N/A',
        description: a.description || ''
      }));

      return NextResponse.json(result);
    }

    if (type === 'leaderboard') {
      // Sum points from ledger grouped by club, sort descending
      const ledgers = await supabaseFetch('/point_ledgers?select=club_id,points&deleted_at=is.null');
      const clubs = await supabaseFetch('/clubs?select=id,name&deleted_at=is.null');

      const pointsSum: Record<string, number> = {};
      ledgers.forEach((l: any) => {
        if (l.club_id) {
          pointsSum[l.club_id] = (pointsSum[l.club_id] || 0) + (l.points || 0);
        }
      });

      const result = clubs.map((c: any) => ({
        clubId: c.id,
        clubName: c.name,
        points: pointsSum[c.id] || 0
      })).sort((a: any, b: any) => b.points - a.points);

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (err: any) {
    console.error('GET /api/admin/reports error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
