'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Shield, 
  Scale, 
  Zap, 
  Wallet,
  FileCheck,
  CheckCircle,
  Send,
  Star,
  TrendingUp,
  Lock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useContractStats } from '@/hooks/useEscrow';
import { formatUSDCx } from '@/utils/formatters';

export default function HomePage() {
  const { data: stats } = useContractStats();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="gradient-text">TrustVault</span>
              <br />
              <span className="text-white">Where Trust Meets Blockchain</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Secure escrow payments for freelancers, powered by Bitcoin. 
              Smart contracts hold funds securely until work is complete.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create-escrow">
                <Button size="xl" className="gap-2 w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              label="Total Escrows"
              value={stats?.totalEscrows || 0}
              icon={<FileCheck className="h-6 w-6" />}
            />
            <StatCard
              label="Value Locked"
              value={`${formatUSDCx(stats?.totalValueLocked || 0)} USDCx`}
              icon={<Lock className="h-6 w-6" />}
            />
            <StatCard
              label="Active Escrows"
              value={stats?.activeEscrows || 0}
              icon={<TrendingUp className="h-6 w-6" />}
            />
            <StatCard
              label="Success Rate"
              value="99.2%"
              icon={<CheckCircle className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">TrustVault</span>?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Built on Bitcoin security through Stacks, our platform ensures your payments are safe, transparent, and fair.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Trustless Payments"
              description="Smart contracts hold funds securely. No intermediaries, no hidden fees, no surprises."
            />
            <FeatureCard
              icon={<Scale className="h-8 w-8" />}
              title="Fair Disputes"
              description="Transparent arbitration process with clear resolution options. Your voice is heard."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Lightning Fast"
              description="Bitcoin-backed finality on Stacks. Transactions settle quickly with blockchain security."
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Simple, secure, and straightforward. Get paid for your work in just a few steps.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 md:gap-8">
            <StepCard
              number={1}
              icon={<Wallet className="h-6 w-6" />}
              title="Client Deposits"
              description="Client creates escrow and deposits USDCx"
            />
            <StepCard
              number={2}
              icon={<FileCheck className="h-6 w-6" />}
              title="Work Begins"
              description="Freelancer starts the project"
            />
            <StepCard
              number={3}
              icon={<CheckCircle className="h-6 w-6" />}
              title="Work Complete"
              description="Freelancer marks work as done"
            />
            <StepCard
              number={4}
              icon={<Send className="h-6 w-6" />}
              title="Client Approves"
              description="Client reviews and releases funds"
            />
            <StepCard
              number={5}
              icon={<Star className="h-6 w-6" />}
              title="Payment Received"
              description="Freelancer gets paid instantly"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfect For
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <UseCaseCard
              icon={<Users className="h-8 w-8" />}
              title="Freelancers"
              items={['Web Developers', 'Designers', 'Writers', 'Marketers']}
            />
            <UseCaseCard
              icon={<Users className="h-8 w-8" />}
              title="Businesses"
              items={['Startups', 'Agencies', 'Small Business', 'Enterprise']}
            />
            <UseCaseCard
              icon={<Users className="h-8 w-8" />}
              title="Projects"
              items={['One-time gigs', 'Contract work', 'Milestones', 'Retainers']}
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary/20 to-accent/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-300 mb-8">
            Join thousands of freelancers and clients who trust TrustVault for secure payments.
          </p>
          <Link href="/create-escrow">
            <Button size="xl" className="gap-2">
              Create Your First Escrow
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 text-primary mb-4">
          {icon}
        </div>
        <p className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center hover:border-primary/50 transition-colors">
      <CardContent className="pt-8 pb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white mb-4">
            {icon}
          </div>
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-background">
            {number}
          </span>
        </div>
        <h4 className="font-semibold text-white mb-2">{title}</h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/20 text-accent mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="h-4 w-4 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
