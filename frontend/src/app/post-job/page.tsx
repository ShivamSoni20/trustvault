'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { useMarketplaceActions } from '@/hooks/useMarketplaceActions';
import { useBlockHeight } from '@/hooks/useJobs';
import { CATEGORIES } from '@/utils/constants';
import { dateToBlockHeight } from '@/utils/formatters';
import { FiPlusSquare, FiInfo, FiChevronLeft, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PostJobPage() {
  const router = useRouter();
  const { isConnected, connectWallet } = useWallet();
  const { postJob } = useMarketplaceActions();
  const { data: currentBlockHeight = 0 } = useBlockHeight();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadlineDate: '',
    category: CATEGORIES[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !formData.deadlineDate) return;

    setIsSubmitting(true);
    try {
      const budgetNum = parseFloat(formData.budget);
      const deadlineBlock = dateToBlockHeight(new Date(formData.deadlineDate), currentBlockHeight);
      
      await postJob(
        formData.title,
        formData.description,
        budgetNum,
        deadlineBlock,
        formData.category
      );
      
      router.push('/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="glass-card p-12 text-center flex flex-col items-center gap-6 animate-reveal">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
            <FiPlusSquare className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold">Start Your Project</h2>
          <p className="text-slate-400 max-w-md">Connect your wallet to post a new job and fund its escrow with USDCx.</p>
          <button onClick={connectWallet} className="btn-primary mt-4">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
      <Link href="/jobs" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors w-fit">
        <FiChevronLeft /> Back to Marketplace
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold">Post a New Job</h1>
        <p className="text-slate-400 italic">Define your requirements and lock the budget to attract top talent.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-reveal">
        <div className="glass-card p-8 flex flex-col gap-8">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300 font-mono uppercase tracking-widest">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Design a high-converting landing page"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-emerald-500/50 transition-colors"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300 font-mono uppercase tracking-widest">Detailed Description</label>
            <textarea
              required
              rows={6}
              placeholder="Describe the project goals, deliverables, and specific skills needed..."
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Budget */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300 font-mono uppercase tracking-widest">Budget (USDCx)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-lg focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300 font-mono uppercase tracking-widest">Category</label>
              <select
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-lg focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0a0a0c]">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300 font-mono uppercase tracking-widest">Expiration Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-lg focus:outline-none focus:border-emerald-500/50 transition-colors font-mono appearance-none"
                value={formData.deadlineDate}
                onChange={e => setFormData({ ...formData, deadlineDate: e.target.value })}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-tighter">
              Current Block Height: {currentBlockHeight} • Approx. 144 blocks per day
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex gap-4">
          <FiInfo className="text-emerald-500 w-6 h-6 flex-shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-emerald-100 font-semibold">Security Confirmation</p>
            <p className="text-xs text-emerald-400 leading-relaxed">
              By posting this job, the specified budget will be transferred from your wallet to the marketplace smart contract. 
              The funds remain securely locked until you approve the work or a dispute is resolved. You can cancel and refund anytime before a freelancer is selected.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "btn-primary w-full py-5 text-xl tracking-tight shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? 'Confirming Transaction...' : 'Post Job & Fund Escrow'}
        </button>
      </form>
    </div>
  );
}
