import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';
import { currentUser } from '@clerk/nextjs/server';
import { clubIdsInZone, jsonAuthzError, resolveAdminZoneFilter } from '@/lib/portal-auth';

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
    const { filterZone } = await resolveAdminZoneFilter(searchParams.get('zone'));
    const clubIds = filterZone ? await clubIdsInZone(filterZone) : null;

    let path = '/activities?select=id,title,status,created_at,type,start_time,description,venue,cover_image,supporting_image_1,supporting_image_2,beneficiaries,volunteer_hours,activity_expenses,volunteers,avenues,focus_areas,clubs!inner(name,zone)&deleted_at=is.null';
    if (clubIds) {
      if (clubIds.length === 0) return NextResponse.json([]);
      path += `&club_id=in.(${clubIds.join(',')})`;
    }

    const data = await supabaseFetch(path);
    return NextResponse.json(data);
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error('GET /api/admin/activities error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const email = user.emailAddresses[0]?.emailAddress;
    
    // Fetch the admin's profile ID to record as actor_id
    const adminProfiles = await supabaseFetch(`/member_profiles?email=eq.${encodeURIComponent(email || '')}&select=id`);
    const adminProfileId = (adminProfiles && adminProfiles.length > 0) ? adminProfiles[0].id : null;

    const { activityId, action } = await req.json();

    if (!activityId || !action) {
      return NextResponse.json({ error: 'Missing activityId or action' }, { status: 400 });
    }

    const newStatus = action === 'Approved' ? 'PUBLISHED' : 'CANCELLED';

    // Update status in activities table
    await supabaseFetch(`/activities?id=eq.${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    // Log action in audit_logs
    await supabaseFetch('/audit_logs', {
      method: 'POST',
      body: JSON.stringify({
        actor_id: adminProfileId,
        action: action === 'Approved' ? 'UPDATE' : 'REJECT_ACTIVITY', // We can use UPDATE or APPROVE_ACTIVITY
        table_name: 'activities',
        record_id: activityId,
        new_data: JSON.stringify({ status: newStatus })
      })
    });

    // Notify the club officers
    const activity = await supabaseFetch(`/activities?id=eq.${activityId}&select=club_id,title`);
    if (activity && activity.length > 0 && activity[0].club_id) {
      const clubId = activity[0].club_id;
      const title = activity[0].title;
      // Fetch leaders (President, Secretary) of this club
      const leaders = await supabaseFetch(`/member_roles?club_id=eq.${clubId}&role=in.("President","Secretary")&select=member_profiles!inner(auth_id)&deleted_at=is.null`);
      
      if (leaders && leaders.length > 0) {
        for (const leader of leaders) {
          if (leader.member_profiles?.auth_id) {
            await supabaseFetch('/notifications', {
              method: 'POST',
              body: JSON.stringify({
                auth_id: leader.member_profiles.auth_id,
                title: action === 'Approved' ? 'Activity Approved' : 'Activity Rejected',
                message: `Your activity "${title}" has been ${action.toLowerCase()}.`,
                link: '/admin/activities',
                is_read: false
              })
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST /api/admin/activities error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
