'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCreatedJobs, useAssignedJobs, useTransactions, useContractStats } from '@/hooks/useJobs';
import { useWallet } from '@/hooks/useWallet';
import { formatUSDCx, truncateAddress } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';
import { 
  FiPlus, FiGrid, FiBriefcase, FiCheckCircle, 
  FiClock, FiDollarSign, FiArrowUpRight, FiArrowRight
} from 'react-icons/fi';
import { cn } from '@/lib/utils';

type DashboardTab = 'my-jobs' | 'assignments' | 'transactions';

export default function DashboardPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<DashboardTab>('my-jobs');

  const { data: myJobs = [], isLoading: myJobsLoading } = useCreatedJobs();
  const { data: assignments = [], isLoading: assignmentsLoading } = useAssignedJobs();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  
  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="glass-card p-12 text-center flex flex-col items-center gap-6 animate-reveal">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
            <FiBriefcase className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold">Personal Dashboard</h2>
          <p className="text-slate-400 max-w-md">Connect your wallet to manage your postings, track work, and see your transaction history.</p>
          <button onClick={connectWallet} className="btn-primary mt-4">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const isLoading = myJobsLoading || assignmentsLoading || txLoading;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-bold mb-2">My Dashboard</h1>
          <p className="text-slate-400 italic">Welcome back, {truncateAddress(address || '')}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/post-job" className="btn-primary group">
            <FiPlus className="inline-block mr-2" />
            Post New Job
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Total Postings', value: myJobs.length, icon: FiGrid, color: 'text-emerald-500' },
          { label: 'Active Assignments', value: assignments.length, icon: FiBriefcase, color: 'text-indigo-500' },
          { label: 'Completed', value: myJobs.filter(j => j.status === 4).length, icon: FiCheckCircle, color: 'text-emerald-400' },
          { label: 'Transactions', value: transactions.length, icon: FiClock, color: 'text-slate-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-6 group hover:bg-white/[0.05] transition-all">
            <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", s.color)}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{s.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex gap-2 border-b border-white/5">
          {[
            { id: 'my-jobs', label: 'My Posted Jobs', icon: FiGrid },
            { id: 'assignments', label: 'My Assignments', icon: FiBriefcase },
            { id: 'transactions', label: 'Recent Activity', icon: FiClock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 rounded-t-xl transition-all font-medium text-sm border-b-2",
                activeTab === tab.id
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500"
                  : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-reveal">
          {isLoading ? (
            <div className="glass-card p-24 flex justify-center">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : activeTab === 'my-jobs' ? (
            <div className="grid gap-4">
              {myJobs.length === 0 ? (
                <div className="glass-card p-20 text-center italic text-slate-500">You haven't posted any jobs yet.</div>
              ) : (
                myJobs.map(job => (
                  <Link key={job.id} href={`/job/${job.id}`} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/[0.04] transition-all group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold", STATUS_COLORS[job.status])}>
                          {job.statusLabel}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">#{job.id}</span>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xl font-bold text-white font-mono">{job.budget} USDCx</div>
                        <div className="text-[10px] text-slate-500 uppercase">Budget</div>
                      </div>
                      <FiArrowRight className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : activeTab === 'assignments' ? (
            <div className="grid gap-4">
              {assignments.length === 0 ? (
                <div className="glass-card p-20 text-center italic text-slate-500">No active assignments. Browse the marketplace to find work!</div>
              ) : (
                assignments.map(job => (
                  <Link key={job.id} href={`/job/${job.id}`} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/[0.04] transition-all group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold", STATUS_COLORS[job.status])}>
                          {job.statusLabel}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">#{job.id}</span>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xl font-bold text-white font-mono">{job.budget} USDCx</div>
                        <div className="text-[10px] text-slate-500 uppercase">Contract Value</div>
                      </div>
                      <FiArrowRight className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="px-6 py-4 font-mono uppercase tracking-widest text-slate-500 text-[10px]">Type</th>
                      <th className="px-6 py-4 font-mono uppercase tracking-widest text-slate-500 text-[10px]">Status</th>
                      <th className="px-6 py-4 font-mono uppercase tracking-widest text-slate-500 text-[10px]">Date</th>
                      <th className="px-6 py-4 font-mono uppercase tracking-widest text-slate-500 text-[10px] text-right">Explorer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-20 text-center italic text-slate-500">No recent activity found.</td></tr>
                    ) : (
                      transactions.map(tx => (
                        <tr key={tx.txId} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-200 capitalize">{tx.type.replace('-', ' ')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              tx.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" : 
                              tx.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                            )}>{tx.status}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <a href={`https://explorer.hiro.so/txid/${tx.txId}?chain=testnet`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400">
                              <FiArrowUpRight className="inline-block" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
