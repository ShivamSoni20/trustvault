import type { Metadata } from 'next';
import { Providers } from './providers';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Toast } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrustVault - Secure Escrow Payments',
  description: 'Trustless escrow payment platform for freelancers, powered by Bitcoin and the Stacks blockchain.',
  keywords: ['escrow', 'stacks', 'bitcoin', 'freelance', 'payments', 'blockchain'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
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
