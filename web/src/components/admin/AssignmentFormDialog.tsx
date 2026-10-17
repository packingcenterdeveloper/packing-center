import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import {
  ProductPresentationPicker,
  type PresentationSelection,
} from './ProductPresentationPicker';
import { useCreateAssignment } from '@/hooks/mutations/useCouponMutations';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { CouponAssignment } from '@/api/types';

const formSchema = z.object({
  percent: z.coerce
    .number()
    .int()
    .min(1, 'Mínimo 1%')
    .max(100, 'Máximo 100%'),
});

type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

const inputBase =
  'w-full h-11 px-3 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

interface AssignmentFormDialogProps {
  open: boolean;
  couponId: number;
  existingAssignments: CouponAssignment[];
  onClose: () => void;
}

export function AssignmentFormDialog({
  open,
  couponId,
  existingAssignments,
  onClose,
}: AssignmentFormDialogProps) {
  const createMutation = useCreateAssignment(couponId);
  const [selection, setSelection] = useState<PresentationSelection | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { percent: 10 },
  });

  useEffect(() => {
    if (!open) return;
    setSelection(null);
    reset({ percent: 10 });
  }, [open, reset]);

  const excludedIds = existingAssignments.map((a) => a.presentationId);

  const onSubmit = async (values: FormOutput) => {
    if (!selection) {
      toast.error('Elegí un producto y una presentación');
      return;
    }

    try {
      await createMutation.mutateAsync({
        productId: selection.productId,
        presentationId: selection.presentationId,
        percent: values.percent,
      });
      toast.success('Producto agregado al cupón');
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo agregar';
      toast.error(message);
    }
  };

  return (
    <Modal
      open={open}
      title="Agregar producto al cupón"
      onClose={createMutation.isPending ? () => {} : onClose}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="assignment-form"
            disabled={createMutation.isPending || !selection}
            className={cn(
              'flex-1 h-11 rounded-lg text-sm font-semibold text-white',
              createMutation.isPending || !selection
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-brand active:bg-brand-700',
            )}
          >
            {createMutation.isPending ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      }
    >
      <form
        id="assignment-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <p className="text-xs text-slate-500 rounded-lg bg-brand-50 border border-brand-200 p-3">
          Elegí a qué producto y presentación aplica el cupón{' '}
          <strong>y con qué porcentaje de descuento</strong>.
        </p>

        <ProductPresentationPicker
          value={selection}
          onChange={setSelection}
          excludePresentationIds={excludedIds}
        />

        <div>
          <label
            htmlFor="a-percent"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Descuento (%)
          </label>
          <input
            id="a-percent"
            type="number"
            min={1}
            max={100}
            {...register('percent')}
            className={cn(
              inputBase,
              errors.percent ? 'border-rose-300' : 'border-slate-200',
            )}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Es el porcentaje que se descuenta del precio de esa presentación
            cuando el cliente aplica este cupón.
          </p>
          {errors.percent && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.percent.message}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}