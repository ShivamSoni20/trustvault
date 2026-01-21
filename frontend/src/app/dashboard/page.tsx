'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Clock, ExternalLink, Briefcase, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { useWallet } from '@/hooks/useWallet';
import { useTotalEscrows, useUserEscrows } from '@/hooks/useEscrow';
import { useAllJobs, getJobStatusLabel, formatUSDCx as formatUSDCxJob, type Job } from '@/hooks/useJobs';
import { formatUSDCx } from '@/utils/formatters';
import { STATUS_LABELS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { EscrowDisplay } from '@/types';

type DashboardTab = 'escrows' | 'my-jobs' | 'my-bids' | 'assignments';

export default function DashboardPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<DashboardTab>('escrows');

  // Old Escrow System Data
  useTotalEscrows();
  const { data: allUserEscrows, isLoading: escrowsLoading } = useUserEscrows(address);

  // New Job Marketplace Data
  const { data: allJobs = [], isLoading: jobsLoading } = useAllJobs();

  // Marketplace Filtering
  const myJobs = allJobs.filter(j => j.creator.toLowerCase() === address?.toLowerCase());
  const assignments = allJobs.filter(j => j.selectedFreelancer?.toLowerCase() === address?.toLowerCase());
  // Note: Finding all bids by user is expensive without an index, showing assignments for now

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-slate-400 mb-6">
          Connect your wallet to access the TrustWork dashboard.
        </p>
        <Button onClick={connectWallet} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  const isLoading = escrowsLoading || jobsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-slate-400">Manage your jobs, bids, and escrows in one place.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/post-job">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Post Job
            </Button>
          </Link>
          <Link href="/create-escrow">
            <Button variant="ghost" className="gap-2 border border-slate-700">
              <Plus className="h-4 w-4" />
              Direct Escrow
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800">
        <TabButton active={activeTab === 'escrows'} onClick={() => setActiveTab('escrows')} icon={<Clock className="w-4 h-4" />}>
          Escrows ({allUserEscrows?.length || 0})
        </TabButton>
        <TabButton active={activeTab === 'my-jobs'} onClick={() => setActiveTab('my-jobs')} icon={<Briefcase className="w-4 h-4" />}>
          My Posted Jobs ({myJobs.length})
        </TabButton>
        <TabButton active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} icon={<User className="w-4 h-4" />}>
          Assignments ({assignments.length})
        </TabButton>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-slate-400">Loading your data...</p>
            </div>
          ) : activeTab === 'escrows' ? (
            <EscrowTabContent escrows={allUserEscrows || []} />
          ) : activeTab === 'my-jobs' ? (
            <MarketplaceTabContent jobs={myJobs} title="Jobs I Posted" />
          ) : (
            <MarketplaceTabContent jobs={assignments} title="Jobs Assigned to Me" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TabButton({ children, active, onClick, icon }: { children: React.ReactNode, active: boolean, onClick: () => void, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
        active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function EscrowTabContent({ escrows }: { escrows: EscrowDisplay[] }) {
  if (escrows.length === 0) return <NoData message="No active escrows found." link="/create-escrow" label="Create Escrow" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left p-4 text-sm font-medium text-slate-400">ID</th>
            <th className="text-left p-4 text-sm font-medium text-slate-400">Project</th>
            <th className="text-right p-4 text-sm font-medium text-slate-400">Amount</th>
            <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
            <th className="text-right p-4 text-sm font-medium text-slate-400">Action</th>
          </tr>
        </thead>
        <tbody>
          {escrows.map(escrow => (
            <tr key={escrow.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
              <td className="p-4 font-mono text-sm">#{escrow.id}</td>
              <td className="p-4 font-medium">{escrow.metadata || 'Untitled'}</td>
              <td className="p-4 text-right font-semibold text-blue-400">{formatUSDCx(escrow.amount * 1000000)}</td>
              <td className="p-4 text-center">
                <Badge variant="status" status={escrow.status}>{STATUS_LABELS[escrow.status]}</Badge>
              </td>
              <td className="p-4 text-right">
                <Link href={`/escrow/${escrow.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1">View <ExternalLink className="h-3 w-3" /></Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarketplaceTabContent({ jobs, title }: { jobs: Job[], title: string }) {
  if (jobs.length === 0) return <NoData message={`No ${title.toLowerCase()} found.`} link="/post-job" label="Post New Job" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left p-4 text-sm font-medium text-slate-400">ID</th>
            <th className="text-left p-4 text-sm font-medium text-slate-400">Job Title</th>
            <th className="text-right p-4 text-sm font-medium text-slate-400">Budget</th>
            <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
            <th className="text-right p-4 text-sm font-medium text-slate-400">Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
              <td className="p-4 font-mono text-sm">#{job.id}</td>
              <td className="p-4 font-medium">{job.title}</td>
              <td className="p-4 text-right font-semibold text-green-400">{formatUSDCxJob(job.budget)} USDCx</td>
              <td className="p-4 text-center">
                <span className="px-2 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                  {getJobStatusLabel(job.status)}
                </span>
              </td>
              <td className="p-4 text-right">
                <Link href={`/job/${job.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1">Manage <ExternalLink className="h-3 w-3" /></Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NoData({ message, link, label }: { message: string, link: string, label: string }) {
  return (
    <div className="py-20 text-center">
      <p className="text-slate-400 mb-6">{message}</p>
      <Link href={link}>
        <Button size="lg">{label}</Button>
      </Link>
    </div>
  );
}
