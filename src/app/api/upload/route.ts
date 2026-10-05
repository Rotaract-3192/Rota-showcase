import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf']);
const PDF_ALIAS_MIME = new Set(['', 'application/pdf', 'application/x-pdf', 'application/octet-stream']);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const fileExt = (file.name.split('.').pop() || '').toLowerCase();
    // Some browsers (Windows/Android) report PDFs as application/x-pdf or application/octet-stream.
    const isPdf = fileExt === 'pdf' && PDF_ALIAS_MIME.has(file.type);
    const mimeOk =
      ALLOWED_MIME.has(file.type) || isPdf || (file.type === '' && ALLOWED_EXT.has(fileExt));
    if (!mimeOk || !ALLOWED_EXT.has(fileExt)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, GIF, or PDF files are allowed' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const filePath = `reports/${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('public_assets')
      .upload(filePath, file, { contentType: fileExt === 'pdf' ? 'application/pdf' : file.type || undefined });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      if (/mime type|not supported|exceeded|too large/i.test(uploadError.message || '')) {
        return NextResponse.json(
          { error: `Storage rejected the file: ${uploadError.message}` },
          { status: 400 }
        );
      }
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
