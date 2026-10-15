import { cn } from '@/lib/cn';
import { formatCents } from '@/lib/format';

interface PriceProps {
  cents: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-bold',
  lg: 'text-lg font-extrabold',
};

export function Price({ cents, className, size = 'md' }: PriceProps) {
  return (
    <span className={cn('text-slate-900', SIZE_CLASSES[size], className)}>
      {formatCents(cents)}
    </span>
  );
}