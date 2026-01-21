'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { openContractCall } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';
import { Cl } from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST30TRK58DT4P8CJQ8Y9D539X1VET78C63BNF0C9A';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'trustwork-marketplace';

export default function PostJobPage() {
    const router = useRouter();
    const { isConnected } = useWallet();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: 'Web Development'
    });

    const categories = [
        'Web Development',
        'Mobile Apps',
        'Design',
        'Writing',
        'Marketing',
        'AI/ML',
        'Blockchain',
        'Other'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) return;

        setIsSubmitting(true);

        try {
            // Calculate microUSDCx (budget * 10^6)
            const budgetInMicro = Math.floor(parseFloat(formData.budget) * 1000000);
            // Deadline as block height (simple approximation: current height + (days * 144))
            const deadlineBlocks = parseInt(formData.deadline);

            await openContractCall({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'post-job',
                functionArgs: [
                    Cl.stringUtf8(formData.title),
                    Cl.stringUtf8(formData.description),
                    Cl.uint(budgetInMicro),
                    Cl.uint(deadlineBlocks),
                    Cl.stringUtf8(formData.category)
                ],
                network: STACKS_TESTNET,
                onFinish: (data) => {
                    console.log('Transaction sent:', data.txId);
                    setIsSubmitting(false);
                    router.push('/jobs');
                },
                onCancel: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error posting job:', error);
            setIsSubmitting(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
                <p className="text-gray-600 mb-6">Please connect your wallet to post a job.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
                <p className="text-gray-600">Fill in the details below to find the best freelancer for your task.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-8 shadow-sm">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="e.g. Build a landing page for my DApp"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={5}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Describe the project requirements, deliverables, and expectations..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USDCx)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.000001"
                                    required
                                    className="w-full pl-4 pr-16 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="0.00"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                />
                                <span className="absolute right-4 top-2 text-gray-400 font-medium">USDCx</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Block Height)</label>
                        <input
                            type="number"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="e.g. 150000"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        />
                        <p className="mt-1 text-xs text-gray-400">Provide the Stacks block height when this job should expire.</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-800">
                            Posting a job will lock your budget in the marketplace escrow. Funds will only be released to the freelancer upon your approval.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-lg font-bold text-white transition ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {isSubmitting ? 'Processing Transaction...' : 'Post Job & Fund Escrow'}
                    </button>
                </div>
            </form>
        </div>
    );
}
