'use client';

import { useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { 
  Cl, 
  FungibleConditionCode, 
  makeStandardFungiblePostCondition,
  makeContractFungiblePostCondition,
  createAssetInfo
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, STACKS_NETWORK } from '@/utils/constants';
import { useWallet } from './useWallet';
import { parseUSDCxToMicro } from '@/utils/formatters';

// USDCx details for post-conditions
const USDCX_ASSET_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const USDCX_ASSET_NAME = 'usdcx-v1';
const USDCX_ASSET_SYMBOL = 'usdcx';

export function useMarketplaceActions() {
  const { address } = useWallet();

  const getUSDCxPostCondition = useCallback((amountMicro: bigint, isFromUser: boolean) => {
    const assetInfo = createAssetInfo(USDCX_ASSET_ADDRESS, USDCX_ASSET_NAME, USDCX_ASSET_SYMBOL);
    if (isFromUser && address) {
      return makeStandardFungiblePostCondition(
        address,
        FungibleConditionCode.Equal,
        amountMicro,
        assetInfo
      );
    } else {
      return makeContractFungiblePostCondition(
        CONTRACT_ADDRESS,
        CONTRACT_NAME,
        FungibleConditionCode.Equal,
        amountMicro,
        assetInfo
      );
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
        Cl.utf8(title),
        Cl.utf8(description),
        Cl.uint(budgetMicro),
        Cl.uint(deadline),
        Cl.utf8(category)
      ],
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
        Cl.utf8(proposal)
      ],
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
      functionArgs: [Cl.uint(jobId), Cl.utf8(description)],
      onFinish: (data) => console.log('Submit work transaction broadcasted:', data.txId),
    });
  }, []);

  const approveWork = useCallback(async (jobId: number, amount: number) => {
    const amountMicro = parseUSDCxToMicro(amount);
    // When approving, funds move from contract to freelancer and owner
    // We can add post-conditions for the contract outgoing funds if needed
    await openContractCall({
      network: STACKS_NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'approve-work',
      functionArgs: [Cl.uint(jobId)],
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
