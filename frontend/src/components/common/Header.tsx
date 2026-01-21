'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield } from 'lucide-react';
import { WalletButton } from './WalletButton';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Marketplace' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/post-job', label: 'Post Job' },
  { href: '/bids', label: 'My Bids' },
  { href: '/help', label: 'Help' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold gradient-text">TrustWork</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <WalletButton />
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 px-4">
                <WalletButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
