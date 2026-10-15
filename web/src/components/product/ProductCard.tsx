import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart } from 'react-icons/hi2';
import { Price } from '@/components/common/Price';
import { ProductImage } from '@/components/common/ProductImage';
import { useAddToCart } from '@/hooks/useAddToCart';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { Presentation, Product } from '@/api/types';

const PRESENTATION_ORDER: Presentation['type'][] = [
  'unidad',
  'paquete',
  'bulto',
  'caja',
];

function pickDefaultPresentation(
  presentations: Presentation[] | undefined,
): Presentation | null {
  if (!presentations || presentations.length === 0) return null;
  for (const type of PRESENTATION_ORDER) {
    const p = presentations.find((x) => x.type === type && x.isActive);
    if (p) return p;
  }
  return presentations[0] ?? null;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addToCart = useAddToCart();

  const image = product.images?.[0];
  const presentation = pickDefaultPresentation(product.presentations);
  const available = presentation
    ? presentation.stock - presentation.stockReserved
    : 0;

  const isOutOfStock = !presentation || available <= 0;

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden',
        className,
      )}
    >
      <Link
        to={`/productos/${product.slug}`}
        className="block aspect-square relative"
      >
        <ProductImage
          src={image?.urlThumb ?? image?.url}
          alt={product.name}
          className="w-full h-full"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col p-3 gap-1">
        <Link to={`/productos/${product.slug}`}>
          <h3 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {presentation && (
          <p className="text-xs text-slate-500">
            {PRESENTATION_TYPE_LABELS[presentation.type] ?? presentation.type}
          </p>
        )}

        {presentation && (
          <Price cents={presentation.priceCents} size="lg" className="mt-1" />
        )}

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => {
            if (!presentation) return;
            addToCart(presentation.id, 1, product.name);
          }}
          className={cn(
            'mt-2 inline-flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-semibold transition-colors',
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-brand text-white active:bg-brand-700',
          )}
        >
          <HiOutlineShoppingCart className="w-4 h-4" />
          Agregar
        </button>
      </div>
    </div>
  );
}