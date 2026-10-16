import { Price } from '@/components/common/Price';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import type { OrderItem } from '@/api/types';

interface OrderItemRowProps {
  item: OrderItem;
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
        {/* Placeholder: el OrderItem no guarda imagen, si querés mostrarla
            habría que exponerla desde el back o resolverla en el front por slug. */}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 leading-tight line-clamp-2">
          {item.productName}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {PRESENTATION_TYPE_LABELS[item.presentationType] ??
            item.presentationType}{' '}
          × {item.quantity}
        </p>
      </div>
      <Price cents={item.lineTotalCents} size="sm" />
    </div>
  );
}