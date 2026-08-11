import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';
import { currentUser } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    const userId = user.id;

    // Fetch unread notifications for this user
    const notifications = await supabaseFetch(
      `/notifications?auth_id=eq.${encodeURIComponent(userId)}&is_read=eq.false&order=created_at.desc`
    );

    return NextResponse.json(notifications || []);
  } catch (err: any) {
    console.error('GET /api/notifications error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await req.json();
    const userId = user.id;

    if (!notificationId) {
       return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    if (notificationId === 'all') {
        // Mark all as read
        await supabaseFetch(`/notifications?auth_id=eq.${encodeURIComponent(userId)}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_read: true })
        });
    } else {
        // Mark specific as read
        await supabaseFetch(`/notifications?id=eq.${encodeURIComponent(notificationId)}&auth_id=eq.${encodeURIComponent(userId)}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_read: true })
        });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PATCH /api/notifications error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
