import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const fileExt = file.name.split('.').pop();
    const filePath = `reports/${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // Upload to public_assets bucket
    const { error: uploadError } = await supabase.storage
      .from('public_assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('public_assets')
      .getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('POST /api/upload error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload file' }, { status: 500 });
  }
}
