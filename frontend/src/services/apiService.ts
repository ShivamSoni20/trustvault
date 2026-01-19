import axios from 'axios';
import { hexToCV, cvToJSON, Cl, cvToValue } from '@stacks/transactions';
import { API_BASE_URL, CONTRACT_ADDRESS, CONTRACT_NAME } from '@/utils/constants';
import type { EscrowDisplay, ContractStats, TransactionRecord } from '@/types';
import { getStatusLabel, getDaysRemaining, blockHeightToDate } from '@/utils/formatters';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function getCurrentBlockHeight(): Promise<number> {
  try {
    const response = await api.get('/extended/v1/block?limit=1');
    return response.data.results[0]?.burn_block_height || 0;
  } catch (error) {
    console.error('Failed to fetch block height:', error);
    return 0;
  }
}

export async function getTotalEscrows(): Promise<number> {
  try {
    const response = await api.post(
      `/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-total-escrows`,
      {
        sender: CONTRACT_ADDRESS,
        arguments: [],
      }
    );

    if (response.data.okay && response.data.result) {
      const cv = hexToCV(response.data.result);
      const value = cvToValue(cv);
      return Number(value);
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch total escrows:', error);
    return 0;
  }
}

export async function getEscrow(escrowId: number): Promise<EscrowDisplay | null> {
  try {
    const response = await api.post(
      `/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-escrow`,
      {
        sender: CONTRACT_ADDRESS,
        arguments: [Cl.serialize(Cl.uint(escrowId))],
      }
    );

    if (response.data.okay && response.data.result) {
      const cv = hexToCV(response.data.result);
      const value: any = cvToValue(cv);

      if (!value) return null; // None returns null/undefined from cvToValue

      // cvToValue unwraps the tuple. Properties are direct values (bigint, string, etc)
      const currentBlockHeight = await getCurrentBlockHeight();
      const deadlineBlock = Number(value.deadline); // bigint to number
      const deadlineDate = blockHeightToDate(deadlineBlock, currentBlockHeight);

      const status = Number(value.status);
      const amount = Number(value.amount) / 1_000_000;

      // Handle metadata (optional string)
      let metadata = null;
      if (value.metadata && value.metadata.type === 'some') {
        metadata = value.metadata.value;
      } else if (value.metadata && typeof value.metadata === 'string') {
        // sometimes cvToValue unwraps completely if it's simple
        metadata = value.metadata;
      }

      // Handle dispute reason (optional string)
      let disputeReason = null;
      if (value['dispute-reason'] && value['dispute-reason'].type === 'some') {
        disputeReason = value['dispute-reason'].value;
      }

      return {
        id: escrowId,
        client: value.client,
        freelancer: value.freelancer,
        amount: amount,
        deadline: deadlineDate,
        status: status,
        statusLabel: getStatusLabel(status),
        metadata: metadata,
        workCompleted: status === 2 || status === 5, // Status 2 is Completed
        disputeReason: disputeReason,
        isExpired: currentBlockHeight >= deadlineBlock,
        daysRemaining: getDaysRemaining(deadlineDate),
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch escrow ${escrowId}:`, error);
    return null;
  }
}

export async function getUserEscrows(address: string): Promise<EscrowDisplay[]> {
  try {
    const total = await getTotalEscrows();
    const escrows: EscrowDisplay[] = [];

    // In a real app, we'd use an indexer. Here we'll fetch all and filter.
    // For performance, we limit to the last 50 escrows if there are many.
    const startId = Math.max(0, total - 50);

    const promises = [];
    for (let i = startId; i < total; i++) {
      promises.push(getEscrow(i));
    }

    const results = await Promise.all(promises);
    return results.filter((e): e is EscrowDisplay =>
      e !== null && (e.client === address || e.freelancer === address)
    ).reverse();
  } catch (error) {
    console.error('Failed to fetch user escrows:', error);
    return [];
  }
}

export async function getContractStats(): Promise<ContractStats> {
  const totalEscrows = await getTotalEscrows();

  return {
    totalEscrows,
    totalValueLocked: 0,
    activeEscrows: 0,
    disputedEscrows: 0,
    completedEscrows: 0,
  };
}

export async function getUserBalance(address: string): Promise<number> {
  try {
    const response = await api.get(`/extended/v1/address/${address}/balances`);
    return response.data.stx?.balance ? Number(response.data.stx.balance) / 1_000_000 : 0;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return 0;
  }
}

export async function getAddressTransactions(address: string): Promise<TransactionRecord[]> {
  try {
    const response = await api.get(`/extended/v1/address/${address}/transactions`, {
      params: {
        limit: 50,
      },
    });

    const results = response.data.results || [];
    const transactions: TransactionRecord[] = [];

    for (const tx of results) {
      if (tx.tx_type !== 'contract_call' || tx.contract_call?.contract_id !== `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`) {
        continue;
      }

      const functionName = tx.contract_call.function_name;
      let type: TransactionRecord['type'] | null = null;

      switch (functionName) {
        case 'create-escrow': type = 'create'; break;
        case 'complete-work': type = 'complete'; break;
        case 'approve-release': type = 'release'; break;
        case 'initiate-refund': type = 'refund'; break;
        case 'initiate-dispute': type = 'dispute'; break;
        case 'resolve-dispute': type = 'resolve'; break;
      }

      if (type) {
        // Extract escrow-id from function arguments if possible
        // This is simplified; real parsing depends on tx structure
        let escrowId = 0;
        const args = tx.contract_call.function_args || [];
        if (type === 'create') {
          // For create, the ID is in the return value, which isn't in the base tx object easily
          // We'd need to fetch the full tx details or use an indexer
          escrowId = -1; // Flag as "check explorer" or similar
        } else {
          // For others, it's usually the first argument
          const idArg = args.find((a: any) => a.name === 'escrow-id');
          if (idArg) {
            const hex = idArg.repr.slice(1); // remove 'u'
            escrowId = parseInt(hex);
          }
        }

        transactions.push({
          txId: tx.tx_id,
          type,
          escrowId,
          timestamp: new Date(tx.burn_block_time * 1000),
          status: tx.tx_status === 'success' ? 'confirmed' : tx.tx_status === 'pending' ? 'pending' : 'failed',
        });
      }
    }

    return transactions;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
}
