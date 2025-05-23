'use client';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { ShieldCheck, LayoutDashboard, Video, AlertTriangle, Settings, LogOut, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/cameras', label: 'Cameras', icon: Video },
  { href: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/dashboard/users', label: 'User Management', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function DashboardSidebarContent() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
          <ShieldCheck className={`h-8 w-8 text-primary ${state === "collapsed" && !isMobile ? "mx-auto" : ""}`} />
          { (state === "expanded" || isMobile) && <span className="text-xl font-semibold text-sidebar-foreground">SafetyStream</span> }
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, className: "bg-card text-card-foreground border-border" }}
                  onClick={handleLinkClick}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
        { (state === "expanded" || isMobile) && user && (
          <div className="flex items-center gap-2 mb-2">
            <img src={`https://placehold.co/40x40.png?text=${user.name?.[0]}`} alt={user.name || 'User'} className="h-8 w-8 rounded-full" data-ai-hint="profile avatar"/>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
            </div>
          </div>
        )}
        <Button variant="ghost" className={`w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent ${state === "collapsed" && !isMobile ? "!p-2 !size-8 mx-auto" : "" }`} onClick={signOut}>
          <LogOut />
          { (state === "expanded" || isMobile) && <span>Logout</span> }
        </Button>
      </SidebarFooter>
    </>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // This effect handles redirection if user is not authenticated.
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // While loading or if no user, display loading or null to prevent flashing content.
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
         <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  // User is authenticated, render the dashboard layout.
  return (
    <SidebarProvider defaultOpen={true} >
      <AppHeaderWrappedWithSidebarControls />
      <div className="flex">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <DashboardSidebarContent />
        </Sidebar>
        <SidebarInset>
          <main className="flex-1 p-4 sm:p-6 md:p-8 bg-background overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// Helper component to access sidebar context for AppHeader
function AppHeaderWrappedWithSidebarControls() {
  const sidebarControls = useSidebar();
  return <AppHeader sidebarControls={sidebarControls} />;
}

