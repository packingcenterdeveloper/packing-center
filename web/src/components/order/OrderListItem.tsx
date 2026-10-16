import { Link, useSearchParams } from 'react-router-dom';
import { HiChevronRight } from 'react-icons/hi2';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCents } from '@/lib/format';
import { formatDateTime } from '@/lib/format';
import type { Order } from '@/api/types';

interface OrderListItemProps {
  order: Order;
  phone: string;
}

export function OrderListItem({ order, phone }: OrderListItemProps) {
  return (
    <Link
      to={`/mis-pedidos/${order.id}?phone=${encodeURIComponent(phone)}`}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 active:bg-slate-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900 truncate">
            #{order.orderNumber}
          </p>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {formatDateTime(order.createdAt)}
        </p>
        <p className="text-sm font-semibold text-slate-900 mt-1">
          {formatCents(order.totalCents)}
        </p>
      </div>
      <HiChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
    </Link>
  );
}