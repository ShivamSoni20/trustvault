'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, ExternalLink, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useWallet } from '@/hooks/useWallet';
import { useTotalEscrows, useUserEscrows } from '@/hooks/useEscrow';
import { truncateAddress, formatUSDCx, formatDate, getDaysRemaining } from '@/utils/formatters';
import { STATUS_LABELS, ESCROW_STATUS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { EscrowDisplay } from '@/types';

type Tab = 'client' | 'freelancer' | 'disputes';

export default function DashboardPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const { data: totalEscrows } = useTotalEscrows();
  const { data: allUserEscrows, isLoading } = useUserEscrows(address);

  const [activeTab, setActiveTab] = useState<Tab>('client');
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const escrows = allUserEscrows || [];

  const filteredEscrows = useMemo(() => {
    let result = [...escrows];

    if (activeTab === 'client') {
      result = result.filter((e) => e.client === address);
    } else if (activeTab === 'freelancer') {
      result = result.filter((e) => e.freelancer === address);
    } else if (activeTab === 'disputes') {
      result = result.filter((e) => e.status === ESCROW_STATUS.DISPUTED);
    }

    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.metadata?.toLowerCase().includes(query) ||
          e.client.toLowerCase().includes(query) ||
          e.freelancer.toLowerCase().includes(query) ||
          e.id.toString().includes(query)
      );
    }

    return result;
  }, [escrows, activeTab, statusFilter, searchQuery, address]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-slate-400 mb-6">
          Connect your wallet to view your escrows and manage payments.
        </p>
        <Button onClick={connectWallet} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Manage your escrows and track payments
          </p>
        </div>
        <Link href="/create-escrow">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Escrow
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Escrows" value={totalEscrows || 0} />
        <StatCard
          label="As Client"
          value={escrows.filter((e) => e.client === address).length}
        />
        <StatCard
          label="As Freelancer"
          value={escrows.filter((e) => e.freelancer === address).length}
        />
        <StatCard
          label="Active"
          value={escrows.filter((e) => e.status === ESCROW_STATUS.ACTIVE).length}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <TabButton
            active={activeTab === 'client'}
            onClick={() => setActiveTab('client')}
          >
            As Client
          </TabButton>
          <TabButton
            active={activeTab === 'freelancer'}
            onClick={() => setActiveTab('freelancer')}
          >
            As Freelancer
          </TabButton>
          <TabButton
            active={activeTab === 'disputes'}
            onClick={() => setActiveTab('disputes')}
          >
            Disputes
          </TabButton>
        </div>

        <div className="flex-1 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search escrows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            className="input-field w-40"
            value={statusFilter === 'all' ? 'all' : statusFilter.toString()}
            onChange={(e) =>
              setStatusFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
            }
          >
            <option value="all">All Status</option>
            <option value="1">Active</option>
            <option value="2">Completed</option>
            <option value="3">Refunded</option>
            <option value="4">Disputed</option>
            <option value="5">Resolved</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-slate-400">Loading your escrows...</p>
            </div>
          ) : filteredEscrows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 mb-4">No escrows found</p>
              {activeTab === 'client' && (
                <Link href="/create-escrow">
                  <Button>Create Your First Escrow</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-sm font-medium text-slate-400">
                      ID
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">
                      Project
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">
                      {activeTab === 'client' ? 'Freelancer' : 'Client'}
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">
                      Amount
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-slate-400">
                      Status
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-slate-400">
                      Deadline
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEscrows.map((escrow) => (
                    <EscrowRow
                      key={escrow.id}
                      escrow={escrow}
                      showParty={activeTab === 'client' ? 'freelancer' : 'client'}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
        active
          ? 'bg-primary text-white'
          : 'bg-surface text-slate-400 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function EscrowRow({
  escrow,
  showParty,
}: {
  escrow: EscrowDisplay;
  showParty: 'client' | 'freelancer';
}) {
  const partyAddress = showParty === 'client' ? escrow.client : escrow.freelancer;
  const daysRemaining = getDaysRemaining(escrow.deadline);
  const isUrgent = daysRemaining <= 3 && daysRemaining > 0;
  const isExpired = daysRemaining < 0;

  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
      <td className="p-4">
        <span className="font-mono text-sm">#{escrow.id}</span>
      </td>
      <td className="p-4">
        <span className="font-medium">
          {escrow.metadata || 'Untitled Project'}
        </span>
      </td>
      <td className="p-4">
        <span className="font-mono text-sm text-slate-400">
          {truncateAddress(partyAddress)}
        </span>
      </td>
      <td className="p-4 text-right">
        <span className="font-semibold text-accent">
          {formatUSDCx(escrow.amount * 1000000)}
        </span>
      </td>
      <td className="p-4 text-center">
        <Badge variant="status" status={escrow.status}>
          {STATUS_LABELS[escrow.status]}
        </Badge>
      </td>
      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-1">
          {isExpired ? (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Expired
            </span>
          ) : isUrgent ? (
            <span className="text-amber-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {daysRemaining}d
            </span>
          ) : (
            <span className="text-slate-400">
              {formatDate(escrow.deadline)}
            </span>
          )}
        </div>
      </td>
      <td className="p-4 text-right">
        <Link href={`/escrow/${escrow.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            View
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </td>
    </tr>
  );
}
