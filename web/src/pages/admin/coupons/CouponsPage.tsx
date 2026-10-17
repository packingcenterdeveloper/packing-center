import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTicket,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAdminCoupons } from '@/hooks/queries/useAdminCoupons';
import { useDeleteCoupon } from '@/hooks/mutations/useCouponMutations';
import { formatDate } from '@/lib/format';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Coupon } from '@/api/types';

function isExpired(coupon: Coupon): boolean {
  if (!coupon.validUntil) return false;
  return new Date(coupon.validUntil) < new Date();
}

function isNotYetValid(coupon: Coupon): boolean {
  if (!coupon.validFrom) return false;
  return new Date(coupon.validFrom) > new Date();
}

export function CouponsPage() {
  const { data, isLoading, isError } = useAdminCoupons();
  const deleteMutation = useDeleteCoupon();
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);

  const coupons = data ?? [];

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      toast.success('Cupón eliminado');
      setConfirmDelete(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo eliminar';
      toast.error(message);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cupones</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Creá códigos de descuento para aplicar a productos específicos.
            Los clientes los ingresan en el carrito.
          </p>
        </div>
        <Link
          to="/admin/cupones/nuevo"
          className="shrink-0 inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-lg bg-brand text-white text-sm font-semibold active:bg-brand-700"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo cupón</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-rose-600 text-center py-12">
          No se pudieron cargar los cupones.
        </p>
      ) : coupons.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-50 mx-auto flex items-center justify-center mb-3">
            <HiOutlineTicket className="w-6 h-6 text-brand" />
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Todavía no hay cupones
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            Creá tu primer cupón para dar descuentos a tus clientes.
          </p>
          <Link
            to="/admin/cupones/nuevo"
            className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand text-white text-sm font-semibold"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Crear cupón
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon);
            const notYet = isNotYetValid(coupon);
            const used = coupon.usedCount;
            const max = coupon.maxUses;
            const usageLabel = max
              ? `${used} / ${max} usos`
              : `${used} ${used === 1 ? 'uso' : 'usos'}`;
            const assignmentsCount = coupon.assignments?.length ?? 0;

            return (
              <li
                key={coupon.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border bg-white p-4',
                  !coupon.isActive || expired
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200',
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold font-mono text-slate-900">
                      {coupon.code}
                    </p>
                    {!coupon.isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-slate-100 text-slate-500">
                        Inactivo
                      </span>
                    )}
                    {expired && (
                      <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-rose-100 text-rose-700">
                        Expirado
                      </span>
                    )}
                    {notYet && (
                      <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-amber-100 text-amber-700">
                        Programado
                      </span>
                    )}
                  </div>
                  {coupon.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {coupon.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 mt-1.5">
                    <span>{usageLabel}</span>
                    <span>
                      {assignmentsCount}{' '}
                      {assignmentsCount === 1
                        ? 'producto'
                        : 'productos'}
                    </span>
                    {coupon.validFrom && (
                      <span>Desde {formatDate(coupon.validFrom)}</span>
                    )}
                    {coupon.validUntil && (
                      <span>Hasta {formatDate(coupon.validUntil)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/admin/cupones/${coupon.id}`}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label={`Editar ${coupon.code}`}
                  >
                    <HiOutlinePencilSquare className="w-5 h-5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(coupon)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Eliminar ${coupon.code}`}
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar cupón"
        description={
          confirmDelete
            ? `¿Eliminar el cupón "${confirmDelete.code}"? Se eliminan también sus asignaciones. Los pedidos ya realizados no se modifican.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}