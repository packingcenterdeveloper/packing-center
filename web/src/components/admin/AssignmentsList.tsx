import { useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { AssignmentFormDialog } from './AssignmentFormDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteAssignment } from '@/hooks/mutations/useCouponMutations';
import { PRESENTATION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { CouponAssignment } from '@/api/types';

interface AssignmentsListProps {
  couponId: number;
  assignments: CouponAssignment[];
}

export function AssignmentsList({
  couponId,
  assignments,
}: AssignmentsListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] =
    useState<CouponAssignment | null>(null);

  const deleteMutation = useDeleteAssignment(couponId);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      toast.success('Producto quitado del cupón');
      setConfirmDelete(null);
    } catch {
      toast.error('No se pudo quitar');
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Productos del cupón
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cada producto tiene su propio porcentaje. Un mismo cupón puede
            aplicarse a varios productos a la vez.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-brand text-white text-xs font-semibold active:bg-brand-700"
        >
          <HiOutlinePlus className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Este cupón no tiene productos
          </p>
          <p className="text-xs text-amber-800 mt-1">
            Sin al menos un producto, el cupón no aplica a ningún carrito.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li
              key={a.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3',
                a.isActive
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-slate-50 opacity-60',
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {a.product?.name ?? `Producto #${a.productId}`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {a.presentation
                    ? (PRESENTATION_TYPE_LABELS[a.presentation.type] ??
                      a.presentation.type)
                    : `Presentación #${a.presentationId}`}
                  {' · '}
                  <span className="font-semibold text-brand">
                    {a.percent}% off
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(a)}
                className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Quitar del cupón"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AssignmentFormDialog
        open={formOpen}
        couponId={couponId}
        existingAssignments={assignments}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Quitar producto del cupón"
        description={
          confirmDelete
            ? `¿Quitar "${confirmDelete.product?.name ?? 'este producto'}" del cupón? Los pedidos ya realizados no se modifican.`
            : undefined
        }
        confirmLabel="Quitar"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}