import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';
import { currentUser } from '@clerk/nextjs/server';

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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // 1. Fetch member profile
    const profiles = await supabaseFetch(`/member_profiles?email=eq.${encodeURIComponent(email)}&select=id`);
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }
    const profileId = profiles[0].id;

    // 2. Fetch roles
    const roles = await supabaseFetch(`/member_roles?member_id=eq.${profileId}&select=role,zone&deleted_at=is.null`);
    if (!roles) {
      return NextResponse.json({ error: "Failed to verify user roles" }, { status: 500 });
    }

    const zrrRole = roles.find((r: any) => r.role === 'ZRR');
    const isSuperAdmin = roles.some((r: any) =>
      ['District Admin', 'District Core Team', 'Super Admin', 'Admin'].includes(r.role)
    );

    const isAuthorized = isSuperAdmin || !!zrrRole;
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const selectedZone = searchParams.get('zone');
    const userZone = zrrRole?.zone;
    const filterZone = (!isSuperAdmin && userZone) ? userZone : selectedZone;

    // 3. Fetch clubs
    let clubsPath = '/clubs?select=id,created_at&deleted_at=is.null';
    if (filterZone && filterZone !== 'All') {
      clubsPath += `&zone=eq.${encodeURIComponent(filterZone)}`;
    }
    const clubs = await supabaseFetch(clubsPath) || [];

    // 4. Fetch activities
    let activitiesPath = '/activities?select=id,status,created_at,start_time,volunteers,volunteer_hours,beneficiaries,activity_expenses,clubs!inner(zone)&deleted_at=is.null';
    if (filterZone && filterZone !== 'All') {
      activitiesPath += `&clubs.zone=eq.${encodeURIComponent(filterZone)}`;
    }
    const activities = await supabaseFetch(activitiesPath) || [];

    // Aggregation logic
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const isCurrentMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };
    
    const isLastMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    };

    let totalClubs = clubs.length;
    let newClubsThisMonth = 0;
    let newClubsLastMonth = 0;
    clubs.forEach((c: any) => {
      if (isCurrentMonth(c.created_at)) newClubsThisMonth++;
      if (isLastMonth(c.created_at)) newClubsLastMonth++;
    });

    let totalProjects = 0;
    let newProjectsThisMonth = 0;
    let newProjectsLastMonth = 0;

    let totalVolunteers = 0;
    let volunteersThisMonth = 0;
    let volunteersLastMonth = 0;

    let totalVolunteerHours = 0;
    let hoursThisMonth = 0;
    let hoursLastMonth = 0;

    let totalBeneficiaries = 0;
    let totalFundsRaised = 0;
    let pendingReviews = 0;

    // District Velocity - track last 6 months
    const velocityMap: Record<string, { projects: number, volunteers: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      velocityMap[monthName] = { projects: 0, volunteers: 0 };
    }

    activities.forEach((act: any) => {
      if (act.status !== 'PUBLISHED') {
        if (act.status === 'PENDING' || act.status === 'SUBMITTED' || act.status === 'DRAFT') {
            pendingReviews++;
        }
        return; // Don't count drafts in totals
      }

      totalProjects++;
      const vols = act.volunteers || 0;
      const hours = act.volunteer_hours || 0;
      
      totalVolunteers += vols;
      totalVolunteerHours += hours;
      totalBeneficiaries += (act.beneficiaries || 0);
      totalFundsRaised += (act.activity_expenses || 0);

      const dateStr = act.start_time || act.created_at;
      
      if (isCurrentMonth(dateStr)) {
        newProjectsThisMonth++;
        volunteersThisMonth += vols;
        hoursThisMonth += hours;
      }
      if (isLastMonth(dateStr)) {
        newProjectsLastMonth++;
        volunteersLastMonth += vols;
        hoursLastMonth += hours;
      }

      // Add to velocity map
      if (dateStr) {
        const actDate = new Date(dateStr);
        // Check if within last 6 months
        const diffTime = Math.abs(now.getTime() - actDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays <= 180) {
          const monthName = actDate.toLocaleString('default', { month: 'short' });
          if (velocityMap[monthName]) {
            velocityMap[monthName].projects++;
            velocityMap[monthName].volunteers += vols;
          }
        }
      }
    });

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? `+${current}` : '0';
      const change = ((current - previous) / previous) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    const trends = {
      clubs: calculateTrend(newClubsThisMonth, newClubsLastMonth),
      projects: calculateTrend(newProjectsThisMonth, newProjectsLastMonth),
      volunteers: calculateTrend(volunteersThisMonth, volunteersLastMonth),
      volunteerHours: calculateTrend(hoursThisMonth, hoursLastMonth),
    };

    const velocityData = Object.entries(velocityMap).map(([name, data]) => ({
      name,
      projects: data.projects,
      volunteers: data.volunteers
    }));

    return NextResponse.json({
      metrics: {
        totalClubs,
        totalProjects,
        totalVolunteers,
        totalVolunteerHours,
        totalBeneficiaries,
        totalFundsRaised,
        pendingReviews
      },
      trends,
      velocityData
    });
  } catch (err: any) {
    console.error('GET /api/admin/dashboard/stats error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
