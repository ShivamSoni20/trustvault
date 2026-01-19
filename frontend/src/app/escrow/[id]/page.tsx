'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
  RefreshCw,
  Scale,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Modal';
import { useEscrow } from '@/hooks/useEscrow';
import { useWallet } from '@/hooks/useWallet';
import {
  completeWork,
  approveRelease,
  initiateRefund,
  initiateDispute,
  resolveDispute,
  claimExpiredRefund,
} from '@/services/contractService';
import { useUIStore } from '@/store/uiStore';
import {
  truncateAddress,
  formatUSDCx,
  formatDate,
  getDaysRemaining,
  copyToClipboard,
  getExplorerUrl,
} from '@/utils/formatters';
import { STATUS_LABELS, ESCROW_STATUS, DISPUTE_REASONS, CONTRACT_ADDRESS } from '@/utils/constants';
import { cn } from '@/lib/utils';

export default function EscrowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const escrowId = parseInt(params.id as string);
  const { data: escrow, isLoading, refetch } = useEscrow(escrowId);
  const { address, isConnected } = useWallet();
  const { addToast } = useUIStore();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const isClient = address?.toLowerCase() === escrow?.client?.toLowerCase();
  const isFreelancer = address?.toLowerCase() === escrow?.freelancer?.toLowerCase();
  const isArbitrator = address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase();

  // Debug logging
  console.log('=== Escrow Detail Debug ===');
  console.log('Your address:', address);
  console.log('Client address:', escrow?.client);
  console.log('Freelancer address:', escrow?.freelancer);
  console.log('isClient:', isClient);
  console.log('isFreelancer:', isFreelancer);
  console.log('Escrow status:', escrow?.status);
  console.log('ESCROW_STATUS.ACTIVE:', ESCROW_STATUS.ACTIVE);
  console.log('Should show client buttons:', isClient && escrow?.status === ESCROW_STATUS.ACTIVE);
  console.log('Should show freelancer buttons:', isFreelancer && escrow?.status === ESCROW_STATUS.ACTIVE && !escrow?.workCompleted);

  const handleAction = async (
    action: () => Promise<{ txId: string }>,
    actionName: string
  ) => {
    setActionLoading(actionName);
    try {
      const result = await action();
      addToast({
        type: 'success',
        title: `${actionName} Submitted`,
        message: `Transaction ID: ${result.txId.slice(0, 20)}...`,
      });
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${actionName.toLowerCase()}`;
      addToast({
        type: 'error',
        title: `${actionName} Failed`,
        message: errorMessage,
      });
    } finally {
      setActionLoading(null);
      setShowReleaseModal(false);
      setShowRefundModal(false);
      setShowDisputeModal(false);
      setShowResolveModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Escrow Not Found</h2>
        <p className="text-slate-400 mb-6">
          This escrow does not exist or has not been indexed yet.
        </p>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(escrow.deadline);
  const isExpired = daysRemaining < 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Escrow #{escrow.id}</h1>
            <Badge variant="status" status={escrow.status}>
              {STATUS_LABELS[escrow.status]}
            </Badge>
          </div>
          {escrow.metadata && (
            <p className="text-slate-400">{escrow.metadata}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-accent">
            {formatUSDCx(escrow.amount * 1000000)} USDCx
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Client</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {truncateAddress(escrow.client)}
                </span>
                {isClient && (
                  <Badge className="bg-primary/20 text-primary">You</Badge>
                )}
                <button
                  onClick={() => {
                    copyToClipboard(escrow.client);
                    addToast({ type: 'success', title: 'Address copied' });
                  }}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <a
                  href={getExplorerUrl('address', escrow.client)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Freelancer</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {truncateAddress(escrow.freelancer)}
                </span>
                {isFreelancer && (
                  <Badge className="bg-accent/20 text-accent">You</Badge>
                )}
                <button
                  onClick={() => {
                    copyToClipboard(escrow.freelancer);
                    addToast({ type: 'success', title: 'Address copied' });
                  }}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <a
                  href={getExplorerUrl('address', escrow.freelancer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Deadline</span>
              <span className={cn(isExpired && 'text-red-400')}>
                {formatDate(escrow.deadline)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Time Remaining</span>
              {isExpired ? (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Expired
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {daysRemaining} days
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Work Status</span>
              {escrow.workCompleted ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                <span className="text-amber-400">In Progress</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ProgressStep
              completed={true}
              active={escrow.status === ESCROW_STATUS.ACTIVE && !escrow.workCompleted}
              label="Escrow Created"
            />
            <ProgressLine completed={escrow.workCompleted} />
            <ProgressStep
              completed={escrow.workCompleted}
              active={escrow.status === ESCROW_STATUS.ACTIVE && escrow.workCompleted}
              label="Work Complete"
            />
            <ProgressLine completed={escrow.status >= ESCROW_STATUS.COMPLETED} />
            <ProgressStep
              completed={escrow.status === ESCROW_STATUS.COMPLETED}
              active={false}
              label="Payment Released"
              icon={escrow.status === ESCROW_STATUS.REFUNDED ? <XCircle className="h-4 w-4" /> : undefined}
            />
          </div>
        </CardContent>
      </Card>

      {escrow.status === ESCROW_STATUS.DISPUTED && (
        <Card className="mb-8 border-orange-500/50 bg-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Dispute in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-2">
              This escrow is currently under dispute.
            </p>
            {escrow.disputeReason && (
              <div className="bg-background rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Reason</p>
                <p>{escrow.disputeReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {isClient && escrow.status === ESCROW_STATUS.ACTIVE && (
                <>
                  <Button
                    variant="accent"
                    onClick={() => setShowReleaseModal(true)}
                    isLoading={actionLoading === 'Release'}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Release Funds
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowRefundModal(true)}
                    isLoading={actionLoading === 'Refund'}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Request Refund
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowDisputeModal(true)}
                    isLoading={actionLoading === 'Dispute'}
                    className="gap-2"
                  >
                    <Scale className="h-4 w-4" />
                    Initiate Dispute
                  </Button>
                </>
              )}

              {isFreelancer && escrow.status === ESCROW_STATUS.ACTIVE && !escrow.workCompleted && (
                <Button
                  onClick={() => handleAction(() => completeWork(escrow.id), 'Complete Work')}
                  isLoading={actionLoading === 'Complete Work'}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Work Complete
                </Button>
              )}

              {isArbitrator && escrow.status === ESCROW_STATUS.DISPUTED && (
                <Button
                  onClick={() => setShowResolveModal(true)}
                  isLoading={actionLoading === 'Resolve'}
                  className="gap-2"
                >
                  <Scale className="h-4 w-4" />
                  Resolve Dispute
                </Button>
              )}

              {isExpired && escrow.status === ESCROW_STATUS.ACTIVE && (
                <Button
                  variant="secondary"
                  onClick={() => handleAction(() => claimExpiredRefund(escrow.id), 'Claim Refund')}
                  isLoading={actionLoading === 'Claim Refund'}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Claim Expired Refund
                </Button>
              )}

              {escrow.status >= ESCROW_STATUS.COMPLETED && (
                <p className="text-slate-400 py-2">
                  This escrow has been {STATUS_LABELS[escrow.status].toLowerCase()}.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showReleaseModal} onOpenChange={setShowReleaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Funds</DialogTitle>
            <DialogDescription>
              You are about to release {formatUSDCx(escrow.amount * 1000000)} USDCx to the freelancer.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowReleaseModal(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={() => handleAction(() => approveRelease(escrow.id), 'Release')}
              isLoading={actionLoading === 'Release'}
            >
              Confirm Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              You are about to request a refund of {formatUSDCx(escrow.amount * 1000000)} USDCx.
              The funds will be returned to your wallet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleAction(() => initiateRefund(escrow.id), 'Refund')}
              isLoading={actionLoading === 'Refund'}
            >
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Dispute</DialogTitle>
            <DialogDescription>
              Please select a reason for the dispute. An arbitrator will review and make a decision.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select
              className="input-field mb-4"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              {DISPUTE_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="Provide additional details..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDisputeModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleAction(() => initiateDispute(escrow.id, disputeReason), 'Dispute')}
              isLoading={actionLoading === 'Dispute'}
              disabled={!disputeReason}
            >
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              As the arbitrator, you need to decide how to resolve this dispute.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => handleAction(() => resolveDispute(escrow.id, 0), 'Resolve')}
            >
              Refund to Client (100%)
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => handleAction(() => resolveDispute(escrow.id, 1), 'Resolve')}
            >
              Release to Freelancer (100%)
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => handleAction(() => resolveDispute(escrow.id, 2), 'Resolve')}
            >
              Split 50/50
            </Button>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProgressStep({
  completed,
  active,
  label,
  icon,
}: {
  completed: boolean;
  active: boolean;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          completed
            ? 'bg-green-500 text-white'
            : active
              ? 'bg-primary text-white'
              : 'bg-surface text-slate-400'
        )}
      >
        {icon || (completed ? <CheckCircle className="h-5 w-5" /> : null)}
      </div>
      <span className="text-xs mt-2 text-center">{label}</span>
    </div>
  );
}

function ProgressLine({ completed }: { completed: boolean }) {
  return (
    <div
      className={cn(
        'flex-1 h-1 mx-2',
        completed ? 'bg-green-500' : 'bg-surface'
      )}
    />
  );
}
