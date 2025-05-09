
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        // If you want to re-introduce a login page, redirect here
        // For now, if there's no user and auth is not fully set up,
        // redirecting to dashboard might show an empty state or prompt for profile.
        // Let's keep redirecting to dashboard as per previous behavior if no explicit login page exists yet.
        // If a login page is created at /login, change this to:
        // router.replace('/login'); 
        router.replace('/dashboard'); // Or handle case where user is null differently
      }
    }
  }, [router, user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
        <p className="mt-4">Loading application...</p>
      </div>
    );
  }
  
  // This content will be briefly shown if redirection is slow or if useEffect logic changes.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Skeleton className="h-12 w-12 rounded-full mb-4" />
      <Skeleton className="h-4 w-48 mb-2" />
      <Skeleton className="h-4 w-32" />
      <p className="mt-4">Initializing...</p>
    </div>
  );
}
