'use client';

import type { User } from '@/lib/types';
import { mockSignIn, mockSignUp, mockSignOut, getMockUser } from '@/lib/mockAuth';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<User | null>;
  signUp: (email: string, name: string, password?: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = getMockUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (pathname === '/login' || pathname === '/register' || pathname === '/') {
          router.replace('/dashboard');
        }
      } else {
        if (pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
          router.replace('/login');
        }
      }
    }
  }, [user, loading, router, pathname]);

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    const signedInUser = await mockSignIn(email, password);
    setUser(signedInUser);
    setLoading(false);
    if (signedInUser) router.push('/dashboard');
    return signedInUser;
  };

  const signUp = async (email: string, name: string, password?: string) => {
    setLoading(true);
    const signedUpUser = await mockSignUp(email, name, password);
    setUser(signedUpUser);
    setLoading(false);
    if (signedUpUser) router.push('/dashboard');
    return signedUpUser;
  };

  const signOut = async () => {
    setLoading(true);
    await mockSignOut();
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  if (loading && (pathname !== '/login' && pathname !== '/register' && pathname !== '/')) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  // Allow access to login/register pages even if loading or no user
  if ((pathname === '/login' || pathname === '/register' || pathname === '/') && (loading || !user) ) {
    return (
      <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // If not loading and no user, and not on auth pages, AuthEffect will redirect.
  // If user exists, render children.
  if (!loading && user && (pathname.startsWith('/dashboard') || pathname === '/')) {
     return (
      <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  // Fallback for initial render or edge cases before redirection logic fully kicks in.
  // This primarily handles the dashboard routes when user is not yet loaded or null.
  if (!loading && !user && pathname.startsWith('/dashboard')) {
    return ( // Or a specific "access denied" or redirect component
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-lg text-foreground">Redirecting to login...</p>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
