import { useMemo, useState } from 'react';
import {
  HiOutlineCube,
  HiOutlinePlus,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { PresentationCard } from './PresentationCard';
import { PresentationFormDialog } from './PresentationFormDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  useDeletePresentation,
} from '@/hooks/mutations/usePresentationMutations';
import { ApiError } from '@/api/client';
import type { Presentation, PresentationType } from '@/api/types';

interface PresentationsSectionProps {
  productId: number;
  presentations: Presentation[];
}

export function PresentationsSection({
  productId,
  presentations,
}: PresentationsSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Presentation | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Presentation | null>(null);

  const deleteMutation = useDeletePresentation(productId);

  const existingTypes = useMemo(
    () => presentations.map((p) => p.type as PresentationType),
    [presentations],
  );

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (presentation: Presentation) => {
    setEditing(presentation);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      toast.success('Presentación eliminada');
      setConfirmDelete(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo eliminar';
      toast.error(message);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Presentaciones</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cada presentación tiene su propio precio y stock. El cliente elige
            cuál quiere comprar.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          disabled={existingTypes.length >= 4}
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-brand text-white text-xs font-semibold active:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <HiOutlinePlus className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>

      {presentations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <HiOutlineCube className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Este producto no tiene presentaciones
            </p>
            <p className="text-xs text-amber-800 mt-1">
              Sin al menos una presentación, no se puede vender ni aparece en la
              tienda. Agregá al menos "Unidad".
            </p>
            <button
              type="button"
              onClick={handleNew}
              className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-amber-600 text-white text-xs font-semibold active:bg-amber-700"
            >
              <HiOutlinePlus className="w-3.5 h-3.5" />
              Agregar la primera
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {presentations.map((presentation) => (
            <PresentationCard
              key={presentation.id}
              productId={productId}
              presentation={presentation}
              onEdit={handleEdit}
              onDelete={setConfirmDelete}
            />
          ))}
        </div>
      )}

      <PresentationFormDialog
        open={formOpen}
        productId={productId}
        presentation={editing}
        existingTypes={existingTypes}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar presentación"
        description={
          confirmDelete
            ? `¿Eliminar la presentación "${{ unidad: 'Unidad', paquete: 'Paquete', bulto: 'Bulto', caja: 'Caja' }[confirmDelete.type]}"? Se eliminan también sus descuentos por cantidad.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}