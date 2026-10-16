import { Link } from 'react-router-dom';
import {
  HiArrowRight,
  HiOutlineBellAlert,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import type { IconType } from 'react-icons';
import { useAdminDashboard } from '@/hooks/queries/useAdminDashboard';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { formatCents, formatDateTime } from '@/lib/format';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { OrderStatus } from '@/api/types';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
  to?: string;
}

function StatCard({ label, value, hint, accent, to }: StatCardProps) {
  const content = (
    <div
      className={cn(
        'rounded-xl border p-4 h-full transition-colors',
        accent
          ? 'bg-brand text-white border-brand'
          : 'bg-white border-slate-200',
      )}
    >
      <p
        className={cn(
          'text-xs font-medium',
          accent ? 'text-white/80' : 'text-slate-500',
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-2xl font-extrabold',
          accent ? 'text-white' : 'text-slate-900',
        )}
      >
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            'mt-1 text-[11px]',
            accent ? 'text-white/80' : 'text-slate-500',
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );

  return to ? (
    <Link to={to} className="block h-full active:opacity-95">
      {content}
    </Link>
  ) : (
    content
  );
}

function StatusCard({
  status,
  count,
}: {
  status: OrderStatus;
  count: number;
}) {
  const colors = ORDER_STATUS_COLORS[status];
  return (
    <Link
      to={`/admin/pedidos?status=${status}`}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 active:bg-slate-50"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn('w-2 h-2 rounded-full shrink-0', {
            'bg-amber-500': status === 'pending',
            'bg-emerald-500': status === 'paid',
            'bg-blue-500': status === 'preparing',
            'bg-indigo-500': status === 'dispatched',
            'bg-slate-400': status === 'delivered',
            'bg-rose-500': status === 'cancelled',
          })}
        />
        <span className="text-xs font-medium text-slate-700 truncate">
          {ORDER_STATUS_LABELS[status]}
        </span>
      </div>
      <span
        className={cn(
          'text-sm font-bold px-2 py-0.5 rounded-full',
          colors.bg,
          colors.text,
        )}
      >
        {count}
      </span>
    </Link>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading || !data) {
    return (
      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4">
        <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-rose-600">
          No se pudo cargar el panel. Probá recargar la página.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Panel de control</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Un vistazo rápido a cómo está tu negocio hoy.
        </p>
      </div>

      {/* Aviso de pedidos sin ver */}
      {data.unseenOrders > 0 && (
        <Link
          to="/admin/pedidos?unseen=true"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 active:bg-amber-100"
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <HiOutlineBellAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-900">
              {data.unseenOrders === 1
                ? 'Tenés 1 pedido nuevo sin ver'
                : `Tenés ${data.unseenOrders} pedidos nuevos sin ver`}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Entrá para revisarlos y prepararlos
            </p>
          </div>
          <HiArrowRight className="w-5 h-5 text-amber-600 shrink-0" />
        </Link>
      )}

      {/* Pedidos por estado */}
      <section>
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          Pedidos por estado
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(
            [
              'pending',
              'paid',
              'preparing',
              'dispatched',
              'delivered',
              'cancelled',
            ] as OrderStatus[]
          ).map((status) => (
            <StatusCard
              key={status}
              status={status}
              count={data.statusCounts[status] ?? 0}
            />
          ))}
        </div>
      </section>

      {/* Ventas */}
      <section>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Ventas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Vendido hoy"
            value={formatCents(data.revenue.today)}
            hint={`${data.orders.today} ${data.orders.today === 1 ? 'pedido' : 'pedidos'} hoy`}
          />
          <StatCard
            label="Vendido este mes"
            value={formatCents(data.revenue.month)}
            hint={`${data.orders.month} ${data.orders.month === 1 ? 'pedido' : 'pedidos'} este mes`}
          />
          <StatCard
            label="Vendido total"
            value={formatCents(data.revenue.allTime)}
            accent
          />
          <StatCard
            label="Sin ver"
            value={data.unseenOrders}
            hint="Pedidos nuevos"
          />
        </div>
      </section>

      {/* Últimos pedidos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Últimos pedidos
          </h2>
          <Link
            to="/admin/pedidos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand"
          >
            Ver todos
            <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.latestOrders.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8 rounded-xl border border-dashed border-slate-200">
            Todavía no hay pedidos.
          </p>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {data.latestOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/admin/pedidos/${order.id}`}
                    className="flex items-center gap-3 p-4 active:bg-slate-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-900">
                          #{order.orderNumber}
                        </p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {order.customerName} · {order.customerPhone}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 shrink-0">
                      {formatCents(order.totalCents)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Stock bajo */}
      {data.lowStock.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Productos con stock bajo
            </h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {data.lowStock.map((item) => (
                <li
                  key={item.presentationId}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {item.type}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-1 rounded-full shrink-0',
                      item.available <= 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700',
                    )}
                  >
                    {item.available <= 0
                      ? 'Sin stock'
                      : `${item.available} disponibles`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}