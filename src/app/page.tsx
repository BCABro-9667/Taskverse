
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Skeleton className="h-12 w-12 rounded-full mb-4" />
      <Skeleton className="h-4 w-48 mb-2" />
      <Skeleton className="h-4 w-32" />
      <p className="mt-4">Redirecting to dashboard...</p>
    </div>
  );
}
