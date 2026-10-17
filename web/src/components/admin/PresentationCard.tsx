import { useState } from 'react';
import {
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineReceiptPercent,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { DiscountFormDialog } from './DiscountFormDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteDiscount } from '@/hooks/mutations/useDiscountMutations';
import { formatCents } from '@/lib/format';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { Presentation, QuantityDiscount } from '@/api/types';

interface PresentationCardProps {
  productId: number;
  presentation: Presentation;
  onEdit: (presentation: Presentation) => void;
  onDelete: (presentation: Presentation) => void;
}

export function PresentationCard({
  productId,
  presentation,
  onEdit,
  onDelete,
}: PresentationCardProps) {
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<QuantityDiscount | null>(
    null,
  );
  const [confirmDeleteDiscount, setConfirmDeleteDiscount] =
    useState<QuantityDiscount | null>(null);

  const deleteDiscount = useDeleteDiscount(productId);

  const discounts = presentation.quantityDiscounts ?? [];
  const available = presentation.stock - presentation.stockReserved;

  const handleDeleteDiscount = async () => {
    if (!confirmDeleteDiscount) return;
    try {
      await deleteDiscount.mutateAsync(confirmDeleteDiscount.id);
      toast.success('Descuento eliminado');
      setConfirmDeleteDiscount(null);
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  const openNewDiscount = () => {
    setEditingDiscount(null);
    setDiscountDialogOpen(true);
  };

  const openEditDiscount = (d: QuantityDiscount) => {
    setEditingDiscount(d);
    setDiscountDialogOpen(true);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900">
              {PRESENTATION_TYPE_LABELS[presentation.type] ??
                presentation.type}
            </p>
            {!presentation.isActive && (
              <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-slate-100 text-slate-500">
                Inactiva
              </span>
            )}
          </div>
          {presentation.sku && (
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {presentation.sku}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(presentation)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Editar presentación"
          >
            <HiOutlinePencilSquare className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(presentation)}
            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Eliminar presentación"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-slate-500">Precio</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {formatCents(presentation.priceCents)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Stock</p>
          <p
            className={cn(
              'text-sm font-bold mt-0.5',
              available <= 0
                ? 'text-rose-600'
                : available <= 10
                  ? 'text-amber-600'
                  : 'text-slate-900',
            )}
          >
            {available}
            {presentation.stockReserved > 0 && (
              <span className="text-[10px] font-normal text-slate-500 ml-1">
                ({presentation.stockReserved} reservadas)
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Descuentos</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {discounts.length}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5">
            <HiOutlineReceiptPercent className="w-4 h-4 text-brand" />
            Descuentos por cantidad
          </p>
          <button
            type="button"
            onClick={openNewDiscount}
            className="inline-flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold text-brand hover:bg-brand-50"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>

        {discounts.length === 0 ? (
          <p className="text-[11px] text-slate-400 py-2">
            Sin descuentos. Los clientes pagan el precio completo en cualquier
            cantidad.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {discounts.map((d) => (
              <li
                key={d.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs',
                  d.isActive
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50 opacity-60',
                )}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    Desde {d.minQuantity} · {d.percent}% off
                  </p>
                  {!d.isActive && (
                    <p className="text-[10px] text-slate-500">Inactivo</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditDiscount(d)}
                    className="p-1 rounded text-slate-500 hover:bg-slate-100"
                    aria-label="Editar descuento"
                  >
                    <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteDiscount(d)}
                    className="p-1 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Eliminar descuento"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DiscountFormDialog
        open={discountDialogOpen}
        productId={productId}
        presentationId={presentation.id}
        discount={editingDiscount}
        onClose={() => setDiscountDialogOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteDiscount)}
        title="Eliminar descuento"
        description={
          confirmDeleteDiscount
            ? `¿Eliminar el descuento "desde ${confirmDeleteDiscount.minQuantity} · ${confirmDeleteDiscount.percent}%"?`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteDiscount.isPending}
        onConfirm={handleDeleteDiscount}
        onCancel={() => setConfirmDeleteDiscount(null)}
      />
    </div>
  );
}