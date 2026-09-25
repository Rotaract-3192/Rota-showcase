import { NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';

/**
 * One-time Super Admin provisioning. Disabled unless BOOTSTRAP_SECRET is set
 * and the request sends matching header `x-bootstrap-secret`.
 */
export async function POST(req: Request) {
  const expected = process.env.BOOTSTRAP_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: 'Bootstrap is disabled. Set BOOTSTRAP_SECRET to enable.' },
      { status: 403 }
    );
  }

  const provided = req.headers.get('x-bootstrap-secret');
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { email, firstName, lastName, authId } = await req.json();
    if (!email || !firstName || !authId) {
      return NextResponse.json({ error: 'Missing email, firstName, or authId' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const bearerToken = await generateSupabaseJWT('service_role');
    
    const headers = {
      'apikey': apiKey,
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    const profileRes = await fetch(`${supabaseUrl}/rest/v1/member_profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName || '',
        email: email,
        auth_id: authId,
      })
    });

    if (!profileRes.ok) {
      const err = await profileRes.text();
      return NextResponse.json({ error: 'Failed to create profile', details: err }, { status: 500 });
    }

    const profiles = await profileRes.json();
    const memberId = profiles[0].id;

    const roleRes = await fetch(`${supabaseUrl}/rest/v1/member_roles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        member_id: memberId,
        role: 'Super Admin'
      })
    });

    if (!roleRes.ok) {
      const err = await roleRes.text();
      return NextResponse.json({ error: 'Failed to assign role', details: err }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Super Admin provisioned!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
