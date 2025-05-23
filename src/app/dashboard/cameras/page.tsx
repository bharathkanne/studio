'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is a conceptual route. Actual content is on /dashboard with tab selection.
// This component will redirect to /dashboard and try to activate the 'cameras' tab.
// For robust tab handling from URL, a more complex setup (e.g. query params) would be needed.
// For simplicity, we'll just redirect. The user can then click the tab.
// Or, DashboardClientPage could be modified to accept a default tab prop.

export default function CamerasPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard?tab=cameras'); // Or just /dashboard and let user click
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-foreground">Redirecting to camera management...</p>
    </div>
  );
}
