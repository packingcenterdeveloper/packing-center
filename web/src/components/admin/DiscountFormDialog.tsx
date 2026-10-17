import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import {
  useCreateDiscount,
  useUpdateDiscount,
} from '@/hooks/mutations/useDiscountMutations';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { QuantityDiscount } from '@/api/types';

const formSchema = z.object({
  minQuantity: z.coerce.number().int().min(1, 'Mínimo 1').max(100000),
  percent: z.coerce.number().int().min(1, 'Mínimo 1%').max(100, 'Máximo 100%'),
  isActive: z.boolean(),
});

type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

const inputBase =
'w-full h-11 px-3 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

interface DiscountFormDialogProps {
  open: boolean;
  productId: number;
  presentationId: number;
  discount: QuantityDiscount | null;
  onClose: () => void;
}

export function DiscountFormDialog({
  open,
  productId,
  presentationId,
  discount,
  onClose,
}: DiscountFormDialogProps) {
  const isEditing = Boolean(discount);
  const createMutation = useCreateDiscount(productId);
  const updateMutation = useUpdateDiscount(productId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { minQuantity: 1, percent: 5, isActive: true },
  });

  useEffect(() => {
    if (!open) return;
    if (discount) {
      reset({
        minQuantity: discount.minQuantity,
        percent: discount.percent,
        isActive: discount.isActive,
      });
    } else {
      reset({ minQuantity: 1, percent: 5, isActive: true });
    }
  }, [open, discount, reset]);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FormOutput) => {
    try {
      if (isEditing && discount) {
        await updateMutation.mutateAsync({
          id: discount.id,
          input: {
            minQuantity: values.minQuantity,
            percent: values.percent,
            isActive: values.isActive,
          },
        });
        toast.success('Descuento actualizado');
      } else {
        await createMutation.mutateAsync({
          presentationId,
          minQuantity: values.minQuantity,
          percent: values.percent,
          isActive: values.isActive,
        });
        toast.success('Descuento agregado');
      }
      onClose();
    } catch (err) {
      const message =
      err instanceof ApiError ? err.message : 'No se pudo guardar';
      toast.error(message);
    }
  };

  return (
    <Modal
      open={open}
      title={isEditing ? 'Editar descuento' : 'Nuevo descuento por cantidad'}
      onClose={submitting ? () => {} : onClose}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="discount-form"
            disabled={submitting}
            className={cn(
              'flex-1 h-11 rounded-lg text-sm font-semibold text-white',
              submitting
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-brand active:bg-brand-700',
              )}
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      }
    >
      <form
        id="discount-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <p className="text-xs text-slate-500 rounded-lg bg-brand-50 border border-brand-200 p-3">
          Se aplica cuando el cliente compra <strong>esta presentación</strong>{' '}
          en la cantidad mínima o más.
        </p>

        <div>
          <label
            htmlFor="d-min"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Cantidad mínima
          </label>
          <input
            id="d-min"
            type="number"
            min={1}
            {...register('minQuantity')}
            className={cn(
              inputBase,
              errors.minQuantity ? 'border-rose-300' : 'border-slate-200',
              )}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            A partir de esta cantidad, se aplica el descuento.
          </p>
          {errors.minQuantity && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.minQuantity.message}
            </p>
            )}
        </div>

        <div>
          <label
            htmlFor="d-percent"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Descuento (%)
          </label>
          <input
            id="d-percent"
            type="number"
            min={1}
            max={100}
            {...register('percent')}
            className={cn(
              inputBase,
              errors.percent ? 'border-rose-300' : 'border-slate-200',
              )}
          />
          {errors.percent && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.percent.message}
            </p>
            )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('isActive')}
            className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span className="text-sm text-slate-700">Descuento activo</span>
        </label>
      </form>
    </Modal>
    );
}