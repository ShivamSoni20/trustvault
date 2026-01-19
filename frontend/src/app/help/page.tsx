'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Wallet, 
  FileCheck, 
  Send, 
  RefreshCw, 
  Scale,
  HelpCircle,
  MessageCircle,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const faqItems = [
  {
    question: 'What is an escrow?',
    answer: 'An escrow is a financial arrangement where a third party (in our case, a smart contract) holds and regulates the payment of funds between two parties. The funds are only released when all terms of the agreement have been met.',
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes! Your funds are held securely in a smart contract on the Stacks blockchain, which inherits security from Bitcoin. No single party can access the funds without following the agreed-upon rules.',
  },
  {
    question: 'How long does arbitration take?',
    answer: 'Dispute resolution typically takes 24-48 hours. Our arbitrators review all evidence submitted by both parties before making a fair decision.',
  },
  {
    question: 'Can I cancel an escrow?',
    answer: 'As a client, you can request a refund if work has not started. Once the freelancer has begun work, you would need to either release the funds, wait for the deadline, or initiate a dispute.',
  },
  {
    question: 'What happens if there\'s a dispute?',
    answer: 'If you initiate a dispute, an arbitrator will review the case. They can decide to: refund 100% to the client, release 100% to the freelancer, or split the funds 50/50.',
  },
  {
    question: 'What fees does TrustVault charge?',
    answer: 'TrustVault currently charges no platform fees on the testnet. You only pay the standard Stacks network transaction fees (typically a few cents).',
  },
  {
    question: 'How do I get USDCx?',
    answer: 'You can bridge USDC from Ethereum to Stacks using the official bridge. Visit the Stacks documentation for a step-by-step guide on bridging.',
  },
];

const guides = [
  {
    title: 'Getting Started',
    icon: Wallet,
    items: [
      { label: 'Connect Your Wallet', href: '#connect-wallet' },
      { label: 'Get USDCx Tokens', href: '#get-tokens' },
      { label: 'Create Your First Escrow', href: '#create-escrow' },
    ],
  },
  {
    title: 'For Clients',
    icon: FileCheck,
    items: [
      { label: 'Creating an Escrow', href: '#client-create' },
      { label: 'Releasing Funds', href: '#client-release' },
      { label: 'Requesting Refunds', href: '#client-refund' },
      { label: 'Initiating Disputes', href: '#client-dispute' },
    ],
  },
  {
    title: 'For Freelancers',
    icon: Send,
    items: [
      { label: 'Accepting Jobs', href: '#freelancer-accept' },
      { label: 'Marking Work Complete', href: '#freelancer-complete' },
      { label: 'Handling Disputes', href: '#freelancer-dispute' },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Find answers to common questions and learn how to use TrustVault effectively.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {guides.map((guide) => (
          <Card key={guide.title} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <guide.icon className="h-5 w-5 text-primary" />
                {guide.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {guide.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>

      <div className="mb-12" id="connect-wallet">
        <h2 className="text-2xl font-bold mb-6">How to Connect Your Wallet</h2>
        <Card>
          <CardContent className="py-6">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-medium">Install a Stacks Wallet</p>
                  <p className="text-slate-400 text-sm">Download Leather or Xverse wallet from their official websites.</p>
                  <div className="flex gap-2 mt-2">
                    <a href="https://leather.io" target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm" className="gap-1">
                        Leather <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                    <a href="https://www.xverse.app" target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm" className="gap-1">
                        Xverse <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-medium">Create or Import Account</p>
                  <p className="text-slate-400 text-sm">Set up your wallet with a new account or import an existing one.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-medium">Click "Connect Wallet" on TrustVault</p>
                  <p className="text-slate-400 text-sm">Use the button in the top-right corner of the page.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">4</span>
                <div>
                  <p className="font-medium">Approve the Connection</p>
                  <p className="text-slate-400 text-sm">Your wallet will ask you to approve the connection to TrustVault.</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12" id="get-tokens">
        <h2 className="text-2xl font-bold mb-6">How to Get USDCx Tokens</h2>
        <Card>
          <CardContent className="py-6">
            <p className="text-slate-300 mb-4">
              USDCx is a stablecoin on Stacks that is pegged to the US Dollar. To get USDCx for testing:
            </p>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0 text-background">1</span>
                <div>
                  <p className="font-medium">Get Testnet STX</p>
                  <p className="text-slate-400 text-sm">Use the Stacks testnet faucet to get free testnet STX tokens.</p>
                  <a href="https://explorer.hiro.so/sandbox/faucet?chain=testnet" target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" className="gap-1 mt-2">
                      Stacks Faucet <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0 text-background">2</span>
                <div>
                  <p className="font-medium">Bridge USDC (for mainnet)</p>
                  <p className="text-slate-400 text-sm">For mainnet, you can bridge USDC from Ethereum using the official bridge.</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
        <p className="text-slate-300 mb-6">
          Our support team is here to help you with any questions or issues.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Join Discord
            </Button>
          </a>
          <a href="mailto:support@trustvault.app">
            <Button className="gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-slate-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-slate-400">{answer}</p>
        </div>
      )}
    </div>
  );
}
