import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineShoppingCart,
  HiOutlineTruck,
} from 'react-icons/hi2';
import { ImageGallery } from '@/components/product/ImageGallery';
import { PresentationSelector } from '@/components/product/PresentationSelector';
import { QuantityInput } from '@/components/product/QuantityInput';
import { QuantityDiscountHint } from '@/components/product/QuantityDiscountHint';
import { Price } from '@/components/common/Price';
import { useProduct } from '@/hooks/queries/useProduct';
import { useAddToCart } from '@/hooks/useAddToCart';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { cn } from '@/lib/cn';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import type { Presentation } from '@/api/types';

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
    if (p && p.stock - p.stockReserved > 0) return p;
  }
  return presentations.find((x) => x.isActive) ?? presentations[0] ?? null;
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addToCart = useAddToCart();

  const { data: product, isLoading, isError } = useProduct(slug);

  const presentations = useMemo(
    () => (product?.presentations ?? []).filter((p) => p.isActive),
    [product],
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Setea la presentación default cuando carga el producto
  useEffect(() => {
    if (presentations.length > 0 && selectedId === null) {
      const def = pickDefaultPresentation(presentations);
      if (def) setSelectedId(def.id);
    }
  }, [presentations, selectedId]);

  // Resetea la cantidad al cambiar de presentación
  useEffect(() => {
    setQuantity(1);
  }, [selectedId]);

  if (isError) return <NotFoundPage />;

  if (isLoading || !product) {
    return (
      <div className="pb-8">
        <div className="aspect-square bg-slate-100 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-5 w-3/4 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-slate-100 animate-pulse" />
          <div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse" />
          <div className="h-24 rounded-lg bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  const selected = presentations.find((p) => p.id === selectedId) ?? null;
  const available = selected ? selected.stock - selected.stockReserved : 0;
  const isOutOfStock = !selected || available <= 0;

  const handleAdd = () => {
    if (!selected || isOutOfStock) return;
    addToCart(selected.id, quantity, product.name);
  };

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 h-12 px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-slate-700"
            aria-label="Volver"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-slate-900 truncate flex-1">
            {product.name}
          </h1>
        </div>
      </div>

      <ImageGallery images={product.images} alt={product.name} />

      <div className="px-4 pt-4">
        {product.category && (
          <Link
            to={`/categorias/${product.category.slug}`}
            className="text-xs font-medium text-brand"
          >
            {product.category.name}
          </Link>
        )}

        <h2 className="mt-1 text-lg font-bold text-slate-900 leading-tight">
          {product.name}
        </h2>

        {selected && (
          <>
            <p className="text-sm text-slate-500 mt-1">
              {PRESENTATION_TYPE_LABELS[selected.type] ?? selected.type}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <Price cents={selected.priceCents} size="lg" />
            </div>

            <div className="mt-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-medium',
                  isOutOfStock
                    ? 'text-slate-400'
                    : available <= 10
                      ? 'text-amber-600'
                      : 'text-emerald-600',
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isOutOfStock
                      ? 'bg-slate-300'
                      : available <= 10
                        ? 'bg-amber-500'
                        : 'bg-emerald-500',
                  )}
                />
                {isOutOfStock
                  ? 'Sin stock'
                  : available <= 10
                    ? `Últimas ${available} unidades`
                    : 'En stock'}
              </span>
            </div>
          </>
        )}
      </div>

      {presentations.length > 1 && (
        <section className="mt-5 px-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Presentaciones
          </h3>
          <PresentationSelector
            presentations={presentations}
            selectedId={selectedId}
            onChange={setSelectedId}
          />
        </section>
      )}

      {selected?.quantityDiscounts &&
        selected.quantityDiscounts.length > 0 && (
          <section className="mt-5 px-4">
            <QuantityDiscountHint
              discounts={selected.quantityDiscounts}
              quantity={quantity}
              unitPriceCents={selected.priceCents}
            />
          </section>
        )}

      {product.description && (
        <section className="mt-5 px-4">
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            Descripción
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </section>
      )}

      {product.measures && (
        <section className="mt-5 px-4">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Medidas</h3>
          <p className="text-sm text-slate-600">{product.measures}</p>
        </section>
      )}

      <section className="mt-5 px-4">
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
          <HiOutlineTruck className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
          <span>
            Envío por DAC a todo el país. En Montevideo y algunas ciudades
            de Canelones es gratis.
          </span>
        </div>
      </section>

      {/* CTA fijo abajo */}
      <div className="fixed md:bottom-0 bottom-16 inset-x-0 z-30 bg-white border-t border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <QuantityInput
            value={quantity}
            onChange={setQuantity}
            max={isOutOfStock ? 1 : available}
          />
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAdd}
            className={cn(
              'transition-all duration-200 hover:bg-brand-700 flex-1 h-11 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors',
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-brand text-white active:bg-brand-700',
            )}
          >
            <HiOutlineShoppingCart className="w-4 h-4" />
            {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>

      {/* Espacio para que el CTA no tape contenido */}
      <div className="h-24" />
    </div>
  );
}