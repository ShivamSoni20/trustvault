'use client';

import { useWallet } from '@/hooks/useWallet';
import { useAllJobs, getJobStatusLabel, formatUSDCx } from '@/hooks/useJobs';
import { openContractCall } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';
import { Cl } from '@stacks/transactions';
import Link from 'next/link';
import { useState } from 'react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'trustwork-marketplace';

export default function BidsPage() {
    const { address, isConnected } = useWallet();
    const { data: jobs = [], isLoading, refetch } = useAllJobs();
    const [isWithdrawing, setIsWithdrawing] = useState<number | null>(null);

    // In this simple version, we don't have a fetcher for "my bids" specifically without knowing the job IDs.
    // We'll filter from all jobs if they have status info or just show jobs where user might have bid.
    // Actually, we should ideally have a more efficient way, but for now we'll iterate.

    // NOTE: This implementation is limited because 'get-bid' requires jobId and address.
    // To show "My Bids", we'd ideally have an index.
    // For now, let's just show jobs where the user is the selected freelancer or just the assigned jobs.

    const assignedJobs = jobs.filter(j => j.selectedFreelancer?.toLowerCase() === address?.toLowerCase());

    const handleWithdraw = async (jobId: number) => {
        setIsWithdrawing(jobId);
        try {
            await openContractCall({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'withdraw-bid',
                functionArgs: [Cl.uint(jobId)],
                network: STACKS_TESTNET,
                onFinish: () => {
                    setIsWithdrawing(null);
                    refetch();
                },
                onCancel: () => setIsWithdrawing(null)
            });
        } catch (e) {
            console.error(e);
            setIsWithdrawing(null);
        }
    };

    if (!isConnected) return <div className="p-12 text-center text-xl">Please connect wallet.</div>;
    if (isLoading) return <div className="p-12 text-center">Loading bids...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Bids & Assignments</h1>

            {assignedJobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-gray-500 mb-4">No active assignments found.</p>
                    <Link href="/jobs" className="text-blue-600 font-bold hover:underline">Find Jobs to Bid On</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignedJobs.map(job => (
                        <div key={job.id} className="bg-white border rounded-xl p-6 shadow-sm flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">{job.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">Budget: {formatUSDCx(job.budget)} USDCx</p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">
                                        {getJobStatusLabel(job.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href={`/job/${job.id}`}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                >
                                    View Job
                                </Link>
                                {job.status === 1 && (
                                    <button
                                        onClick={() => handleWithdraw(job.id)}
                                        disabled={isWithdrawing === job.id}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                                    >
                                        {isWithdrawing === job.id ? 'Withdrawing...' : 'Withdraw Bid'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
