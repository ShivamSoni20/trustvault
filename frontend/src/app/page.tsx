'use client';

import Link from 'next/link';
import { useAllJobs, useContractStats } from '@/hooks/useJobs';
import { formatUSDCx, truncateAddress } from '@/utils/formatters';
import { JOB_STATUS } from '@/utils/constants';
import { FiArrowRight, FiBriefcase, FiShield, FiZap, FiCheckCircle } from 'react-icons/fi';

export default function LandingPage() {
  const { data: jobs = [], isLoading: jobsLoading } = useAllJobs();
  const { data: stats } = useContractStats();

  const featuredJobs = jobs.filter(j => j.status === JOB_STATUS.OPEN).slice(0, 3);

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="animate-reveal stagger-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live on Stacks Testnet
          </div>
          
          <h1 className="animate-reveal stagger-2 text-6xl md:text-8xl font-bold max-w-4xl leading-[1.1]">
            The Trustless Bridge for <span className="text-emerald-500 text-glow-emerald italic font-serif">Global Talent</span>
          </h1>
          
          <p className="animate-reveal stagger-3 text-xl text-slate-400 max-w-2xl leading-relaxed">
            TrustWork is a decentralized marketplace where work is secured by Bitcoin-finality escrow and paid in USDCx stablecoins.
          </p>
          
          <div className="animate-reveal stagger-4 flex flex-wrap justify-center gap-4 mt-4">
            <Link href="/post-job" className="btn-primary group">
              Post a Job 
              <FiArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/jobs" className="btn-secondary">
              Browse Opportunities
            </Link>
          </div>

          <div className="animate-reveal stagger-4 flex gap-12 mt-12 text-sm text-slate-500 uppercase tracking-widest font-mono">
            <div>
              <div className="text-2xl text-white font-sans font-bold mb-1">{stats?.totalJobs || 0}+</div>
              Jobs Posted
            </div>
            <div>
              <div className="text-2xl text-white font-sans font-bold mb-1">{formatUSDCx(stats?.totalValueLocked || 0)}</div>
              USDCx Locked
            </div>
            <div>
              <div className="text-2xl text-white font-sans font-bold mb-1">{stats?.completedJobs || 0}</div>
              Paid Out
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <FiShield className="text-emerald-500 w-8 h-8" />,
              title: "Escrow Protection",
              desc: "Payments are locked in smart contracts until work is approved. No middleman, no chargebacks."
            },
            {
              icon: <FiZap className="text-indigo-500 w-8 h-8" />,
              title: "Auto-Release",
              desc: "Freelancers get paid automatically after 7 days if the client goes silent. Built-in fairness."
            },
            {
              icon: <FiBriefcase className="text-amber-500 w-8 h-8" />,
              title: "Transparent Bidding",
              desc: "Review proposals, negotiate rates, and select the best talent with on-chain reputation."
            }
          ].map((f, i) => (
            <div key={i} className="glass-card p-8 hover:bg-white/[0.05] transition-colors group">
              <div className="mb-6 p-3 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-2xl mb-4">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl mb-4">Latest Opportunities</h2>
            <p className="text-slate-400 italic">Fresh jobs from the TrustWork community.</p>
          </div>
          <Link href="/jobs" className="text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-2">
            View All Jobs <FiArrowRight />
          </Link>
        </div>

        <div className="grid gap-6">
          {jobsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-card h-32 animate-pulse" />
            ))
          ) : featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <Link key={job.id} href={`/job/${job.id}`} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-emerald-500/30 transition-all hover:bg-emerald-500/[0.02] group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                      {job.category}
                    </span>
                    <span className="text-slate-500 text-sm">{truncateAddress(job.creator)}</span>
                  </div>
                  <h3 className="text-xl group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white font-mono">{job.budget} USDCx</div>
                    <div className="text-xs text-slate-500">Budget</div>
                  </div>
                  <div className="btn-secondary py-2 px-4 text-sm group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-500 transition-all">
                    View Details
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="glass-card p-12 text-center text-slate-500 italic">
              No jobs currently open. Be the first to post one!
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-emerald-500/5 py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl text-center mb-16">The TrustWork Lifecycle</h2>
          <div className="grid md:grid-cols-4 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-white/10 -z-10" />
            {[
              { step: "01", title: "Post Job", desc: "Clients post job & lock budget in escrow." },
              { step: "02", title: "Bid & Select", desc: "Freelancers bid & client accepts the best." },
              { step: "03", title: "Ship Work", desc: "Freelancer submits work description." },
              { step: "04", title: "Release", desc: "Client approves & payment releases instantly." }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0a0a0c] border-2 border-emerald-500 flex items-center justify-center text-emerald-500 font-bold font-mono">
                  {s.step}
                </div>
                <h4 className="text-lg">{s.title}</h4>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
