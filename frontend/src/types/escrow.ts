export interface Escrow {
  id: number;
  client: string;
  freelancer: string;
  amount: bigint;
  deadline: number;
  status: number;
  metadata: string | null;
  workCompleted: boolean;
  disputeReason: string | null;
}

export interface EscrowDisplay {
  id: number;
  client: string;
  freelancer: string;
  amount: number;
  deadline: Date;
  status: number;
  statusLabel: string;
  metadata: string | null;
  workCompleted: boolean;
  disputeReason: string | null;
  isExpired: boolean;
  daysRemaining: number;
}

export interface ContractStats {
  totalEscrows: number;
  totalValueLocked: number;
  activeEscrows: number;
  disputedEscrows: number;
  completedEscrows: number;
}

export interface CreateEscrowInput {
  freelancer: string;
  amount: number;
  deadline: Date;
  metadata?: string;
}

export interface TransactionRecord {
  txId: string;
  type: 'create' | 'complete' | 'release' | 'refund' | 'dispute' | 'resolve';
  escrowId: number;
  amount?: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}
