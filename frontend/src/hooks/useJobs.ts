import { useQuery } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import { fetchCallReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { Cl } from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'trustwork-marketplace';
const NETWORK = STACKS_TESTNET;

export interface Job {
    id: number;
    creator: string;
    title: string;
    description: string;
    budget: number;
    deadline: number;
    status: number;
    selectedFreelancer?: string;
    workSubmittedBy?: string;
    workDescription?: string;
    createdAt: number;
    category: string;
}

export interface Bid {
    jobId: number;
    freelancer: string;
    bidAmount: number;
    proposal: string;
    bidStatus: number;
    submittedAt: number;
}

// Status constants
const JOB_OPEN = 1;
const JOB_IN_PROGRESS = 2;
const JOB_WORK_SUBMITTED = 3;
const JOB_COMPLETED = 4;
const JOB_DISPUTED = 5;
const JOB_CANCELLED = 6;

const BID_PENDING = 1;
const BID_ACCEPTED = 2;
const BID_REJECTED = 3;
const BID_WITHDRAWN = 4;

// Fetch single job
async function getJobById(jobId: number): Promise<Job | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-job',
            functionArgs: [Cl.uint(jobId)],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        if (!result || (result as any).type === 9) return null;

        const data = cvToValue(result) as Record<string, unknown> | null;
        if (!data) return null;

        return {
            id: jobId,
            creator: (data.creator as string) || '',
            title: (data.title as string) || '',
            description: (data.description as string) || '',
            budget: Number(data.budget || 0),
            deadline: Number(data.deadline || 0),
            status: Number(data.status || 0),
            selectedFreelancer: data['selected-freelancer'] as string | undefined,
            workSubmittedBy: data['work-submitted-by'] as string | undefined,
            workDescription: data['work-description'] as string | undefined,
            createdAt: Number(data['created-at'] || 0),
            category: (data.category as string) || '',
        };
    } catch (error) {
        console.error('Error fetching job:', error);
        return null;
    }
}

// Fetch all jobs
async function getAllJobs(): Promise<Job[]> {
    try {
        const totalResult = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-total-jobs',
            functionArgs: [],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        const totalVal = cvToValue(totalResult);
        const total = Number(totalVal || 0);
        const jobs: Job[] = [];

        for (let i = 0; i < total; i++) {
            const job = await getJobById(i);
            if (job) jobs.push(job);
        }

        return jobs;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

// Hook: Get all jobs
export function useAllJobs() {
    return useQuery({
        queryKey: ['all-jobs'],
        queryFn: getAllJobs,
        refetchInterval: 30000,
        staleTime: 10000,
    });
}

// Hook: Get jobs where user is creator
export function useCreatedJobs() {
    const { address } = useWallet();
    const { data: allJobs = [], ...rest } = useAllJobs();

    const createdJobs = allJobs.filter(job =>
        job.creator.toLowerCase() === address?.toLowerCase()
    );

    return { data: createdJobs, ...rest };
}

// Hook: Get jobs where user can bid
export function useAvailableJobs() {
    const { address } = useWallet();
    const { data: allJobs = [], ...rest } = useAllJobs();

    const availableJobs = allJobs.filter(job =>
        job.status === JOB_OPEN && job.creator.toLowerCase() !== address?.toLowerCase()
    );

    return { data: availableJobs, ...rest };
}

// Hook: Get jobs where user is selected freelancer
export function useAssignedJobs() {
    const { address } = useWallet();
    const { data: allJobs = [], ...rest } = useAllJobs();

    const assignedJobs = allJobs.filter(job =>
        job.selectedFreelancer?.toLowerCase() === address?.toLowerCase() &&
        (job.status === JOB_IN_PROGRESS || job.status === JOB_WORK_SUBMITTED)
    );

    return { data: assignedJobs, ...rest };
}

// Hook: Get single job
export function useJob(jobId: number | null) {
    return useQuery({
        queryKey: ['job', jobId],
        queryFn: () => jobId !== null ? getJobById(jobId) : null,
        enabled: jobId !== null,
        refetchInterval: 30000,
    });
}

// Utility functions
export function formatUSDCx(amount: number): string {
    return (amount / 1e6).toFixed(6);
}

export function getJobStatusLabel(status: number): string {
    const labels: Record<number, string> = {
        1: 'Open',
        2: 'In Progress',
        3: 'Work Submitted',
        4: 'Completed',
        5: 'Disputed',
        6: 'Cancelled',
    };
    return labels[status] || 'Unknown';
}

export function getBidStatusLabel(status: number): string {
    const labels: Record<number, string> = {
        1: 'Pending',
        2: 'Accepted',
        3: 'Rejected',
        4: 'Withdrawn',
    };
    return labels[status] || 'Unknown';
}

export const JOB_STATUSES = {
    OPEN: JOB_OPEN,
    IN_PROGRESS: JOB_IN_PROGRESS,
    WORK_SUBMITTED: JOB_WORK_SUBMITTED,
    COMPLETED: JOB_COMPLETED,
    DISPUTED: JOB_DISPUTED,
    CANCELLED: JOB_CANCELLED,
};

export const BID_STATUSES = {
    PENDING: BID_PENDING,
    ACCEPTED: BID_ACCEPTED,
    REJECTED: BID_REJECTED,
    WITHDRAWN: BID_WITHDRAWN,
};
