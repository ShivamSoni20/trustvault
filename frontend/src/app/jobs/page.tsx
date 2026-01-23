'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAvailableJobs, useCreatedJobs, useAssignedJobs } from '@/hooks/useJobs';
import { useWallet } from '@/hooks/useWallet';
import { formatUSDCx, truncateAddress, getStatusLabel } from '@/utils/formatters';
import { JOB_STATUS, STATUS_COLORS } from '@/utils/constants';
import { FiPlus, FiGrid, FiBriefcase, FiCheckCircle, FiSearch, FiFilter, FiArrowRight } from 'react-icons/fi';
import { cn } from '@/lib/utils';

type TabType = 'available' | 'created' | 'assigned';

export default function JobsPage() {
  const { isConnected, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('available');

  const availableJobs = useAvailableJobs();
  const createdJobs = useCreatedJobs();
  const assignedJobs = useAssignedJobs();

  const activeData = activeTab === 'available' ? availableJobs :
                     activeTab === 'created' ? createdJobs :
                     assignedJobs;

  const { data: jobs = [], isLoading } = activeData;

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="glass-card p-12 text-center flex flex-col items-center gap-6 animate-reveal">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
            <FiGrid className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold">Access the Marketplace</h2>
          <p className="text-slate-400 max-w-md">Connect your wallet to browse available jobs, track your bids, and manage your assignments.</p>
          <button onClick={connectWallet} className="btn-primary mt-4">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-bold mb-2">Marketplace</h1>
          <p className="text-slate-400 italic">Discover high-quality work or manage your existing projects.</p>
        </div>
        <Link href="/post-job" className="btn-primary group">
          <FiPlus className="inline-block mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-2">
        <div className="flex gap-2">
          {[
            { id: 'available', label: 'Available', icon: FiGrid, count: availableJobs.data?.length },
            { id: 'created', label: 'My Postings', icon: FiPlus, count: createdJobs.data?.length },
            { id: 'assigned', label: 'My Assignments', icon: FiBriefcase, count: assignedJobs.data?.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all font-medium text-sm border-b-2",
                activeTab === tab.id
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500"
                  : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="ml-1 opacity-50 font-mono">({tab.count || 0})</span>
            </button>
          ))}
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button className="btn-secondary py-2 px-4 flex items-center gap-2">
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Jobs Content */}
      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-48 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-24 text-center flex flex-col items-center gap-4 border-dashed animate-reveal">
          <p className="text-xl text-slate-500 italic">No jobs found in this section.</p>
          {activeTab === 'available' && (
            <Link href="/post-job" className="text-emerald-500 hover:underline">
              Be the first to create an opportunity
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 animate-reveal">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-8 group hover:border-emerald-500/30 transition-all hover:bg-emerald-500/[0.01]">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                      {job.category}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold",
                      STATUS_COLORS[job.status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    )}>
                      {job.statusLabel}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors mb-2">
                      <Link href={`/job/${job.id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm items-center mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Budget</span>
                      <span className="text-xl font-bold text-white font-mono">{job.budget} USDCx</span>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Client</span>
                      <span className="text-slate-300">{truncateAddress(job.creator)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto md:items-end">
                  <Link href={`/job/${job.id}`} className="btn-primary py-3 px-8 text-center group/btn">
                    View Details
                    <FiArrowRight className="inline-block ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <span className="text-xs text-slate-500 font-mono text-center md:text-right">
                    ID: #{job.id} • Posted at Block {job.createdAt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
