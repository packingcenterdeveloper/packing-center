import { useSearchParams } from 'react-router-dom';
import { HiOutlineTruck } from 'react-icons/hi2';
import { AdminOrderRow } from '@/components/order/AdminOrderRow';
import {
  AdminOrderFilters,
  type OrderFilterState,
} from '@/components/order/AdminOrderFilters';
import { useAdminOrders } from '@/hooks/queries/useAdminOrders';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/constants';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 20;

function parseStatus(value: string | null): OrderStatus | null {
  if (!value) return null;
  return (ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as OrderStatus)
    : null;
}

export function OrdersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: OrderFilterState = {
    status: parseStatus(searchParams.get('status')),
    unseen: searchParams.get('unseen') === 'true',
    search: searchParams.get('q') ?? '',
  };
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const { data, isLoading, isError, isFetching } = useAdminOrders({
    status: filters.status ?? undefined,
    unseen: filters.unseen || undefined,
    search: filters.search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const updateFilters = (next: OrderFilterState) => {
    const sp = new URLSearchParams();
    if (next.status) sp.set('status', next.status);
    if (next.unseen) sp.set('unseen', 'true');
    if (next.search) sp.set('q', next.search);
    // page se resetea siempre al cambiar filtros
    setSearchParams(sp, { replace: true });
  };

  const goToPage = (next: number) => {
    const sp = new URLSearchParams(searchParams);
    if (next <= 1) sp.delete('page');
    else sp.set('page', String(next));
    setSearchParams(sp, { replace: true });
  };

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pedidos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gestioná los pedidos y actualizá su estado a medida que avanzás.
        </p>
      </div>

      <AdminOrderFilters value={filters} onChange={updateFilters} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-rose-600 text-center py-12">
          No se pudieron cargar los pedidos.
        </p>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-50 mx-auto flex items-center justify-center mb-3">
            <HiOutlineTruck className="w-6 h-6 text-brand" />
          </div>
          <p className="text-sm font-semibold text-slate-900">
            No hay pedidos que coincidan
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            Probá cambiar los filtros o limpiar la búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              'space-y-3 transition-opacity',
              isFetching && 'opacity-60',
            )}
          >
            {orders.map((order) => (
              <AdminOrderRow key={order.id} order={order} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className={cn(
                  'h-9 px-4 rounded-lg text-sm font-semibold border transition-colors',
                  page <= 1
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 bg-white active:bg-slate-50',
                )}
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500 px-2">
                Página {meta.page} de {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => goToPage(page + 1)}
                className={cn(
                  'h-9 px-4 rounded-lg text-sm font-semibold border transition-colors',
                  page >= meta.totalPages
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 bg-white active:bg-slate-50',
                )}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}