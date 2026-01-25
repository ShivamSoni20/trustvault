import axios from 'axios';
import { hexToCV, Cl, cvToValue } from '@stacks/transactions';
import { API_BASE_URL, CONTRACT_ADDRESS, CONTRACT_NAME, USDCX_CONTRACT_ID, USDCX_ASSET_NAME } from '@/utils/constants';
import type { Job, JobDisplay, Bid, ContractStats, TransactionRecord } from '@/types';
import { getStatusLabel, blockHeightToDate } from '@/utils/formatters';

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

export async function getTotalJobs(): Promise<number> {
  try {
    const response = await api.post(
      `/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-total-jobs`,
      {
        sender: CONTRACT_ADDRESS,
        arguments: [],
      }
    );

    if (response.data.okay && response.data.result) {
      const cv = hexToCV(response.data.result);
      const val = cvToValue(cv);
      return Number(val);
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch total jobs:', error);
    return 0;
  }
}

export async function getJob(jobId: number): Promise<JobDisplay | null> {
  try {
    const response = await api.post(
      `/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-job`,
      {
        sender: CONTRACT_ADDRESS,
        arguments: [Cl.serialize(Cl.uint(jobId))],
      }
    );

    if (response.data.okay && response.data.result) {
      const cv = hexToCV(response.data.result);
      const parsed = cvToValue(cv);

      if (!parsed || parsed.type === 'none' || parsed.value === null) return null;

      const data = (parsed.value || parsed) as Record<string, any>;
      const currentBlockHeight = await getCurrentBlockHeight();
      const deadlineBlock = Number(data.deadline.value || data.deadline);

      return {
        id: jobId,
        creator: (data.creator.value || data.creator) as string,
        title: (data.title.value || data.title) as string,
        description: (data.description.value || data.description) as string,
        budget: Number(data.budget.value || data.budget) / 1_000_000,
        deadline: deadlineBlock,
        status: Number(data.status.value || data.status),
        statusLabel: getStatusLabel(Number(data.status.value || data.status)),
        selectedFreelancer: data['selected-freelancer']?.value || null,
        workSubmittedBy: data['work-submitted-by']?.value || null,
        workSubmittedAt: null, // Not in contract but can be inferred from event if needed
        workDescription: data['work-description']?.value || null,
        creatorFeedback: data['creator-feedback']?.value || null,
        createdAt: Number(data['created-at']?.value || data['created-at']),
        category: (data.category.value || data.category) as string,
        isExpired: currentBlockHeight >= deadlineBlock,
        blocksRemaining: Math.max(0, deadlineBlock - currentBlockHeight),
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch job ${jobId}:`, error);
    return null;
  }
}

export async function getBid(jobId: number, freelancer: string): Promise<Bid | null> {
  try {
    const response = await api.post(
      `/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-bid`,
      {
        sender: CONTRACT_ADDRESS,
        arguments: [Cl.serialize(Cl.uint(jobId)), Cl.serialize(Cl.principal(freelancer))],
      }
    );

    if (response.data.okay && response.data.result) {
      const cv = hexToCV(response.data.result);
      const parsed = cvToValue(cv);
      if (!parsed || parsed.value === null) return null;

      const data = parsed.value as Record<string, any>;
      return {
        jobId,
        freelancer,
        bidAmount: BigInt(data['bid-amount'].value || data['bid-amount']),
        proposal: (data.proposal.value || data.proposal) as string,
        bidStatus: Number(data['bid-status'].value || data['bid-status']),
        submittedAt: Number(data['submitted-at'].value || data['submitted-at']),
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch bid for job ${jobId} freelancer ${freelancer}:`, error);
    return null;
  }
}

export async function getAllJobs(): Promise<JobDisplay[]> {
  try {
    const total = await getTotalJobs();
    const promises = [];
    for (let i = 0; i < total; i++) {
      promises.push(getJob(i));
    }
    const results = await Promise.all(promises);
    return results.filter((j): j is JobDisplay => j !== null).reverse();
  } catch (error) {
    console.error('Failed to fetch all jobs:', error);
    return [];
  }
}

export async function getContractStats(): Promise<ContractStats> {
  const jobs = await getAllJobs();
  return {
    totalJobs: jobs.length,
    totalValueLocked: jobs.reduce((acc, j) => acc + (j.status < 4 ? j.budget : 0), 0),
    completedJobs: jobs.filter(j => j.status === 4).length,
    activeJobs: jobs.filter(j => j.status === 2 || j.status === 3).length,
  };
}

export async function getUserTransactions(address: string): Promise<TransactionRecord[]> {
  try {
    const response = await api.get(`/extended/v1/address/${address}/transactions`, {
      params: { limit: 50 },
    });

    const results = response.data.results || [];
    return results
      .filter((tx: any) => tx.tx_type === 'contract_call' && tx.contract_call?.contract_id === `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`)
      .map((tx: any) => ({
        txId: tx.tx_id,
        type: tx.contract_call.function_name as TransactionRecord['type'],
        jobId: -1, // Would need deeper parsing
        timestamp: new Date(tx.burn_block_time * 1000),
        status: tx.tx_status === 'success' ? 'confirmed' : tx.tx_status === 'pending' ? 'pending' : 'failed',
      }));
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
}

export async function getUserBalance(address: string): Promise<number> {
  try {
    const response = await api.get(`/extended/v1/address/${address}/balances`);
    if (response.data && response.data.stx) {
      const stxBalance = BigInt(response.data.stx.balance);
      return Number(stxBalance) / 1_000_000;
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch user balance:', error);
    return 0;
  }
}

export async function getUSDCxBalance(address: string): Promise<number> {
  try {
    const response = await api.get(`/extended/v1/address/${address}/balances`);
    if (response.data && response.data.fungible_tokens) {
      const fullIdentifier = `${USDCX_CONTRACT_ID}::${USDCX_ASSET_NAME}`;
      const tokenData = response.data.fungible_tokens[fullIdentifier];
      if (tokenData) {
        return Number(BigInt(tokenData.balance)) / 1_000_000;
      }
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch USDCx balance:', error);
    return 0;
  }
}

