import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
export const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'trustwork-marketplace-v10';

// Token Configuration
const usdcxTokenFull = process.env.NEXT_PUBLIC_USDCX_TOKEN || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx';
export const USDCX_CONTRACT_ID = usdcxTokenFull.split('::')[0];
export const USDCX_ASSET_NAME = usdcxTokenFull.includes('::')
  ? usdcxTokenFull.split('::')[1]
  : (usdcxTokenFull.split('.')[1] || 'usdcx');

export const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.testnet.hiro.so';

export const STACKS_NETWORK = NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

export const JOB_STATUS = {
  OPEN: 1,
  IN_PROGRESS: 2,
  WORK_SUBMITTED: 3,
  COMPLETED: 4,
  DISPUTED: 5,
  CANCELLED: 6,
} as const;

export const BID_STATUSES = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  WITHDRAWN: 4,
} as const;

export const STATUS_LABELS: Record<number, string> = {
  1: 'Open',
  2: 'In Progress',
  3: 'Work Submitted',
  4: 'Completed',
  5: 'Disputed',
  6: 'Cancelled',
};

export const STATUS_COLORS: Record<number, string> = {
  1: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  2: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  3: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  4: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  5: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  6: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export const CATEGORIES = [
  'Web Development',
  'Design',
  'Writing',
  'Marketing',
  'Video Production',
  'Other',
] as const;

export const DISPUTE_REASONS = [
  'Quality issues',
  'Incomplete work',
  'Missed deadline',
  'Communication issues',
  'Other',
] as const;

export const EXPLORER_BASE_URL = 'https://explorer.hiro.so';
