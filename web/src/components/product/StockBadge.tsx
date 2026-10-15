import { cn } from '@/lib/cn';

interface StockBadgeProps {
  available: number;
  className?: string;
}

export function StockBadge({ available, className }: StockBadgeProps) {
  const inStock = available > 0;
  const low = inStock && available <= 10;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium',
        inStock
          ? low
            ? 'text-amber-600'
            : 'text-emerald-600'
          : 'text-slate-400',
        className,
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          inStock
            ? low
              ? 'bg-amber-500'
              : 'bg-emerald-500'
            : 'bg-slate-300',
        )}
      />
      {inStock ? (low ? 'Últimas unidades' : 'En stock') : 'Sin stock'}
    </span>
  );
}