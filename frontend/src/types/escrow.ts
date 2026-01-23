export interface Job {
  id: number;
  creator: string;              // Client's principal
  title: string;                // Max 200 chars
  description: string;          // Max 1000 chars
  budget: bigint;               // In micro-USDCx (6 decimals)
  deadline: number;             // Burn block height
  status: number;               // 1-6 (see status codes)
  selectedFreelancer: string | null;
  workSubmittedBy: string | null;
  workSubmittedAt: number | null;
  workDescription: string | null;
  creatorFeedback: string | null;
  createdAt: number;            // Burn block height
  category: string;             // e.g., "Design", "Development"
}

export interface Bid {
  jobId: number;
  freelancer: string;
  bidAmount: bigint;            // In micro-USDCx
  proposal: string;             // Max 500 chars
  bidStatus: number;            // 1-4 (pending/accepted/rejected/withdrawn)
  submittedAt: number;          // Burn block height
}

export interface Dispute {
  jobId: number;
  raisedBy: string;             // Who raised the dispute
  reason: string;               // Max 500 chars
  raisedAt: number;
  resolved: boolean;
  resolution: string | null;    // Admin's decision
}

export interface JobDisplay extends Omit<Job, 'budget'> {
  budget: number;               // Decimal format
  statusLabel: string;
  isExpired: boolean;
  blocksRemaining: number;
}

export interface BidDisplay extends Omit<Bid, 'bidAmount'> {
  bidAmount: number;
  statusLabel: string;
}

export interface ContractStats {
  totalJobs: number;
  totalValueLocked: number;
  completedJobs: number;
  activeJobs: number;
}

export interface PostJobInput {
  title: string;
  description: string;
  budget: number;
  deadline: number; // Block height
  category: string;
}

export interface SubmitBidInput {
  jobId: number;
  amount: number;
  proposal: string;
}

export interface TransactionRecord {
  txId: string;
  type: 'post-job' | 'submit-bid' | 'accept-bid' | 'submit-work' | 'approve-work' | 'raise-dispute' | 'resolve-dispute';
  jobId: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}
