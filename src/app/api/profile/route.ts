import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { first_name, last_name, phone, blood_group } = body;

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('member_profiles')
      .update({
        first_name,
        last_name,
        phone,
        blood_group
      })
      .eq('auth_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PATCH /api/profile error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
