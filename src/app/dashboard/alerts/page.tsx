'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard?tab=alerts');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-foreground">Redirecting to alert feed...</p>
    </div>
  );
}
