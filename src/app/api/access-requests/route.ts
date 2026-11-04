import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const body = await req.json();
    const { club_id, requested_role, full_name, email, phone, zone } = body;

    if (!club_id || !requested_role || !full_name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const bearerToken = await generateSupabaseJWT('service_role');
    const headers = {
      'apikey': apiKey,
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    };

    // Block requests for emails that already have a portal profile.
    const existingProfileRes = await fetch(
      `${supabaseUrl}/rest/v1/member_profiles?email=ilike.${encodeURIComponent(normalizedEmail)}&deleted_at=is.null&select=id,first_name,last_name&limit=1`,
      { headers }
    );
    if (existingProfileRes.ok) {
      const existing = await existingProfileRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          {
            error:
              'This email already has portal access. Sign in with the same email (use Sign in securely). If login fails, ask district admin to use Users → Resend invite / Relink — do not submit another access request.',
          },
          { status: 409 }
        );
      }
    }

    const pendingRes = await fetch(
      `${supabaseUrl}/rest/v1/access_requests?email=ilike.${encodeURIComponent(normalizedEmail)}&status=eq.PENDING&deleted_at=is.null&select=id&limit=1`,
      { headers }
    );
    if (pendingRes.ok) {
      const pending = await pendingRes.json();
      if (Array.isArray(pending) && pending.length > 0) {
        return NextResponse.json(
          {
            error:
              'An access request for this email is already pending. Please wait for district admin to review it.',
          },
          { status: 409 }
        );
      }
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/access_requests`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          club_id,
          requested_role,
          full_name,
          email: normalizedEmail,
          phone: phone || null,
          status: 'PENDING',
          zone: zone || null,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Supabase access_requests insert failed:', res.status, text);
      return NextResponse.json({ error: 'Failed to submit request', details: text }, { status: 500 });
    }

    // Try to notify admins without blocking the main request
    try {
      const { notifyRoleAction } = await import('@/actions/notification.actions');
      await Promise.all([
        notifyRoleAction('SUPER_ADMIN', 'New Access Request', `${full_name} has requested ${requested_role} access.`, '/admin/access-requests'),
        notifyRoleAction('DISTRICT_ADMIN', 'New Access Request', `${full_name} has requested ${requested_role} access.`, '/admin/access-requests')
      ]);
    } catch (notifErr) {
      console.error('Failed to send admin notification for access request', notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/access-requests error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
