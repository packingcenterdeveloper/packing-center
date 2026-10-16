import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  HiCheckCircle,
  HiOutlineClock,
  HiXCircle,
} from 'react-icons/hi2';
import { useOrder } from '@/hooks/queries/useOrder';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { OrderItemRow } from '@/components/order/OrderItemRow';
import { Price } from '@/components/common/Price';
import { formatCents } from '@/lib/format';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const mpStatus = searchParams.get('status');

  const orderQuery = useOrder(id, phone);

  if (orderQuery.isError) return <NotFoundPage />;

  if (orderQuery.isLoading || !orderQuery.data) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const { order, items } = orderQuery.data;

  // Banner de resultado
  const banner = (() => {
    if (mpStatus === 'approved' || order.status === 'paid') {
      return {
        icon: HiCheckCircle,
        title: '¡Pago confirmado!',
        subtitle: 'Tu pedido está siendo preparado.',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        iconColor: 'text-emerald-500',
      };
    }
    if (mpStatus === 'pending' || order.status === 'pending') {
      return {
        icon: HiOutlineClock,
        title: 'Pedido en proceso',
        subtitle: 'Te avisamos cuando se confirme el pago.',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        iconColor: 'text-amber-500',
      };
    }
    if (mpStatus === 'rejected') {
      return {
        icon: HiXCircle,
        title: 'Pago rechazado',
        subtitle: 'Podés intentar de nuevo o contactarnos.',
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        iconColor: 'text-rose-500',
      };
    }
    return {
      icon: HiCheckCircle,
      title: '¡Gracias por tu compra!',
      subtitle: 'Tu pedido fue registrado.',
      color: 'bg-brand-50 border-brand-200 text-brand-900',
      iconColor: 'text-brand',
    };
  })();

  const BannerIcon = banner.icon;

  return (
    <div className="pb-8">
      <div className="px-4 mt-4 max-w-3xl mx-auto space-y-4">
        <div
          className={cn(
            'rounded-xl border p-5 flex flex-col items-center text-center',
            banner.color,
          )}
        >
          <BannerIcon className={cn('w-12 h-12 mb-2', banner.iconColor)} />
          <h1 className="text-base font-bold">{banner.title}</h1>
          <p className="text-xs mt-1 opacity-80">{banner.subtitle}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Número de pedido</p>
              <p className="text-sm font-bold text-slate-900">
                #{order.orderNumber}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
            <Row label="Fecha" value={new Date(order.createdAt).toLocaleString('es-UY')} />
            <Row
              label="Forma de pago"
              value={
                order.paymentMethod
                  ? (PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                    order.paymentMethod)
                  : '-'
              }
            />
            {order.shippingDepartment && (
              <Row label="Envío a" value={order.shippingDepartment} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Productos</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatCents(order.subtotalCents)} />
            {order.discountCents > 0 && (
              <Row
                label="Descuentos"
                value={`- ${formatCents(order.discountCents)}`}
                valueClass="text-emerald-600"
              />
            )}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Total</span>
              <Price cents={order.totalCents} size="lg" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to={`/mis-pedidos/${order.id}?phone=${encodeURIComponent(phone)}`}
            className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-brand text-white text-sm font-semibold active:bg-brand-700"
          >
            Ver seguimiento del pedido
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full h-11 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 active:bg-slate-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={cn('text-slate-900 text-right', valueClass)}>
        {value}
      </span>
    </div>
  );
}