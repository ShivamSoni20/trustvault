'use client';

import { useEffect, useCallback, useState } from 'react';
import { connect, isConnected, disconnect, getLocalStorage } from '@stacks/connect';
import { useWalletStore } from '@/store/walletStore';
import { getUserBalance } from '@/services/apiService';

export function useWallet() {
  const { address, isConnected: storeConnected, balance, setAddress, setConnected, setBalance, disconnect: storeDisconnect } = useWalletStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkConnection = async () => {
      if (isConnected()) {
        const userData = getLocalStorage();
        if (userData?.addresses?.stx?.[0]?.address) {
          const addr = userData.addresses.stx[0].address;
          setAddress(addr);
          setConnected(true);
          const bal = await getUserBalance(addr);
          setBalance(bal);
        }
      } else {
        // Clear store if not connected in wallet
        if (storeConnected) {
          storeDisconnect();
        }
      }
    };

    checkConnection();
  }, [mounted, setAddress, setConnected, setBalance, storeConnected, storeDisconnect]);

  const connectWallet = useCallback(async () => {
    try {
      if (isConnected()) {
        const userData = getLocalStorage();
        if (userData?.addresses?.stx?.[0]?.address) {
          setAddress(userData.addresses.stx[0].address);
          setConnected(true);
          return;
        }
      }

      const response = await connect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authResponse = response as any;
      if (authResponse && authResponse.addresses?.stx?.[0]?.address) {
        const addr = authResponse.addresses.stx[0].address;
        setAddress(addr);
        setConnected(true);
        const bal = await getUserBalance(addr);
        setBalance(bal);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  }, [setAddress, setConnected, setBalance]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    storeDisconnect();
  }, [storeDisconnect]);

  const refreshBalance = useCallback(async () => {
    if (address) {
      const bal = await getUserBalance(address);
      setBalance(bal);
    }
  }, [address, setBalance]);

  return {
    address,
    isConnected: storeConnected,
    balance,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };
}

