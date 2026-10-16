import { Link, useParams, useSearchParams } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import { useOrder } from '@/hooks/queries/useOrder';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { OrderItemRow } from '@/components/order/OrderItemRow';
import { Price } from '@/components/common/Price';
import { formatCents } from '@/lib/format';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') ?? '';

  const orderQuery = useOrder(id, phone);

  if (orderQuery.isError) return <NotFoundPage />;

  if (orderQuery.isLoading || !orderQuery.data) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const { order, items, history } = orderQuery.data;

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-slate-50 border-b border-slate-200">
        <div className="px-4 h-12 flex items-center gap-3">
          <Link
            to="/mis-pedidos"
            className="p-1 -ml-1 text-slate-700"
            aria-label="Volver"
          >
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold text-slate-900 truncate flex-1">
            Pedido #{order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="px-4 mt-4 max-w-3xl mx-auto space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Estado</h2>
          <OrderStatusTimeline
            currentStatus={order.status}
            history={history}
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">
            Datos del pedido
          </h2>
          <div className="space-y-2 text-sm">
            <Row
              label="N° de pedido"
              value={`#${order.orderNumber}`}
            />
            <Row
              label="Fecha"
              value={new Date(order.createdAt).toLocaleString('es-UY')}
            />
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
              <Row
                label="Envío a"
                value={order.shippingDepartment}
              />
            )}
            {order.customerAddress && (
              <Row
                label="Dirección"
                value={`${order.customerAddress}${order.customerCity ? `, ${order.customerCity}` : ''}`}
              />
            )}
            {order.customerNotes && (
              <Row label="Notas" value={order.customerNotes} />
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900 mb-3">
            Productos
          </h2>
          <div className="space-y-1">
            {items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
            <Row
              label="Subtotal"
              value={formatCents(order.subtotalCents)}
            />
            {order.discountCents > 0 && (
              <Row
                label="Descuentos"
                value={`- ${formatCents(order.discountCents)}`}
                valueClass="text-emerald-600"
              />
            )}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">
                Total
              </span>
              <Price cents={order.totalCents} size="lg" />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2">
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
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={cn('text-slate-900 text-right', valueClass)}>
        {value}
      </span>
    </div>
  );
}