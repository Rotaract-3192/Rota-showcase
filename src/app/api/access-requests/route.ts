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

    const bearerToken = await generateSupabaseJWT('service_role');

    const res = await fetch(
      `${supabaseUrl}/rest/v1/access_requests`,
      {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          club_id,
          requested_role,
          full_name,
          email,
          phone: phone || null,
          zone,
          status: 'PENDING',
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Supabase access_requests insert failed:', res.status, text);
      return NextResponse.json({ error: 'Failed to submit request', details: text }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/access-requests error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
