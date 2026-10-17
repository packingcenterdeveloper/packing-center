import { useState } from 'react';
import { useAdminProducts } from '@/hooks/queries/useAdminProducts';
import { useAdminProduct } from '@/hooks/queries/useAdminProduct';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import { formatCents } from '@/lib/format';
import { cn } from '@/lib/cn';

export interface PresentationSelection {
  productId: number;
  presentationId: number;
  productName: string;
  presentationLabel: string;
}

interface ProductPresentationPickerProps {
  value: PresentationSelection | null;
  onChange: (value: PresentationSelection | null) => void;
  excludePresentationIds?: number[];
}

const inputBase =
  'w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

export function ProductPresentationPicker({
  value,
  onChange,
  excludePresentationIds = [],
}: ProductPresentationPickerProps) {
  const [productId, setProductId] = useState<number | null>(
    value?.productId ?? null,
  );

  const productsQuery = useAdminProducts({
    includeInactive: false,
    limit: 100,
  });
  const productQuery = useAdminProduct(productId ?? undefined);

  const products = productsQuery.data?.data ?? [];
  const product = productQuery.data;

  const handleProductChange = (id: number | null) => {
    setProductId(id);
    onChange(null);
  };

  const handlePresentationChange = (pid: number | null) => {
    if (!pid || !product) {
      onChange(null);
      return;
    }
    const presentation = product.presentations?.find((p) => p.id === pid);
    if (!presentation) {
      onChange(null);
      return;
    }
    onChange({
      productId: product.id,
      presentationId: presentation.id,
      productName: product.name,
      presentationLabel:
        PRESENTATION_TYPE_LABELS[presentation.type] ?? presentation.type,
    });
  };

  const presentations = (product?.presentations ?? []).filter(
    (p) => !excludePresentationIds.includes(p.id),
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Producto
        </label>
        <select
          value={productId ?? ''}
          onChange={(e) =>
            handleProductChange(e.target.value ? Number(e.target.value) : null)
          }
          className={inputBase}
        >
          <option value="">Elegir producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {productsQuery.isLoading && (
          <p className="mt-1 text-[11px] text-slate-400">Cargando...</p>
        )}
      </div>

      {productId && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Presentación
          </label>
          {productQuery.isLoading ? (
            <div className="h-11 rounded-lg bg-slate-100 animate-pulse" />
          ) : presentations.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Este producto no tiene presentaciones disponibles.
            </p>
          ) : (
            <div className="space-y-2">
              {presentations.map((pres) => {
                const isSelected = value?.presentationId === pres.id;
                return (
                  <button
                    key={pres.id}
                    type="button"
                    onClick={() => handlePresentationChange(pres.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                      isSelected
                        ? 'border-brand bg-brand-50'
                        : 'border-slate-200 bg-white active:bg-slate-50',
                    )}
                  >
                    <span
                      className={cn(
                        'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                        isSelected ? 'border-brand' : 'border-slate-300',
                      )}
                    >
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-brand" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {PRESENTATION_TYPE_LABELS[pres.type] ?? pres.type}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 shrink-0">
                      {formatCents(pres.priceCents)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}