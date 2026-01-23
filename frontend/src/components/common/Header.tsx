'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiShield, FiBriefcase, FiPlusSquare, FiGrid, FiHelpCircle } from 'react-icons/fi';
import { WalletButton } from './WalletButton';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/jobs', label: 'Browse Jobs', icon: FiGrid },
  { href: '/post-job', label: 'Post Job', icon: FiPlusSquare },
  { href: '/dashboard', label: 'Client Dashboard', icon: FiBriefcase },
  { href: '/bids', label: 'Freelancer Portal', icon: FiShield },
  { href: '/help', label: 'Support', icon: FiHelpCircle },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300 border-b",
      scrolled 
        ? "bg-[#0a0a0c]/80 backdrop-blur-xl border-white/10 py-3" 
        : "bg-transparent border-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
              <FiShield className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">Trust<span className="text-emerald-500">Work</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border border-transparent',
                  pathname === link.href
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <WalletButton />
          </div>

          <button
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[73px] bg-[#0a0a0c] border-b border-white/10 p-6 animate-reveal">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl text-lg font-medium transition-all',
                    pathname === link.href
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <link.icon className="w-6 h-6" />
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-white/5">
                <WalletButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
