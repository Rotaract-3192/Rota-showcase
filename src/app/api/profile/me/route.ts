import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { authService } from '@/services/auth.service';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let data = await authService.getFullUserProfile(userId);

    if (!data) {
      console.log("Profile not found by auth_id, checking email...");
      const user = await (await import('@clerk/nextjs/server')).currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress || '';

      const supabase = await (await import('@/lib/supabase-server')).createServerSupabaseClient();
      
      const { data: existingProfile } = await supabase
        .from('member_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        console.log("Found existing profile by email, linking auth_id...");
        await supabase
          .from('member_profiles')
          .update({ auth_id: userId })
          .eq('id', existingProfile.id);
      } else {
        console.log("No profile found, creating new profile...");
        const nameParts = (user?.fullName || email.split('@')[0]).split(' ');
        await supabase.from('member_profiles').insert({
          auth_id: userId,
          first_name: nameParts[0] || 'Unknown',
          last_name: nameParts.slice(1).join(' ') || 'User',
          email: email
        });
      }

      data = await authService.getFullUserProfile(userId);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('GET /api/profile/me error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
