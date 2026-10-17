import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/mutations/useCategoryMutations';
import { slugify } from '@/lib/slug';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Category } from '@/api/types';

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  description: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, 'Tiene que ser 0 o más')
    .max(9999)
    .default(0),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const inputBase =
  'w-full h-11 px-3 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

interface CategoryFormDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}

export function CategoryFormDialog({
  open,
  category,
  onClose,
}: CategoryFormDialogProps) {
  const isEditing = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  // Reset al abrir
  useEffect(() => {
    if (!open) return;
    if (category) {
      reset({
        name: category.name,
        description: category.description ?? '',
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      reset({
        name: '',
        description: '',
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [open, category, reset]);

  const nameValue = watch('name');
  const suggestedSlug = slugify(nameValue || '');

  const submitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          input: payload,
        });
        toast.success('Categoría actualizada');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Categoría creada');
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
      title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
      onClose={submitting ? () => {} : onClose}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 active:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={submitting}
            className={cn(
              'flex-1 h-11 rounded-lg text-sm font-semibold text-white transition-colors',
              submitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-brand active:bg-brand-700',
            )}
          >
            {submitting
              ? 'Guardando...'
              : isEditing
                ? 'Guardar cambios'
                : 'Crear categoría'}
          </button>
        </div>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="cat-name"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Nombre
          </label>
          <input
            id="cat-name"
            type="text"
            autoFocus
            {...register('name')}
            className={cn(
              inputBase,
              errors.name ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="Ej: Bandejas de espuma"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.name.message}
            </p>
          )}
          {suggestedSlug && (
            <p className="mt-1.5 text-[11px] text-slate-400">
              URL: <span className="font-mono">/categorias/{suggestedSlug}</span>
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cat-description"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Descripción <span className="text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="cat-description"
            rows={3}
            {...register('description')}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none',
              errors.description ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="Contá brevemente qué productos incluye esta categoría"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cat-sortOrder"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Orden en el catálogo
          </label>
          <input
            id="cat-sortOrder"
            type="number"
            min={0}
            {...register('sortOrder')}
            className={cn(
              inputBase,
              errors.sortOrder ? 'border-rose-300' : 'border-slate-200',
            )}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Números más bajos aparecen primero. Ej: 1 va antes que 2.
          </p>
          {errors.sortOrder && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.sortOrder.message}
            </p>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('isActive')}
            className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span className="text-sm text-slate-700">
            Visible en la tienda
          </span>
        </label>
      </form>
    </Modal>
  );
}