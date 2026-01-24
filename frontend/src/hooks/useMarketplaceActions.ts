'use client';

import { useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  Cl,
  Pc,
  PostConditionMode
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, STACKS_NETWORK, USDCX_CONTRACT_ID, USDCX_ASSET_NAME } from '@/utils/constants';
import { useWallet } from './useWallet';
import { parseUSDCxToMicro } from '@/utils/formatters';

export function useMarketplaceActions() {
  const { address } = useWallet();

  const getUSDCxPostCondition = useCallback((amountMicro: bigint, isFromUser: boolean) => {
    if (isFromUser && address) {
      return Pc.principal(address).willSendEq(amountMicro).ft(USDCX_CONTRACT_ID, USDCX_ASSET_NAME);
    } else {
      return Pc.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`).willSendEq(amountMicro).ft(USDCX_CONTRACT_ID, USDCX_ASSET_NAME);
    }
  }, [address]);

  const postJob = useCallback(async (title: string, description: string, budget: number, deadline: number, category: string) => {
    const budgetMicro = parseUSDCxToMicro(budget);

    await openContractCall({
      network: STACKS_NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'post-job',
      functionArgs: [
        Cl.stringUtf8(title),
        Cl.stringUtf8(description),
        Cl.uint(budgetMicro),
        Cl.uint(deadline),
        Cl.stringUtf8(category)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [getUSDCxPostCondition(budgetMicro, true)],
      onFinish: (data) => console.log('Transaction broadcasted:', data.txId),
      onCancel: () => console.log('Transaction cancelled'),
    });
  }, [getUSDCxPostCondition]);

  const submitBid = useCallback(async (jobId: number, amount: number, proposal: string) => {
    const amountMicro = parseUSDCxToMicro(amount);

    await openContractCall({
      network: STACKS_NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'submit-bid',
      functionArgs: [
        Cl.uint(jobId),
        Cl.uint(amountMicro),
        Cl.stringUtf8(proposal)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [getUSDCxPostCondition(amountMicro, true)],
      onFinish: (data) => console.log('Bid transaction broadcasted:', data.txId),
    });
  }, [getUSDCxPostCondition]);

  const acceptBid = useCallback(async (jobId: number, freelancer: string) => {
    await openContractCall({
      network: STACKS_NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'accept-bid',
      functionArgs: [Cl.uint(jobId), Cl.principal(freelancer)],
      onFinish: (data) => console.log('Accept bid transaction broadcasted:', data.txId),
    });
  }, []);

  const submitWork = useCallback(async (jobId: number, description: string) => {
    await openContractCall({
      network: STACKS_NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'submit-work',
      functionArgs: [Cl.uint(jobId), Cl.stringUtf8(description)],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => console.log('Submit work transaction broadcasted:', data.txId),
    });
  }, []);

  const approveWork = useCallback(async (jobId: number, feedback: string) => {
    await openContractCall({
      network: STACKS_NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'approve-work',
      functionArgs: [Cl.uint(jobId), Cl.stringUtf8(feedback)],
      onFinish: (data) => console.log('Approve work transaction broadcasted:', data.txId),
    });
  }, []);

  const cancelJob = useCallback(async (jobId: number) => {
    await openContractCall({
      network: STACKS_NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'cancel-job',
      functionArgs: [Cl.uint(jobId)],
      onFinish: (data) => console.log('Cancel job transaction broadcasted:', data.txId),
    });
  }, []);

  return {
    postJob,
    submitBid,
    acceptBid,
    submitWork,
    approveWork,
    cancelJob,
  };
}
