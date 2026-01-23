'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import { 
  getJob, 
  getAllJobs, 
  getContractStats, 
  getCurrentBlockHeight, 
  getBid,
  getUserTransactions
} from '@/services/apiService';
import { JOB_STATUS } from '@/utils/constants';

export function useAllJobs() {
  return useQuery({
    queryKey: ['all-jobs'],
    queryFn: getAllJobs,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useJob(jobId: number | null) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobId !== null ? getJob(jobId) : null,
    enabled: jobId !== null,
    refetchInterval: 30000,
  });
}

export function useCreatedJobs() {
  const { address } = useWallet();
  const { data: allJobs = [], ...rest } = useAllJobs();

  const createdJobs = allJobs.filter(job =>
    job.creator.toLowerCase() === address?.toLowerCase()
  );

  return { data: createdJobs, ...rest };
}

export function useAvailableJobs() {
  const { address } = useWallet();
  const { data: allJobs = [], ...rest } = useAllJobs();

  const availableJobs = allJobs.filter(job =>
    job.status === JOB_STATUS.OPEN && job.creator.toLowerCase() !== address?.toLowerCase()
  );

  return { data: availableJobs, ...rest };
}

export function useAssignedJobs() {
  const { address } = useWallet();
  const { data: allJobs = [], ...rest } = useAllJobs();

  const assignedJobs = allJobs.filter(job =>
    job.selectedFreelancer?.toLowerCase() === address?.toLowerCase() &&
    (job.status === JOB_STATUS.IN_PROGRESS || job.status === JOB_STATUS.WORK_SUBMITTED)
  );

  return { data: assignedJobs, ...rest };
}

export function useBid(jobId: number | null, freelancer: string | null) {
  return useQuery({
    queryKey: ['bid', jobId, freelancer],
    queryFn: () => (jobId !== null && freelancer !== null) ? getBid(jobId, freelancer) : null,
    enabled: jobId !== null && freelancer !== null,
    staleTime: 30000,
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

export function useTransactions() {
  const { address } = useWallet();
  return useQuery({
    queryKey: ['transactions', address],
    queryFn: () => address ? getUserTransactions(address) : [],
    enabled: !!address,
    staleTime: 30000,
  });
}
