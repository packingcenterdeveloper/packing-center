import { cn } from '@/lib/cn';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/constants';
import type { OrderStatus } from '@/api/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const colors = ORDER_STATUS_COLORS[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold',
        colors.bg,
        colors.text,
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}