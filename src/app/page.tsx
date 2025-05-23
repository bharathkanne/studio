'use client';
import LoginPage from './login/page';

export default function HomePage() {
  // The redirection logic is now handled by AuthContext/AuthProvider
  // This page effectively becomes the login page or gateway
  return <LoginPage />;
}
