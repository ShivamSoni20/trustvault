'use client';

import { useQuery } from '@tanstack/react-query';
import { getEscrow, getTotalEscrows, getContractStats, getCurrentBlockHeight, getUserEscrows, getAddressTransactions } from '@/services/apiService';

export function useEscrow(escrowId: number) {
  return useQuery({
    queryKey: ['escrow', escrowId],
    queryFn: () => getEscrow(escrowId),
    enabled: escrowId >= 0,
    staleTime: 30000,
  });
}

export function useUserEscrows(address: string | null) {
  return useQuery({
    queryKey: ['userEscrows', address],
    queryFn: () => getUserEscrows(address!),
    enabled: !!address,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useTransactions(address: string | null) {
  return useQuery({
    queryKey: ['transactions', address],
    queryFn: () => getAddressTransactions(address!),
    enabled: !!address,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useTotalEscrows() {
  return useQuery({
    queryKey: ['totalEscrows'],
    queryFn: getTotalEscrows,
    staleTime: 60000,
  });
}

export function useContractStats() {
  return useQuery({
    queryKey: ['contractStats'],
    queryFn: getContractStats,
    staleTime: 60000,
  });
}

export function useBlockHeight() {
  return useQuery({
    queryKey: ['blockHeight'],
    queryFn: getCurrentBlockHeight,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
