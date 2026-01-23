'use client';

import { useAssignedJobs } from '@/hooks/useJobs';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';
import { FiBriefcase, FiArrowRight, FiCheckCircle, FiClock, FiSearch } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export default function BidsPage() {
  const { isConnected, connectWallet } = useWallet();
  const { data: assignments = [], isLoading } = useAssignedJobs();
  
  // Note: Finding all pending bids by user is limited without indexer.
  // We show assignments as the primary freelancer portal view.

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="glass-card p-12 text-center flex flex-col items-center gap-6 animate-reveal">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
            <FiBriefcase className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold">Freelancer Portal</h2>
          <p className="text-slate-400 max-w-md">Connect your wallet to track your assignments, submit work, and manage your earnings.</p>
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
          <h1 className="text-5xl font-bold mb-2">Freelancer Portal</h1>
          <p className="text-slate-400 italic">Manage your active contracts and submitted work.</p>
        </div>
        <Link href="/jobs" className="btn-secondary group">
          <FiSearch className="inline-block mr-2" />
          Find New Work
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-4 border-indigo-500/20">
            <h3 className="text-lg font-bold">Freelancer Stats</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Active Jobs</span>
                <span className="text-white font-mono">{assignments.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Completed</span>
                <span className="text-white font-mono">0</span>
              </div>
              <div className="w-full h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-slate-500 tracking-widest font-mono">Total Earned</span>
                <span className="text-lg font-bold text-emerald-500 font-mono">0 USDCx</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/10">
            <p className="text-xs text-indigo-300 leading-relaxed">
              <FiClock className="inline mr-1 mb-0.5" /> 
              Remember to submit your work within the deadline block to avoid auto-cancellation or disputes.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 flex flex-col gap-6 animate-reveal">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FiCheckCircle className="text-emerald-500" /> Active Assignments
          </h2>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2].map(i => <div key={i} className="glass-card h-40 animate-pulse" />)}
            </div>
          ) : assignments.length === 0 ? (
            <div className="glass-card p-20 text-center flex flex-col items-center gap-4">
              <p className="text-slate-500 italic">You don&apos;t have any active assignments.</p>
              <Link href="/jobs" className="btn-primary py-2 px-6 text-sm">Browse Jobs</Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {assignments.map(job => (
                <div key={job.id} className="glass-card p-8 group hover:bg-white/[0.04] transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold", STATUS_COLORS[job.status])}>
                        {job.statusLabel}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">#{job.id}</span>
                    </div>
                    <h3 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors mb-2">{job.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 italic">Client: {truncateAddress(job.creator)}</p>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white font-mono">{job.budget} USDCx</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono text-right">Payment</div>
                    </div>
                    <Link href={`/job/${job.id}`} className="btn-secondary py-2 px-6 flex items-center gap-2 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">
                      Manage <FiArrowRight />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

