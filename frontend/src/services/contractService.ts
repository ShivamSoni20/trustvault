import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '@/utils/constants';
import { parseUSDCxToMicro, dateToBlockHeight } from '@/utils/formatters';
import { getCurrentBlockHeight } from './apiService';

export async function createEscrow(
  freelancer: string,
  amount: number,
  deadline: Date,
  metadata?: string
): Promise<{ txId: string }> {
  const currentBlockHeight = await getCurrentBlockHeight();
  const deadlineBlock = dateToBlockHeight(deadline, currentBlockHeight);
  const microAmount = parseUSDCxToMicro(amount);

  // Validate metadata length (contract limit is 200 bytes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let metadataClv: any = Cl.none();
  if (metadata) {
    if (metadata.length > 200) {
      console.warn('Metadata exceeds 200 character limit, truncating...');
      metadata = metadata.slice(0, 197) + '...';
    }
    metadataClv = Cl.some(Cl.stringUtf8(metadata));
  }

  const response = await request('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'create-escrow',
    functionArgs: [
      Cl.principal(freelancer),
      Cl.uint(microAmount),
      Cl.uint(deadlineBlock),
      metadataClv,
    ],
    network: NETWORK as 'testnet' | 'mainnet',
  });

  return { txId: (response as any).txid || (response as any).txId || '' };
}

export async function completeWork(escrowId: number): Promise<{ txId: string }> {
  const response = await request('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'complete-work',
    functionArgs: [Cl.uint(escrowId)],
    network: NETWORK as 'testnet' | 'mainnet',
  });

  return { txId: (response as any).txid || (response as any).txId || '' };
}

export async function approveRelease(escrowId: number): Promise<{ txId: string }> {
  const response = await request('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'approve-release',
    functionArgs: [Cl.uint(escrowId)],
    network: NETWORK as 'testnet' | 'mainnet',
  });

  return { txId: (response as any).txid || (response as any).txId || '' };
}

export async function initiateRefund(escrowId: number): Promise<{ txId: string }> {
  const response = await request('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'initiate-refund',
    functionArgs: [Cl.uint(escrowId)],
    network: NETWORK as 'testnet' | 'mainnet',
  });

  return { txId: (response as any).txid || (response as any).txId || '' };
}

export async function initiateDispute(escrowId: number, reason: string): Promise<{ txId: string }> {
  const response = await request('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'initiate-dispute',
    functionArgs: [
      Cl.uint(escrowId),
      Cl.stringUtf8(reason),
    ],
    network: NETWORK as 'testnet' | 'mainnet',
  });

  return { txId: (response as any).txid || (response as any).txId || '' };
}

export async function resolveDispute(escrowId: number, resolution: 0 | 1 | 2): Promise<{ txId: string }> {
  const response = await request('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'resolve-dispute',
    functionArgs: [
      Cl.uint(escrowId),
      Cl.uint(resolution),
    ],
    network: NETWORK as 'testnet' | 'mainnet',
  });

  return { txId: (response as any).txid || (response as any).txId || '' };
}

export async function claimExpiredRefund(escrowId: number): Promise<{ txId: string }> {
  const response = await request('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'claim-expired-refund',
    functionArgs: [Cl.uint(escrowId)],
    network: NETWORK as 'testnet' | 'mainnet',
  });

  return { txId: (response as any).txid || (response as any).txId || '' };
}

