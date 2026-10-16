import { useState, type FormEvent } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineShoppingBag } from 'react-icons/hi2';
import { OrderListItem } from '@/components/order/OrderListItem';
import { useOrdersByPhone } from '@/hooks/queries/useOrdersByPhone';
import { normalizePhone } from '@/lib/format';
import { cn } from '@/lib/cn';

export function MyOrdersPage() {
  const [input, setInput] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);

  const ordersQuery = useOrdersByPhone(submittedPhone);
  const orders = ordersQuery.data ?? [];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(input);
    if (normalized.length < 8) return;
    setSubmittedPhone(normalized);
  };

  const canSubmit = normalizePhone(input).length >= 8;

  return (
    <div className="pb-8">
      <div className="px-4 pt-5">
        <h1 className="text-lg font-bold text-slate-900">Mis pedidos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ingresá tu teléfono para ver tus pedidos.
        </p>
      </div>

      <div className="px-4 mt-5">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="tel"
            inputMode="tel"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: 099 123 456"
            className="w-full h-11 pl-4 pr-12 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!canSubmit || ordersQuery.isFetching}
            className={cn(
              'absolute right-0 top-0 h-11 w-11 flex items-center justify-center rounded-r-lg transition-colors',
              !canSubmit || ordersQuery.isFetching
                ? 'bg-slate-100 text-slate-400'
                : 'bg-brand text-white active:bg-brand-700',
            )}
            aria-label="Buscar pedidos"
          >
            <HiOutlineMagnifyingGlass className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="px-4 mt-5">
        {submittedPhone === null ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-50 mx-auto flex items-center justify-center mb-3">
              <HiOutlineShoppingBag className="w-6 h-6 text-brand" />
            </div>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Vas a ver acá todos los pedidos que hayas hecho con ese
              teléfono.
            </p>
          </div>
        ) : ordersQuery.isFetching ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : ordersQuery.isError ? (
          <p className="text-sm text-rose-600 py-8 text-center">
            No se pudieron cargar los pedidos. Probá de nuevo.
          </p>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">
              No encontramos pedidos
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
              Verificá que el teléfono sea el mismo que usaste al hacer la
              compra.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderListItem
                key={order.id}
                order={order}
                phone={submittedPhone}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}