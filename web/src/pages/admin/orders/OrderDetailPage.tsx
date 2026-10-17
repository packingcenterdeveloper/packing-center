import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { OrderActionsBar } from '@/components/order/OrderActionsBar';
import { EmailsPanel } from '@/components/order/EmailsPanel';
import { OrderPrintView } from '@/components/order/OrderPrintView';
import { useAdminOrder } from '@/hooks/queries/useAdminOrder';
import {
  downloadNodeAsPng,
  orderImageFilename,
} from '@/lib/downloadOrderImage';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import {
  formatCents,
  formatDateTime,
  formatPhoneUY,
} from '@/lib/format';
import {
  PAYMENT_METHOD_LABELS,
  PRESENTATION_TYPE_LABELS,
} from '@/lib/constants';
import { cn } from '@/lib/cn';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useAdminOrder(id);

  const handleDownload = async () => {
    if (!printRef.current || !data) return;
    setDownloading(true);
    try {
      await downloadNodeAsPng(
        printRef.current,
        orderImageFilename(data.order.orderNumber),
      );
      toast.success('Imagen descargada');
    } catch {
      toast.error('No se pudo generar la imagen');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-8 rounded bg-slate-100 animate-pulse w-1/3" />
        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-rose-600">
          No se encontró el pedido o hubo un error al cargarlo.
        </p>
        <Link
          to="/admin/pedidos"
          className="mt-3 inline-block text-sm font-semibold text-brand"
        >
          Volver a pedidos
        </Link>
      </div>
    );
  }

  const { order, items, history } = data;

  const whatsappUrl = buildWhatsAppUrl({
    phone: order.customerPhone,
    message: `Hola ${order.customerName}, te escribo por tu pedido ${order.orderNumber} de PackingCenter.`,
  });

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-700"
          aria-label="Volver"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">Pedido</p>
          <h1 className="text-lg font-bold text-slate-900 truncate">
            #{order.orderNumber}
          </h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Acciones */}
      <OrderActionsBar
        order={order}
        onDownload={handleDownload}
        downloading={downloading}
        onDeleted={() => navigate('/admin/pedidos', { replace: true })}
      />

      {/* Estado */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          Seguimiento del pedido
        </h2>
        <OrderStatusTimeline currentStatus={order.status} history={history} />
      </section>

      {/* Cliente */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Cliente</h2>

        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-900">
            {order.customerName}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">
              {formatPhoneUY(order.customerPhone)}
            </span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold active:bg-emerald-100"
            >
              <HiOutlineChatBubbleLeftRight className="w-3 h-3" />
              WhatsApp
            </a>
          </div>
          {order.customerEmail && (
            <p className="text-slate-600">{order.customerEmail}</p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-sm">
          <Row label="Fecha" value={formatDateTime(order.createdAt)} />
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
            <Row label="Localidad" value={order.shippingDepartment} />
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

      {/* Productos */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          Productos ({items.reduce((sum, i) => sum + i.quantity, 0)})
        </h2>

        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {item.productName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {PRESENTATION_TYPE_LABELS[item.presentationType] ??
                      item.presentationType}
                    {' · '}
                    {item.quantity} × {formatCents(item.unitPriceCents)}
                  </p>
                  {(item.quantityDiscountCents > 0 ||
                    item.couponDiscountCents > 0) && (
                    <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
                      {item.quantityDiscountCents > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 font-medium">
                          -{item.quantityDiscountPercent}% cantidad
                        </span>
                      )}
                      {item.couponCode && (
                        <span className="inline-flex items-center gap-1 rounded bg-brand-50 text-brand px-1.5 py-0.5 font-medium">
                          {item.couponCode} -{item.couponDiscountPercent}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900 shrink-0">
                  {formatCents(item.lineTotalCents)}
                </p>
              </div>
            </div>
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
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
            <span className="text-base font-bold text-slate-900">Total</span>
            <span className="text-lg font-extrabold text-slate-900">
              {formatCents(order.totalCents)}
            </span>
          </div>
        </div>
      </section>

      {/* Mails */}
      <EmailsPanel orderId={order.id} />

      {/* Nodo oculto para descarga */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: -20000,
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        <OrderPrintView ref={printRef} order={order} items={items} history={history} />
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