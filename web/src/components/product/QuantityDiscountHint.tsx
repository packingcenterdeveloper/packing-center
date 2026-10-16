import { HiOutlineReceiptPercent } from 'react-icons/hi2';
import { formatCents } from '@/lib/format';
import type { QuantityDiscount } from '@/api/types';

interface QuantityDiscountHintProps {
  discounts: QuantityDiscount[] | undefined;
  quantity: number;
  unitPriceCents: number;
}

function pickDiscount(
  discounts: QuantityDiscount[],
  quantity: number,
): QuantityDiscount | null {
  const sorted = [...discounts].sort(
    (a, b) => b.minQuantity - a.minQuantity,
  );
  return sorted.find((d) => quantity >= d.minQuantity) ?? null;
}

export function QuantityDiscountHint({
  discounts,
  quantity,
  unitPriceCents,
}: QuantityDiscountHintProps) {
  if (!discounts || discounts.length === 0) return null;

  const applied = pickDiscount(discounts, quantity);
  const next = [...discounts]
    .sort((a, b) => a.minQuantity - b.minQuantity)
    .find((d) => quantity < d.minQuantity);

  if (!applied) {
    if (!next) return null;
    return (
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
        <HiOutlineReceiptPercent className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Comprando <strong>{next.minQuantity}</strong> o más obtenés{' '}
          <strong>{next.percent}%</strong> de descuento.
        </span>
      </div>
    );
  }

  const lineSubtotal = unitPriceCents * quantity;
  const saving = Math.round((lineSubtotal * applied.percent) / 100);

  return (
    <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
      <HiOutlineReceiptPercent className="w-4 h-4 shrink-0 mt-0.5" />
      <span>
        Aplicado <strong>{applied.percent}%</strong> por cantidad. Ahorrás{' '}
        <strong>{formatCents(saving)}</strong>.
      </span>
    </div>
  );
}