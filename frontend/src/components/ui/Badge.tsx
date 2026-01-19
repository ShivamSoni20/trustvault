import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/utils/constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status';
  status?: number;
  className?: string;
}

export function Badge({ children, variant = 'default', status, className }: BadgeProps) {
  const statusColor = status ? STATUS_COLORS[status] : 'bg-slate-600';
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'status' ? statusColor : 'bg-primary/20 text-primary-300',
        'text-white',
        className
      )}
    >
      {children}
    </span>
  );
}
