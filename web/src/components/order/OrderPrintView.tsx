import { forwardRef } from 'react';
import { formatCents, formatDateTime } from '@/lib/format';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PRESENTATION_TYPE_LABELS,
} from '@/lib/constants';
import type { Order, OrderItem, OrderStatusHistory } from '@/api/types';

interface OrderPrintViewProps {
  order: Order;
  items: OrderItem[];
  history: OrderStatusHistory[];
}

export const OrderPrintView = forwardRef<HTMLDivElement, OrderPrintViewProps>(
  function OrderPrintView({ order, items, history }, ref) {
    const totalDiscounts = order.discountCents;

    return (
      <div
        ref={ref}
        style={{ width: 800 }}
        className="bg-white text-slate-900 p-10 font-sans"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">
              PACKINGCENTER
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Packaging y descartables · Uruguay
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">Pedido #{order.orderNumber}</p>
            <p className="text-xs text-slate-500 mt-1">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Datos cliente + estado */}
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Cliente
            </p>
            <p className="text-sm font-bold mt-1">{order.customerName}</p>
            <p className="text-sm mt-0.5">Tel: {order.customerPhone}</p>
            {order.customerEmail && (
              <p className="text-sm mt-0.5">{order.customerEmail}</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Estado
            </p>
            <p className="text-sm font-bold mt-1">
              {ORDER_STATUS_LABELS[order.status]}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Pago: {order.paymentMethod
                ? (PAYMENT_METHOD_LABELS[order.paymentMethod] ?? '-')
                : '-'}
            </p>
          </div>
        </div>

        {/* Envío */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Envío
          </p>
          <div className="mt-1 text-sm">
            {order.shippingDepartment && (
              <p>
                <span className="text-slate-500">Localidad:</span>{' '}
                {order.shippingDepartment}
              </p>
            )}
            {order.customerAddress && (
              <p className="mt-0.5">
                <span className="text-slate-500">Dirección:</span>{' '}
                {order.customerAddress}
                {order.customerCity ? `, ${order.customerCity}` : ''}
              </p>
            )}
            {order.shippingCostLabel && (
              <p className="text-xs text-slate-500 mt-0.5">
                {order.shippingCostLabel}
              </p>
            )}
          </div>
          {order.customerNotes && (
            <p className="text-xs text-slate-600 mt-2 italic">
              Notas: {order.customerNotes}
            </p>
          )}
        </div>

        {/* Productos */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Productos
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-2 font-semibold text-slate-600 text-xs uppercase">
                  Producto
                </th>
                <th className="text-right py-2 font-semibold text-slate-600 text-xs uppercase w-16">
                  Cant.
                </th>
                <th className="text-right py-2 font-semibold text-slate-600 text-xs uppercase w-24">
                  P. unit.
                </th>
                <th className="text-right py-2 font-semibold text-slate-600 text-xs uppercase w-24">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      {PRESENTATION_TYPE_LABELS[item.presentationType] ??
                        item.presentationType}
                      {item.quantityDiscountPercent
                        ? ` · -${item.quantityDiscountPercent}% por cantidad`
                        : ''}
                      {item.couponCode
                        ? ` · cupón ${item.couponCode} -${item.couponDiscountPercent}%`
                        : ''}
                    </p>
                  </td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCents(item.unitPriceCents)}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {formatCents(item.lineTotalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatCents(order.subtotalCents)}</span>
            </div>
            {totalDiscounts > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Descuentos</span>
                <span>- {formatCents(totalDiscounts)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-slate-900 mt-2">
              <span>TOTAL</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Historial del pedido
            </p>
            <ul className="space-y-1 text-xs text-slate-600">
              {history.map((h) => (
                <li key={h.id} className="flex justify-between gap-4">
                  <span>
                    {ORDER_STATUS_LABELS[h.toStatus]}
                    {h.note ? ` — ${h.note}` : ''}
                  </span>
                  <span className="text-slate-400 shrink-0">
                    {formatDateTime(h.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
          PackingCenter · Documento interno generado el{' '}
          {formatDateTime(new Date())}
        </p>
      </div>
    );
  },
);