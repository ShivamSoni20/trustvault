'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useJob, useBid, useBlockHeight } from '@/hooks/useJobs';
import { useWallet } from '@/hooks/useWallet';
import { useMarketplaceActions } from '@/hooks/useMarketplaceActions';
import { formatUSDCx, truncateAddress, formatDate } from '@/utils/formatters';
import { JOB_STATUS, BID_STATUSES, STATUS_COLORS } from '@/utils/constants';
import { 
  FiChevronLeft, FiClock, FiDollarSign, FiUser, FiTag, 
  FiSend, FiCheckCircle, FiAlertCircle, FiFileText, FiArrowRight 
} from 'react-icons/fi';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const jobId = parseInt(id as string);
  const { address, isConnected } = useWallet();
  const { data: job, isLoading, refetch } = useJob(jobId);
  const { data: userBid } = useBid(jobId, address);
  const { data: currentBlockHeight = 0 } = useBlockHeight();
  const { submitBid, acceptBid, submitWork, approveWork, cancelJob } = useMarketplaceActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [proposal, setProposal] = useState('');
  const [workDesc, setWorkDesc] = useState('');

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-24 flex justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
      <h2 className="text-4xl font-bold mb-4">Job Not Found</h2>
      <Link href="/jobs" className="text-emerald-500 hover:underline">Back to Marketplace</Link>
    </div>
  );

  const isCreator = address?.toLowerCase() === job.creator.toLowerCase();
  const isSelectedFreelancer = address?.toLowerCase() === job.selectedFreelancer?.toLowerCase();
  const hasBid = !!userBid && userBid.bidStatus !== BID_STATUSES.WITHDRAWN;

  const handleAction = async (action: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await action();
      setTimeout(refetch, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
      <Link href="/jobs" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors w-fit">
        <FiChevronLeft /> Back to Marketplace
      </Link>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-card p-10 flex flex-col gap-8 animate-reveal">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs uppercase tracking-widest text-slate-400 font-mono">
                    {job.category}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-lg border text-xs uppercase tracking-widest font-bold",
                    STATUS_COLORS[job.status]
                  )}>
                    {job.statusLabel}
                  </span>
                </div>
                <h1 className="text-5xl font-bold tracking-tight">{job.title}</h1>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-4xl font-bold text-white font-mono">{job.budget} USDCx</div>
                <div className="text-sm text-slate-500 font-mono uppercase tracking-tighter">Fixed Budget</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/5 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-mono">Posted By</span>
                <span className="text-slate-200 truncate">{truncateAddress(job.creator)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-mono">Deadline Block</span>
                <span className="text-slate-200">{job.deadline}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-mono">Blocks Left</span>
                <span className="text-slate-200">{job.blocksRemaining}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-mono">Job ID</span>
                <span className="text-slate-200 font-mono">#{job.id}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold">Project Overview</h3>
              <p className="text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.workDescription && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 flex flex-col gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FiFileText className="text-emerald-500" /> Submitted Work
                </h3>
                <p className="text-slate-300 italic whitespace-pre-wrap">{job.workDescription}</p>
                <div className="text-xs text-slate-500 font-mono uppercase">
                  Submitted By: {truncateAddress(job.workSubmittedBy || '')}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="glass-card p-10 flex flex-col gap-8 animate-reveal stagger-1">
            <h3 className="text-2xl font-bold">Progress Timeline</h3>
            <div className="flex flex-col gap-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
              {[
                { step: "Job Posted", status: job.status >= 1, icon: FiPlusSquare },
                { step: "Freelancer Selected", status: job.status >= 2, icon: FiUser },
                { step: "Work Submitted", status: job.status >= 3, icon: FiSend },
                { step: "Payment Released", status: job.status >= 4, icon: FiCheckCircle },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-6 relative z-10">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                    s.status ? "bg-emerald-500 border-emerald-500 text-black" : "bg-[#0a0a0c] border-white/10 text-slate-500"
                  )}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    "font-bold text-lg",
                    s.status ? "text-white" : "text-slate-600"
                  )}>{s.step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="flex flex-col gap-8 animate-reveal stagger-2">
          {/* Action Card */}
          <div className="glass-card p-8 flex flex-col gap-6 border-emerald-500/20 shadow-[0_20px_40px_-20px_rgba(16,185,129,0.2)]">
            <h3 className="text-xl font-bold border-b border-white/5 pb-4">Job Actions</h3>
            
            {!isConnected ? (
              <button onClick={connectWallet} className="btn-primary w-full py-4">Connect Wallet</button>
            ) : isCreator ? (
              <div className="flex flex-col gap-4">
                {job.status === JOB_STATUS.OPEN && (
                  <>
                    <p className="text-sm text-slate-400 italic">Waiting for bids from freelancers. You can cancel this job anytime before accepting a bid.</p>
                    <button 
                      onClick={() => handleAction(() => cancelJob(jobId))} 
                      disabled={isSubmitting}
                      className="btn-secondary text-rose-500 border-rose-500/20 hover:bg-rose-500/10"
                    >
                      Cancel Job & Refund
                    </button>
                  </>
                )}
                
                {job.status === JOB_STATUS.WORK_SUBMITTED && (
                  <>
                    <p className="text-sm text-slate-400">Freelancer has submitted the work. Please review it carefully before approving.</p>
                    <button 
                      onClick={() => handleAction(() => approveWork(jobId, job.budget))} 
                      disabled={isSubmitting}
                      className="btn-primary w-full py-4 text-glow-emerald"
                    >
                      Approve & Release Funds
                    </button>
                    <button className="text-sm text-rose-500 hover:underline">Raise a Dispute</button>
                  </>
                )}

                {job.status === JOB_STATUS.COMPLETED && (
                  <div className="text-center p-4 bg-emerald-500/10 rounded-xl">
                    <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Project Completed</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {job.status === JOB_STATUS.OPEN && (
                  <>
                    {hasBid ? (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs uppercase font-mono text-indigo-400">Your Active Bid</span>
                          <span className="px-2 py-0.5 bg-indigo-500 text-black text-[10px] font-bold rounded">PENDING</span>
                        </div>
                        <div className="text-2xl font-bold font-mono">{Number(userBid.bidAmount) / 1_000_000} USDCx</div>
                        <p className="text-xs text-slate-400 line-clamp-3 italic">"{userBid.proposal}"</p>
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); handleAction(() => submitBid(jobId, parseFloat(bidAmount), proposal)); }} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Your Quote (USDCx)</label>
                          <input 
                            type="number" step="0.01" required placeholder="0.00"
                            className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                            value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Proposal</label>
                          <textarea 
                            required rows={4} placeholder="Why are you the best for this job?"
                            className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm resize-none"
                            value={proposal} onChange={e => setProposal(e.target.value)}
                          />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4">Submit Proposal</button>
                      </form>
                    )}
                  </>
                )}

                {isSelectedFreelancer && job.status === JOB_STATUS.IN_PROGRESS && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-sm text-blue-400 font-bold mb-1">Status: Active Assignment</p>
                      <p className="text-xs text-slate-400 leading-relaxed">You have been selected! Complete the work and submit the description/links here.</p>
                    </div>
                    <textarea 
                      required rows={4} placeholder="Submission description, links to work, or IPFS hashes..."
                      className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm resize-none"
                      value={workDesc} onChange={e => setWorkDesc(e.target.value)}
                    />
                    <button 
                      onClick={() => handleAction(() => submitWork(jobId, workDesc))} 
                      disabled={isSubmitting}
                      className="btn-primary w-full py-4"
                    >
                      Submit Completed Work
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="glass-card p-6 flex items-start gap-4">
            <FiAlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-indigo-100">Marketplace Tip</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Always use decentralized storage for files and include the hashes in your work submission. Trustless payments rely on clear evidence!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
