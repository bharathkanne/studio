import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import { AppProviders } from './providers';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'SafetyStream - AI CCTV Monitoring',
  description: 'AI-Powered CCTV Monitoring Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
