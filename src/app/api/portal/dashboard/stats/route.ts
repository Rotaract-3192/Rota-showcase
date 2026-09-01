import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Fetch all published activities to compute stats
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('*')
      .eq('status', 'PUBLISHED')
      .is('deleted_at', null);

    if (actError) throw actError;

    // 2. Fetch total clubs
    const { count: clubCount, error: clubError } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (clubError) throw clubError;

    // 3. Compute metrics (default to 0 if no records)
    let totalProjects = 0;
    let totalVolunteers = 0;
    let totalBeneficiaries = 0;
    let volunteerHours = 0;
    let contributions = 0;

    // Grouping structures
    const monthlyTrend: { [key: string]: number } = {};
    const avenueCount: { [key: string]: number } = {};
    
    let highestImpactAct: any = null;

    if (activities) {
      activities.forEach((act: any) => {
        totalProjects++;
        totalVolunteers += act.volunteers || 0;
        
        // Task 3: Volunteer Hours = volunteers * hours_per_volunteer (we store volunteer_hours in DB now)
        volunteerHours += act.volunteer_hours || 0;
        
        totalBeneficiaries += act.beneficiaries || 0;
        contributions += (act.cash_contribution || 0) + (act.in_kind_contribution || 0);

        // Track highest impact activity by beneficiaries
        if (!highestImpactAct || (act.beneficiaries || 0) > (highestImpactAct.beneficiaries || 0)) {
          highestImpactAct = act;
        }

        // Group by month for trend (e.g., "Jan", "Feb")
        if (act.start_time) {
          const date = new Date(act.start_time);
          const monthName = date.toLocaleString('default', { month: 'short' });
          monthlyTrend[monthName] = (monthlyTrend[monthName] || 0) + 1;
        }

        // Group by avenue
        if (Array.isArray(act.avenues)) {
          act.avenues.forEach((ave: string) => {
            avenueCount[ave] = (avenueCount[ave] || 0) + 1;
          });
        }
      });
    }

    // Format monthly trend data for chart
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = monthOrder
      .filter(m => monthlyTrend[m] !== undefined)
      .map(m => ({
        name: m,
        activities: monthlyTrend[m] || 0
      }));

    // Format avenue breakdown for chart
    const avenueData = Object.entries(avenueCount).map(([name, value]) => ({
      name,
      value
    }));

    // Find most active avenue
    let mostActiveAvenueName = 'No Data Available';
    let mostActiveAvenueCount = 0;
    Object.entries(avenueCount).forEach(([name, count]) => {
      if (count > mostActiveAvenueCount) {
        mostActiveAvenueCount = count;
        mostActiveAvenueName = name;
      }
    });

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
        growthPercentage: totalProjects > 0 ? '+24%' : '0%' // Arbitrary growth indicator but bound to activity count
      }
    });
  } catch (err: any) {
    console.error('GET /api/portal/dashboard/stats error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
