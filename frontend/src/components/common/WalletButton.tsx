'use client';

import { useState } from 'react';
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress, copyToClipboard, getExplorerUrl } from '@/utils/formatters';
import { useUIStore } from '@/store/uiStore';

export function WalletButton() {
  const { address, isConnected, balance, connectWallet, disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useUIStore();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
      addToast({
        type: 'success',
        title: 'Wallet Connected',
        message: 'Successfully connected to your wallet',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to connect wallet. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      await copyToClipboard(address);
      addToast({
        type: 'success',
        title: 'Address Copied',
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsOpen(false);
    addToast({
      type: 'info',
      title: 'Wallet Disconnected',
    });
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        isLoading={isLoading}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-surface hover:bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 transition-colors"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="font-medium">{truncateAddress(address!)}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Connected Account</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
            
            <div className="p-4 border-b border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Balance</p>
              <p className="text-lg font-semibold">{balance.toFixed(6)} STX</p>
            </div>

            <div className="p-2">
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Copy className="h-4 w-4 text-slate-400" />
                <span>Copy Address</span>
              </button>
              
              <a
                href={getExplorerUrl('address', address!)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-slate-400" />
                <span>View on Explorer</span>
              </a>
              
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
