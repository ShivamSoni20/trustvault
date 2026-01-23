import type { Metadata } from 'next';
import { Providers } from './providers';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/ui/Toast';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TrustWork - Decentralized Freelance Marketplace',
  description: 'The trustless bridge between world-class freelancers and visionary clients, powered by Bitcoin and Stacks.',
  keywords: ['marketplace', 'escrow', 'stacks', 'bitcoin', 'freelance', 'payments', 'blockchain', 'trustwork'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#0a0a0c] text-slate-200 selection:bg-emerald-500/30">
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
