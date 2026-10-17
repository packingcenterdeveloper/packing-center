import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { AssignmentsList } from '@/components/admin/AssignmentsList';
import { useAdminCoupon } from '@/hooks/queries/useAdminCoupon';
import {
  useCreateCoupon,
  useUpdateCoupon,
} from '@/hooks/mutations/useCouponMutations';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';

const inputBase =
  'w-full h-11 px-3 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

interface FormState {
  code: string;
  description: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const EMPTY: FormState = {
  code: '',
  description: '',
  maxUses: '',
  validFrom: '',
  validUntil: '',
  isActive: true,
};

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function fromDateInput(value: string): string | null {
  if (!value.trim()) return null;
  // Medianoche local convertida a ISO
  const d = new Date(`${value}T00:00:00`);
  return d.toISOString();
}

export function CouponFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && id !== 'nuevo';
  const couponId = isEditing ? Number(id) : null;

  const couponQuery = useAdminCoupon(couponId ?? undefined);
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon(couponId ?? 0);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEditing || !couponQuery.data) return;
    const c = couponQuery.data;
    setForm({
      code: c.code,
      description: c.description ?? '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      validFrom: toDateInput(c.validFrom),
      validUntil: toDateInput(c.validUntil),
      isActive: c.isActive,
    });
  }, [isEditing, couponQuery.data]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const code = form.code.trim().toUpperCase();

    if (!code) next.code = 'Ingresá un código';
    else if (code.length > 60) next.code = 'Máximo 60 caracteres';
    else if (!/^[A-Z0-9_-]+$/.test(code))
      next.code = 'Solo letras, números, guiones y guiones bajos';

    if (form.description.length > 500)
      next.description = 'Máximo 500 caracteres';

    if (form.maxUses.trim()) {
      const n = Number(form.maxUses);
      if (!Number.isInteger(n) || n < 1) {
        next.maxUses = 'Debe ser un entero mayor a 0';
      }
    }

    if (
      form.validFrom &&
      form.validUntil &&
      new Date(form.validFrom) > new Date(form.validUntil)
    ) {
      next.validUntil = 'Debe ser posterior a la fecha de inicio';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      description: form.description.trim() || undefined,
      maxUses: form.maxUses.trim() ? Number(form.maxUses) : null,
      validFrom: fromDateInput(form.validFrom),
      validUntil: fromDateInput(form.validUntil),
      isActive: form.isActive,
    };

    try {
      if (isEditing && couponId) {
        await updateMutation.mutateAsync(payload);
        toast.success('Cupón actualizado');
      } else {
        const created = await createMutation.mutateAsync({
          code: form.code.trim().toUpperCase(),
          ...payload,
        });
        toast.success('Cupón creado');
        navigate(`/admin/cupones/${created.id}`, { replace: true });
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo guardar';
      toast.error(message);
    }
  };

  if (isEditing && couponQuery.isLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-8 rounded bg-slate-100 animate-pulse w-1/3" />
        <div className="h-72 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (isEditing && (couponQuery.isError || !couponQuery.data)) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-rose-600">No se encontró el cupón.</p>
        <Link
          to="/admin/cupones"
          className="mt-3 inline-block text-sm font-semibold text-brand"
        >
          Volver a cupones
        </Link>
      </div>
    );
  }

  const coupon = couponQuery.data;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/cupones')}
          className="p-2 -ml-2 text-slate-700"
          aria-label="Volver"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">
            {isEditing ? 'Editando cupón' : 'Nuevo cupón'}
          </p>
          <h1 className="text-lg font-bold text-slate-900 truncate font-mono">
            {isEditing ? (coupon?.code ?? 'Cargando...') : 'Crear cupón'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Información del cupón
          </h2>

          <div>
            <label
              htmlFor="c-code"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Código
            </label>
            <input
              id="c-code"
              type="text"
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              disabled={isEditing}
              className={cn(
                inputBase,
                'font-mono uppercase',
                isEditing && 'bg-slate-50 text-slate-500 cursor-not-allowed',
                errors.code ? 'border-rose-300' : 'border-slate-200',
              )}
              placeholder="Ej: NAVIDAD"
              maxLength={60}
              autoFocus={!isEditing}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-rose-600">{errors.code}</p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              {isEditing
                ? 'El código no se puede modificar. Si te equivocaste, eliminá este cupón y creá uno nuevo.'
                : 'Es lo que el cliente escribe en el carrito. No distingue mayúsculas de minúsculas.'}
            </p>
          </div>

          <div>
            <label
              htmlFor="c-description"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Descripción{' '}
              <span className="text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="c-description"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={cn(
                'w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none',
                errors.description ? 'border-rose-300' : 'border-slate-200',
              )}
              placeholder="Ej: 15% off en unidades seleccionadas"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.description}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Límites y vigencia
          </h2>

          <div>
            <label
              htmlFor="c-maxUses"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Usos máximos{' '}
              <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              id="c-maxUses"
              type="number"
              min={1}
              value={form.maxUses}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxUses: e.target.value }))
              }
              className={cn(
                inputBase,
                errors.maxUses ? 'border-rose-300' : 'border-slate-200',
              )}
              placeholder="Dejalo vacío para ilimitados"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              El cupón deja de funcionar después de esta cantidad de pedidos
              pagados.
            </p>
            {errors.maxUses && (
              <p className="mt-1 text-xs text-rose-600">{errors.maxUses}</p>
            )}
            {isEditing && coupon && coupon.usedCount > 0 && (
              <p className="mt-1 text-[11px] text-slate-500">
                Ya se usó {coupon.usedCount}{' '}
                {coupon.usedCount === 1 ? 'vez' : 'veces'}.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="c-from"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Vigente desde{' '}
                <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                id="c-from"
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, validFrom: e.target.value }))
                }
                className={cn(inputBase, 'border-slate-200')}
              />
            </div>

            <div>
              <label
                htmlFor="c-until"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Vence el{' '}
                <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                id="c-until"
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm((f) => ({ ...f, validUntil: e.target.value }))
                }
                className={cn(
                  inputBase,
                  errors.validUntil ? 'border-rose-300' : 'border-slate-200',
                )}
              />
            </div>
          </div>
          {errors.validUntil && (
            <p className="text-xs text-rose-600 -mt-2">{errors.validUntil}</p>
          )}
          <p className="text-[11px] text-slate-400 -mt-2">
            Dejá ambas vacías para que no tenga vencimiento. Se quitan
            manualmente cuando termines la promoción.
          </p>

          <label className="flex items-center gap-3 cursor-pointer select-none pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
            />
            <div>
              <p className="text-sm text-slate-700">Cupón activo</p>
              <p className="text-[11px] text-slate-500">
                Si está desactivado, los clientes no pueden usarlo aunque
                tengan el código.
              </p>
            </div>
          </label>
        </section>

        {!isEditing && (
          <div className="flex items-start gap-2 rounded-lg bg-brand-50 border border-brand-200 p-3 text-xs text-brand-900">
            <HiOutlineInformationCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Después de crear el cupón vas a poder agregarle los productos y
              presentaciones a los que aplica, cada uno con su porcentaje.
            </p>
          </div>
        )}

        <div className="sticky bottom-0 bg-slate-50 pt-3 pb-3 -mx-4 px-4 border-t border-slate-200 lg:static lg:border-0 lg:p-0 lg:bg-transparent lg:mx-0">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => navigate('/admin/cupones')}
              className="flex-1 h-11 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 active:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'flex-1 h-11 rounded-lg text-sm font-semibold text-white',
                submitting
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-brand active:bg-brand-700',
              )}
            >
              {submitting
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear cupón'}
            </button>
          </div>
        </div>
      </form>

      {/* Asignaciones solo en modo edición */}
      {isEditing && coupon && couponId && (
        <AssignmentsList
          couponId={couponId}
          assignments={coupon.assignments ?? []}
        />
      )}
    </div>
  );
}