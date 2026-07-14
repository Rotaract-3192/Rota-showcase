'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncRedirect({ targetUrl }: { targetUrl: string }) {
  const router = useRouter();

  useEffect(() => {
    // We use a hard window location replace to ensure reliable navigation and bypass any Next.js router state issues
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    window.location.replace(basePath + targetUrl);
  }, [targetUrl]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-navy-deep">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-electric-blue border-t-transparent" />
        <p className="text-slate-400 font-body animate-pulse text-sm">Syncing your profile...</p>
      </div>
    </div>
  );
}
