import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import {
  useCreatePresentation,
  useUpdatePresentation,
} from '@/hooks/mutations/usePresentationMutations';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Presentation, PresentationType } from '@/api/types';

const TYPES: PresentationType[] = ['unidad', 'paquete', 'bulto', 'caja'];

const TYPE_LABEL: Record<PresentationType, string> = {
  unidad: 'Unidad',
  paquete: 'Paquete',
  bulto: 'Bulto',
  caja: 'Caja',
};

const formSchema = z.object({
  type: z.enum(['unidad', 'paquete', 'bulto', 'caja']),
  sku: z
    .string()
    .trim()
    .max(60, 'Máximo 60 caracteres')
    .optional()
    .or(z.literal('')),
  pricePesos: z.coerce
    .number()
    .int('Tiene que ser un número entero')
    .min(1, 'El precio debe ser mayor a 0'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  isActive: z.boolean(),
});

type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

const inputBase =
  'w-full h-11 px-3 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

interface PresentationFormDialogProps {
  open: boolean;
  productId: number;
  presentation: Presentation | null;
  existingTypes: PresentationType[];
  onClose: () => void;
}

export function PresentationFormDialog({
  open,
  productId,
  presentation,
  existingTypes,
  onClose,
}: PresentationFormDialogProps) {
  const isEditing = Boolean(presentation);
  const createMutation = useCreatePresentation(productId);
  const updateMutation = useUpdatePresentation(productId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'unidad',
      sku: '',
      pricePesos: 0,
      stock: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (presentation) {
      reset({
        type: presentation.type,
        sku: presentation.sku ?? '',
        // Convertimos centavos → pesos para mostrar
        pricePesos: Math.round(presentation.priceCents / 100),
        stock: presentation.stock,
        isActive: presentation.isActive,
      });
    } else {
      const availableType =
        TYPES.find((t) => !existingTypes.includes(t)) ?? 'unidad';
      reset({
        type: availableType,
        sku: '',
        pricePesos: 0,
        stock: 0,
        isActive: true,
      });
    }
  }, [open, presentation, existingTypes, reset]);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FormOutput) => {
    // Convertimos pesos → centavos antes de guardar
    const priceCents = values.pricePesos * 100;

    try {
      if (isEditing && presentation) {
        await updateMutation.mutateAsync({
          id: presentation.id,
          input: {
            sku: values.sku?.trim() || null,
            priceCents,
            stock: values.stock,
            isActive: values.isActive,
          },
        });
        toast.success('Presentación actualizada');
      } else {
        await createMutation.mutateAsync({
          type: values.type,
          sku: values.sku?.trim() || undefined,
          priceCents,
          stock: values.stock,
          isActive: values.isActive,
        });
        toast.success('Presentación agregada');
      }
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo guardar';
      toast.error(message);
    }
  };

  const availableTypes = TYPES.filter(
    (t) => !existingTypes.includes(t) || t === presentation?.type,
  );

  return (
    <Modal
      open={open}
      title={isEditing ? 'Editar presentación' : 'Nueva presentación'}
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
            form="presentation-form"
            disabled={submitting}
            className={cn(
              'flex-1 h-11 rounded-lg text-sm font-semibold text-white transition-colors',
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
        id="presentation-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableTypes.map((t) => (
              <label
                key={t}
                className={cn(
                  'cursor-pointer rounded-lg border p-3 text-center text-sm font-semibold transition-colors',
                  'has-[:checked]:border-brand has-[:checked]:bg-brand-50 has-[:checked]:text-brand',
                  'border-slate-200 text-slate-700',
                  isEditing && t !== presentation?.type && 'hidden',
                )}
              >
                <input
                  type="radio"
                  value={t}
                  {...register('type')}
                  disabled={isEditing}
                  className="sr-only"
                />
                {TYPE_LABEL[t]}
              </label>
            ))}
          </div>
          {isEditing && (
            <p className="mt-1.5 text-[11px] text-slate-400">
              El tipo no se puede cambiar. Si necesitás otro, eliminá esta
              presentación y creá una nueva.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="pres-price"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Precio (en pesos)
          </label>
          <input
            id="pres-price"
            type="number"
            min={1}
            step={1}
            {...register('pricePesos')}
            className={cn(
              inputBase,
              errors.pricePesos ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="Ej: 250"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Ingresá el precio final. Ej: 250 para $250.
          </p>
          {errors.pricePesos && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.pricePesos.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="pres-stock"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Stock disponible
          </label>
          <input
            id="pres-stock"
            type="number"
            min={0}
            step={1}
            {...register('stock')}
            className={cn(
              inputBase,
              errors.stock ? 'border-rose-300' : 'border-slate-200',
            )}
          />
          {errors.stock && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.stock.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="pres-sku"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Código interno <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="pres-sku"
            type="text"
            {...register('sku')}
            className={cn(
              inputBase,
              errors.sku ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="Ej: VASO-200-CAJ"
          />
          {errors.sku && (
            <p className="mt-1 text-xs text-rose-600">{errors.sku.message}</p>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('isActive')}
            className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span className="text-sm text-slate-700">
            Disponible para la venta
          </span>
        </label>
      </form>
    </Modal>
  );
}