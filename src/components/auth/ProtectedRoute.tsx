'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/providers/auth-provider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`/login?redirectedFrom=${pathname}`);
    }
  }, [isLoading, session, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-deep font-body text-electric-blue">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-xs uppercase font-bold tracking-widest">Loading Session...</span>
        </div>
      </div>
    );
  }

  if (!session) return null; // Will redirect in useEffect

  return <>{children}</>;
}
