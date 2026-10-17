import { useEffect, useState, type FormEvent } from 'react';
import { HiOutlineBellAlert, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { cn } from '@/lib/cn';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import type { OrderStatus } from '@/api/types';

export interface OrderFilterState {
  status: OrderStatus | null;
  unseen: boolean;
  search: string;
}

interface AdminOrderFiltersProps {
  value: OrderFilterState;
  onChange: (next: OrderFilterState) => void;
}

const STATUS_CHIPS: Array<{
  value: OrderStatus | null;
  label: string;
}> = [
  { value: null, label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'paid', label: 'Pagados' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'dispatched', label: 'Despachados' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
];

export function AdminOrderFilters({
  value,
  onChange,
}: AdminOrderFiltersProps) {
  const [input, setInput] = useState(value.search);

  // Sync si el valor externo cambia (por ejemplo, al cambiar de URL)
  useEffect(() => {
    setInput(value.search);
  }, [value.search]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onChange({ ...value, search: input.trim() });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onChange({ ...value, unseen: !value.unseen })}
        className={cn(
          'inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-semibold transition-colors border',
          value.unseen
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
        )}
        aria-pressed={value.unseen}
      >
        <HiOutlineBellAlert className="w-4 h-4" />
        {value.unseen ? 'Mostrando solo nuevos' : 'Mostrar solo nuevos'}
      </button>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Buscar por nº de pedido, nombre o teléfono"
          className="w-full h-11 pl-4 pr-12 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center rounded-r-lg text-slate-500 hover:text-brand"
          aria-label="Buscar"
        >
          <HiOutlineMagnifyingGlass className="w-5 h-5" />
        </button>
      </form>

      <div className="flex flex-wrap justify-center items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {STATUS_CHIPS.map((chip) => {
          const isActive = value.status === chip.value;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChange({ ...value, status: chip.value })}
              className={cn(
                'shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-colors border',
                isActive
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}