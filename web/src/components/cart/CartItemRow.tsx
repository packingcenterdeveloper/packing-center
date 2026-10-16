import { Link } from 'react-router-dom';
import { HiOutlineTrash } from 'react-icons/hi2';
import { ProductImage } from '@/components/common/ProductImage';
import { QuantityInput } from '@/components/product/QuantityInput';
import { Price } from '@/components/common/Price';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import { useCartStore } from '@/stores/cart.store';
import type { QuoteItem } from '@/api/types';

interface CartItemRowProps {
  item: QuoteItem;
  available: number;
}

export function CartItemRow({ item, available }: CartItemRowProps) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  return (
    <div className="flex gap-3 py-4 border-b border-slate-100 last:border-b-0">
      <Link
        to={`/productos/${item.productSlug}`}
        className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0"
      >
        <ProductImage
          src={item.productImageUrl}
          alt={item.productName}
          className="w-full h-full"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/productos/${item.productSlug}`}
            className="min-w-0 flex-1"
          >
            <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">
              {item.productName}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {PRESENTATION_TYPE_LABELS[item.presentationType] ??
                item.presentationType}
            </p>
          </Link>

          <button
            type="button"
            onClick={() => remove(item.presentationId)}
            className="p-1 -mr-1 text-slate-400 active:text-rose-500"
            aria-label="Quitar del carrito"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <QuantityInput
            value={item.quantity}
            onChange={(q) => setQuantity(item.presentationId, q)}
            max={available}
          />
          <Price cents={item.lineTotalCents} />
        </div>

        {(item.quantityDiscountCents > 0 || item.couponDiscountCents > 0) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
            {item.quantityDiscountCents > 0 && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 font-medium">
                -{item.quantityDiscountPercent}% por cantidad
              </span>
            )}
            {item.couponCode && (
              <span className="inline-flex items-center gap-1 rounded bg-brand-50 text-brand px-1.5 py-0.5 font-medium">
                {item.couponCode} -{item.couponPercent}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}