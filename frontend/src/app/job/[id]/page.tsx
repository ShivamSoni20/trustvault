'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useJob, formatUSDCx, getJobStatusLabel, JOB_STATUSES } from '@/hooks/useJobs';
import { useWallet } from '@/hooks/useWallet';
import { openContractCall } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';
import { Cl, ClarityValue } from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'trustwork-marketplace';

export default function JobDetailPage() {
    const { id } = useParams();
    const jobId = parseInt(id as string);
    const { address } = useWallet();
    const { data: job, isLoading, refetch } = useJob(jobId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [bidAmount, setBidAmount] = useState('');
    const [proposal, setProposal] = useState('');
    const [workDescription, setWorkDescription] = useState('');

    if (isLoading) return <div className="p-12 text-center">Loading job details...</div>;
    if (!job) return <div className="p-12 text-center">Job not found.</div>;

    const isCreator = address?.toLowerCase() === job.creator.toLowerCase();
    const isSelectedFreelancer = address?.toLowerCase() === job.selectedFreelancer?.toLowerCase();

    const handleAction = async (functionName: string, args: ClarityValue[]) => {
        setIsSubmitting(true);
        try {
            await openContractCall({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName,
                functionArgs: args,
                network: STACKS_TESTNET,
                onFinish: () => {
                    setIsSubmitting(false);
                    refetch();
                },
                onCancel: () => setIsSubmitting(false)
            });
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    const submitBid = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Math.floor(parseFloat(bidAmount) * 1000000);
        handleAction('submit-bid', [Cl.uint(jobId), Cl.uint(amount), Cl.stringUtf8(proposal)]);
    };

    const submitWork = (e: React.FormEvent) => {
        e.preventDefault();
        handleAction('submit-work', [Cl.uint(jobId), Cl.stringUtf8(workDescription)]);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-8 border-b">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${job.status === 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {getJobStatusLabel(job.status)}
                            </span>
                            <h1 className="text-3xl font-bold">{job.title}</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{formatUSDCx(job.budget)} USDCx</p>
                            <p className="text-sm text-gray-500">Fixed Price</p>
                        </div>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <strong>Category:</strong> {job.category}
                        </div>
                        <div className="flex items-center gap-1">
                            <strong>Posted:</strong> {job.createdAt} (Block)
                        </div>
                        <div className="flex items-center gap-1">
                            <strong>Deadline:</strong> {job.deadline} (Block)
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-bold mb-4">Description</h2>
                    <p className="text-gray-700 whitespace-pre-wrap mb-8">{job.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
                        <div>
                            <h3 className="font-bold mb-2">Client</h3>
                            <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">{job.creator}</p>
                        </div>
                        {job.selectedFreelancer && (
                            <div>
                                <h3 className="font-bold mb-2">Freelancer</h3>
                                <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">{job.selectedFreelancer}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Sections */}
            {!isCreator && job.status === JOB_STATUSES.OPEN && (
                <div className="bg-white border rounded-xl p-8 shadow-sm mb-8">
                    <h2 className="text-2xl font-bold mb-6">Submit Your Bid</h2>
                    <form onSubmit={submitBid} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Bid Amount (USDCx)</label>
                            <input
                                type="number" step="0.000001" required
                                className="w-full px-4 py-2 border rounded-lg"
                                value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Proposal</label>
                            <textarea
                                required rows={4}
                                className="w-full px-4 py-2 border rounded-lg"
                                value={proposal} onChange={e => setProposal(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                        </button>
                    </form>
                </div>
            )}

            {isSelectedFreelancer && job.status === JOB_STATUSES.IN_PROGRESS && (
                <div className="bg-white border rounded-xl p-8 shadow-sm mb-8">
                    <h2 className="text-2xl font-bold mb-6">Submit Your Work</h2>
                    <form onSubmit={submitWork} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Work Description / Links</label>
                            <textarea
                                required rows={4}
                                className="w-full px-4 py-2 border rounded-lg"
                                value={workDescription} onChange={e => setWorkDescription(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Work'}
                        </button>
                    </form>
                </div>
            )}

            {isCreator && job.status === JOB_STATUSES.WORK_SUBMITTED && (
                <div className="bg-white border rounded-xl p-8 shadow-sm mb-8">
                    <h2 className="text-2xl font-bold mb-4">Review Work</h2>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="font-bold mb-2">Freelancer Submission:</h3>
                        <p className="text-gray-700">{job.workDescription}</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleAction('approve-work', [Cl.uint(jobId)])}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                        >
                            Approve & Release Funds
                        </button>
                        <button
                            onClick={() => handleAction('reject-work', [Cl.uint(jobId), Cl.stringUtf8('Work needs improvement')])}
                            className="flex-1 bg-red-100 text-red-600 py-3 rounded-lg font-bold hover:bg-red-200"
                        >
                            Request Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
