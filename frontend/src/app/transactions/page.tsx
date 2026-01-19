'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Download, ArrowUpRight, ArrowDownLeft, Scale, CheckCircle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useWallet } from '@/hooks/useWallet';
import { useTransactions } from '@/hooks/useEscrow';
import { formatDateTime, getExplorerUrl } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import type { TransactionRecord } from '@/types';

const txTypeConfig = {
  create: { icon: ArrowUpRight, label: 'Created Escrow', color: 'text-blue-400' },
  complete: { icon: CheckCircle, label: 'Work Completed', color: 'text-green-400' },
  release: { icon: ArrowDownLeft, label: 'Funds Released', color: 'text-accent' },
  refund: { icon: RefreshCw, label: 'Refunded', color: 'text-amber-400' },
  dispute: { icon: AlertCircle, label: 'Dispute Initiated', color: 'text-orange-400' },
  resolve: { icon: Scale, label: 'Dispute Resolved', color: 'text-purple-400' },
};

export default function TransactionsPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const { data: allTransactions, isLoading } = useTransactions(address);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const transactions = allTransactions || [];

  const filteredTransactions = typeFilter === 'all'
    ? transactions
    : transactions.filter((tx) => tx.type === typeFilter);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-slate-400 mb-6">
          Connect your wallet to view your transaction history.
        </p>
        <Button onClick={connectWallet} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-slate-400">
            View all your escrow-related transactions
          </p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        <FilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
          All
        </FilterButton>
        <FilterButton active={typeFilter === 'create'} onClick={() => setTypeFilter('create')}>
          Created
        </FilterButton>
        <FilterButton active={typeFilter === 'release'} onClick={() => setTypeFilter('release')}>
          Released
        </FilterButton>
        <FilterButton active={typeFilter === 'refund'} onClick={() => setTypeFilter('refund')}>
          Refunded
        </FilterButton>
        <FilterButton active={typeFilter === 'dispute'} onClick={() => setTypeFilter('dispute')}>
          Disputes
        </FilterButton>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-slate-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredTransactions.map((tx) => (
                <TransactionRow key={tx.txId} transaction={tx} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterButton({
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

function TransactionRow({ transaction }: { transaction: TransactionRecord }) {
  const config = txTypeConfig[transaction.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors">
      <div className={cn('w-10 h-10 rounded-full bg-surface flex items-center justify-center', config.color)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{config.label}</span>
          <Link href={`/escrow/${transaction.escrowId}`} className="text-sm text-slate-400 hover:text-white">
            Escrow #{transaction.escrowId}
          </Link>
        </div>
        <p className="text-sm text-slate-400">
          {formatDateTime(transaction.timestamp)}
        </p>
      </div>

      {transaction.amount && (
        <div className="text-right">
          <span className="font-semibold text-accent">
            {transaction.amount.toLocaleString()} USDCx
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {transaction.status === 'pending' ? (
          <Badge className="bg-amber-500/20 text-amber-400">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Pending
          </Badge>
        ) : (
          <Badge className="bg-green-500/20 text-green-400">
            Confirmed
          </Badge>
        )}

        <a
          href={getExplorerUrl('tx', transaction.txId)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-slate-700 rounded transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
