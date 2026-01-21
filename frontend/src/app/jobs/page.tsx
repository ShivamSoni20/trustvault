'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAvailableJobs, useCreatedJobs, useAssignedJobs, formatUSDCx, getJobStatusLabel } from '@/hooks/useJobs';
import { useWallet } from '@/hooks/useWallet';

export default function JobsPage() {
    const { isConnected } = useWallet();
    const [activeTab, setActiveTab] = useState<'available' | 'created' | 'assigned'>('available');

    const availableJobs = useAvailableJobs();
    const createdJobs = useCreatedJobs();
    const assignedJobs = useAssignedJobs();

    const activeData = activeTab === 'available' ? availableJobs :
        activeTab === 'created' ? createdJobs :
            assignedJobs;

    const { data: jobs = [], isLoading } = activeData;

    if (!isConnected) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
                    <p className="text-gray-700 mb-6">Connect to view jobs</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p>Loading jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Jobs</h1>
                <Link href="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Post Job
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('available')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'available' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Available ({availableJobs.data?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('created')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'created' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    My Jobs ({createdJobs.data?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('assigned')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'assigned' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Assigned ({assignedJobs.data?.length || 0})
                </button>
            </div>

            {/* Jobs Grid */}
            {jobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-600 mb-4">No jobs found in this category</p>
                    {activeTab === 'available' && (
                        <Link href="/post-job" className="text-blue-600 hover:underline">
                            Be the first to post a job
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-1 hover:text-blue-600 transition">
                                        <Link href={`/job/${job.id}`}>{job.title}</Link>
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">{formatUSDCx(job.budget)} USDCx</span>
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">{job.category}</span>
                                        <span className="text-gray-500 py-1">ID: {job.id}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${job.status === 1 ? 'bg-green-100 text-green-800' :
                                        job.status === 2 ? 'bg-blue-100 text-blue-800' :
                                            job.status === 3 ? 'bg-purple-100 text-purple-800' :
                                                job.status === 4 ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                        {getJobStatusLabel(job.status)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <Link href={`/job/${job.id}`} className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1">
                                    View Details
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <div className="text-xs text-gray-400">
                                    Posted by {job.creator.substring(0, 6)}...{job.creator.substring(job.creator.length - 4)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
