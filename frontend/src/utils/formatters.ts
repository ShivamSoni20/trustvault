import { STATUS_LABELS } from './constants';

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function formatUSDCx(microAmount: number | bigint): string {
  const amount = Number(microAmount) / 1_000_000;
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function parseUSDCxToMicro(amount: number): bigint {
  return BigInt(Math.round(amount * 1_000_000));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysRemaining(deadline: Date): number {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isExpired(deadline: Date): boolean {
  return new Date() > deadline;
}

export function getStatusLabel(status: number): string {
  return STATUS_LABELS[status] || 'Unknown';
}

export function blockHeightToDate(blockHeight: number, currentBlockHeight: number): Date {
  const blocksRemaining = blockHeight - currentBlockHeight;
  const minutesRemaining = blocksRemaining * 10;
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutesRemaining);
  return date;
}

export function dateToBlockHeight(date: Date, currentBlockHeight: number): number {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  const blocksToAdd = Math.ceil(diffMinutes / 10);
  return currentBlockHeight + blocksToAdd;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getExplorerUrl(type: 'tx' | 'address' | 'contract', id: string): string {
  const baseUrl = 'https://explorer.hiro.so';
  const network = '?chain=testnet';
  switch (type) {
    case 'tx':
      return `${baseUrl}/txid/${id}${network}`;
    case 'address':
      return `${baseUrl}/address/${id}${network}`;
    case 'contract':
      return `${baseUrl}/txid/${id}${network}`;
    default:
      return baseUrl;
  }
}
