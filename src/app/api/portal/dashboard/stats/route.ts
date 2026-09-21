import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getPortalActor, scopedClubIds } from '@/lib/portal-auth';
import { jsonAuthzError } from '@/lib/portal-auth';
import { canonicalizeZone, displayZone } from '@/lib/zones';

export async function GET() {
  try {
    const actor = await getPortalActor();
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const clubIds = await scopedClubIds(actor);

    // Club officers should see everything they submitted (drafts awaiting
    // approval). District-wide / ZRR portal views stay published-only.
    const clubScoped = Array.isArray(clubIds);
    let activitiesQuery = supabase
      .from('activities')
      .select('*, clubs(name, zone)')
      .is('deleted_at', null);

    if (clubScoped) {
      activitiesQuery = activitiesQuery.in('status', ['PUBLISHED', 'DRAFT']);
    } else {
      activitiesQuery = activitiesQuery.eq('status', 'PUBLISHED');
    }

    let clubsQuery = supabase
      .from('clubs')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (clubIds) {
      if (clubIds.length === 0) {
        return NextResponse.json({
          stats: {
            totalProjects: 0,
            totalVolunteers: 0,
            totalBeneficiaries: 0,
            volunteerHours: 0,
            contributions: 0,
            activeClubs: 0,
          },
          trendData: [],
          avenueData: [],
          insights: {
            mostActiveAvenueName: 'No Data Available',
            mostActiveAvenueCount: 0,
            highestImpactProjectName: 'No Data Available',
            highestImpactProjectBeneficiaries: 0,
            growthPercentage: '0%',
          },
          context: {
            clubName: null,
            zone: actor.zone,
          },
        });
      }
      activitiesQuery = activitiesQuery.in('club_id', clubIds);
      clubsQuery = clubsQuery.in('id', clubIds);
    }

    const { data: activities, error: actError } = await activitiesQuery;
    if (actError) throw actError;

    const { count: clubCount, error: clubError } = await clubsQuery;
    if (clubError) throw clubError;

    let totalProjects = 0;
    let totalVolunteers = 0;
    let totalBeneficiaries = 0;
    let volunteerHours = 0;
    let contributions = 0;

    const monthlyTrend: { [key: string]: number } = {};
    const avenueCount: { [key: string]: number } = {};
    
    let highestImpactAct: any = null;

    if (activities) {
      activities.forEach((act: any) => {
        totalProjects++;
        totalVolunteers += act.volunteers || 0;
        volunteerHours += act.volunteer_hours || 0;
        totalBeneficiaries += act.beneficiaries || 0;
        const cash = Number(act.cash_contribution) || 0;
        const inKind = Number(act.in_kind_contribution) || 0;
        const expenses = Number(act.activity_expenses) || 0;
        contributions += cash + inKind > 0 ? cash + inKind : expenses;

        if (!highestImpactAct || (act.beneficiaries || 0) > (highestImpactAct.beneficiaries || 0)) {
          highestImpactAct = act;
        }

        if (act.start_time) {
          const date = new Date(act.start_time);
          const monthName = date.toLocaleString('default', { month: 'short' });
          monthlyTrend[monthName] = (monthlyTrend[monthName] || 0) + 1;
        }

        if (Array.isArray(act.avenues)) {
          act.avenues.forEach((ave: string) => {
            avenueCount[ave] = (avenueCount[ave] || 0) + 1;
          });
        }
      });
    }

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = monthOrder
      .filter(m => monthlyTrend[m] !== undefined)
      .map(m => ({
        name: m,
        activities: monthlyTrend[m] || 0
      }));

    const avenueData = Object.entries(avenueCount).map(([name, value]) => ({
      name,
      value
    }));

    let mostActiveAvenueName = 'No Data Available';
    let mostActiveAvenueCount = 0;
    Object.entries(avenueCount).forEach(([name, count]) => {
      if (count > mostActiveAvenueCount) {
        mostActiveAvenueCount = count;
        mostActiveAvenueName = name;
      }
    });

    let clubName: string | null = null;
    let zone: string | null = actor.zone;
    if (actor.clubId) {
      const { data: club } = await supabase
        .from('clubs')
        .select('name, zone')
        .eq('id', actor.clubId)
        .maybeSingle();
      clubName = club?.name || null;
      zone = canonicalizeZone(club?.zone) || zone;
    }

    return NextResponse.json({
      stats: {
        totalProjects,
        totalVolunteers,
        totalBeneficiaries,
        volunteerHours,
        contributions,
        activeClubs: clubCount || 0
      },
      trendData,
      avenueData,
      insights: {
        mostActiveAvenueName,
        mostActiveAvenueCount,
        highestImpactProjectName: highestImpactAct ? highestImpactAct.title : 'No Data Available',
        highestImpactProjectBeneficiaries: highestImpactAct ? (highestImpactAct.beneficiaries || 0) : 0,
        growthPercentage: totalProjects > 0 ? '+24%' : '0%'
      },
      context: {
        clubName,
        zone: zone ? displayZone(zone) : null,
      }
    });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error('GET /api/portal/dashboard/stats error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
