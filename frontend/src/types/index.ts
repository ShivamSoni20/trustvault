export * from './escrow';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: number;
}
