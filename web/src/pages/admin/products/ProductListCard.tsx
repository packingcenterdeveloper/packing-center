import { Link } from 'react-router-dom';
import {
  HiOutlineCube,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { ProductImage } from '@/components/common/ProductImage';
import { formatCents } from '@/lib/format';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import type { Product } from '@/api/types';

interface ProductListCardProps {
  product: Product;
  categoryName: string | null;
  onDelete: (product: Product) => void;
}

function pickCheapest(presentations: Product['presentations']) {
  if (!presentations || presentations.length === 0) return null;
  return presentations.reduce(
    (min, p) => (p.priceCents < min.priceCents ? p : min),
    presentations[0]!,
  );
}

export function ProductListCard({
  product,
  categoryName,
  onDelete,
}: ProductListCardProps) {
  const image = product.images?.[0];
  const cheapest = pickCheapest(product.presentations);
  const presentationCount = product.presentations?.length ?? 0;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <Link
        to={`/admin/productos/${product.id}`}
        className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0"
      >
        <ProductImage
          src={image?.urlThumb ?? image?.url}
          alt={product.name}
          className="w-full h-full"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/admin/productos/${product.id}`}
            className="min-w-0"
          >
            <p className="text-sm font-semibold text-slate-900 truncate">
              {product.name}
            </p>
          </Link>
          {!product.isActive && (
            <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-slate-100 text-slate-500">
              Oculto
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
          {categoryName ?? 'Sin categoría'}
          {product.subcategory ? ` · ${product.subcategory}` : ''}
        </p>

        <div className="flex items-center gap-3 mt-1.5 text-xs">
          {presentationCount > 0 ? (
            <>
              <span className="inline-flex items-center gap-1 text-slate-600">
                <HiOutlineCube className="w-3.5 h-3.5" />
                {presentationCount}{' '}
                {presentationCount === 1 ? 'presentación' : 'presentaciones'}
              </span>
              {cheapest && (
                <span className="text-slate-500">
                  desde{' '}
                  <span className="font-semibold text-slate-900">
                    {formatCents(cheapest.priceCents)}
                  </span>{' '}
                  <span className="text-slate-400">
                    ({PRESENTATION_TYPE_LABELS[cheapest.type] ?? cheapest.type})
                  </span>
                </span>
              )}
            </>
          ) : (
            <span className="text-amber-600 font-medium">
              Sin presentaciones · sin precio
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Link
          to={`/admin/productos/${product.id}`}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200"
          aria-label={`Editar ${product.name}`}
        >
          <HiOutlinePencilSquare className="w-5 h-5" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100"
          aria-label={`Eliminar ${product.name}`}
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}