import { cn } from '@/lib/cn';
import { formatCents } from '@/lib/format';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import type { Presentation } from '@/api/types';

interface PresentationSelectorProps {
  presentations: Presentation[];
  selectedId: number | null;
  onChange: (presentationId: number) => void;
}

export function PresentationSelector({
  presentations,
  selectedId,
  onChange,
}: PresentationSelectorProps) {
  return (
    <div className="space-y-2">
      {presentations.map((p) => {
        const available = p.stock - p.stockReserved;
        const isSelected = p.id === selectedId;
        const isOutOfStock = available <= 0;

        return (
          <button
            key={p.id}
            type="button"
            disabled={isOutOfStock}
            onClick={() => onChange(p.id)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
              isSelected && !isOutOfStock
                ? 'border-brand bg-brand-50'
                : 'border-slate-200 bg-white',
              isOutOfStock
                ? 'opacity-50 cursor-not-allowed'
                : 'active:bg-slate-50',
            )}
          >
            <span
              className={cn(
                'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                isSelected && !isOutOfStock
                  ? 'border-brand'
                  : 'border-slate-300',
              )}
            >
              {isSelected && !isOutOfStock && (
                <span className="w-2 h-2 rounded-full bg-brand" />
              )}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {PRESENTATION_TYPE_LABELS[p.type] ?? p.type}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-slate-900">
                {formatCents(p.priceCents)}
              </p>
              <p
                className={cn(
                  'text-[11px] font-medium',
                  isOutOfStock
                    ? 'text-slate-400'
                    : available <= 10
                      ? 'text-amber-600'
                      : 'text-emerald-600',
                )}
              >
                {isOutOfStock
                  ? 'Sin stock'
                  : available <= 10
                    ? `${available} disponibles`
                    : 'En stock'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}