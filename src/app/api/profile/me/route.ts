import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { authService } from '@/services/auth.service';
import { linkAndLoadMemberProfile } from '@/lib/member-sync';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let data = await authService.getFullUserProfile(userId);

    if (!data) {
      const user = await currentUser();
      const emails = (user?.emailAddresses || []).map((e) => e.emailAddress).filter(Boolean);
      const linked = await linkAndLoadMemberProfile(userId, emails);
      if (linked) {
        data = await authService.getFullUserProfile(userId);
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No district profile is linked to this account. Ask an admin to provision access.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('GET /api/profile/me error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
