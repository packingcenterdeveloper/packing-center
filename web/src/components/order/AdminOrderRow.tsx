import { Link } from 'react-router-dom';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCents, formatDateTime } from '@/lib/format';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import type { Order } from '@/api/types';

interface AdminOrderRowProps {
  order: Order;
}

export function AdminOrderRow({ order }: AdminOrderRowProps) {
  const isUnseen = !order.seenByAdminAt;

  const whatsappUrl = buildWhatsAppUrl({
    phone: order.customerPhone,
    message: `Hola ${order.customerName}, te escribo por tu pedido ${order.orderNumber} de PackingCenter.`,
  });

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-white p-4 transition-colors',
        isUnseen
          ? 'border-brand-300 bg-brand-50/30'
          : 'border-slate-200',
      )}
    >
      {isUnseen && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-brand text-white text-[10px] font-bold px-2 py-0.5">
          NUEVO
        </span>
      )}

      <Link
        to={`/admin/pedidos/${order.id}`}
        className="block"
        aria-label={`Ver pedido ${order.orderNumber}`}
      >
        <div className="flex items-center gap-2 flex-wrap pr-16">
          <p className="text-base font-bold text-slate-900">
            #{order.orderNumber}
          </p>
          <OrderStatusBadge status={order.status} />
        </div>

        <p className="text-xs text-slate-500 mt-1">
          {formatDateTime(order.createdAt)}
        </p>
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <p className="text-sm font-medium text-slate-900 truncate flex-1 min-w-0">
          {order.customerName}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold active:bg-emerald-100"
          aria-label={`Escribir por WhatsApp a ${order.customerName}`}
        >
          <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
          {order.customerPhone}
        </a>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/admin/pedidos/${order.id}`}
          className="text-xs font-semibold text-brand"
        >
          Ver detalle →
        </Link>
        <p className="text-base font-bold text-slate-900">
          {formatCents(order.totalCents)}
        </p>
      </div>
    </div>
  );
}