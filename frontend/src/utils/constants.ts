import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
export const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'usdcx-escrow';
export const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.testnet.hiro.so';

export const STACKS_NETWORK = NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

export const ESCROW_STATUS = {
  ACTIVE: 1,
  COMPLETED: 2,
  REFUNDED: 3,
  DISPUTED: 4,
  RESOLVED: 5,
} as const;

export const STATUS_LABELS: Record<number, string> = {
  1: 'Active',
  2: 'Completed',
  3: 'Refunded',
  4: 'Disputed',
  5: 'Resolved',
};

export const STATUS_COLORS: Record<number, string> = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-gray-500',
  4: 'bg-orange-500',
  5: 'bg-purple-500',
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
