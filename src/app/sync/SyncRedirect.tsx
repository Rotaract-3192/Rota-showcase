'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncRedirect({
  targetUrl,
  message = "Syncing your profile...",
}: {
  targetUrl: string;
  message?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const timer = window.setTimeout(() => {
      window.location.replace(basePath + targetUrl);
    }, 80);

    const failSafe = window.setTimeout(() => {
      router.replace(targetUrl);
    }, 8000);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(failSafe);
    };
  }, [targetUrl, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-navy-deep">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-electric-blue border-t-transparent" />
        <p className="text-slate-400 font-body text-sm">{message}</p>
      </div>
    </div>
  );
}
