import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  HiArrowLeft,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { useAdminProduct } from '@/hooks/queries/useAdminProduct';
import { useAdminCategories } from '@/hooks/queries/useAdminCategories';
import {
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/mutations/useProductMutations';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { PresentationsSection } from '@/components/admin/PresentationsSection';
import { slugify } from '@/lib/slug';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';

const formSchema = z.object({
  name: z
  .string()
  .trim()
  .min(2, 'Mínimo 2 caracteres')
  .max(200, 'Máximo 200 caracteres'),
  categoryId: z.coerce
  .number({ message: 'Elegí una categoría' })
  .int()
  .positive('Elegí una categoría'),
  subcategory: z
  .string()
  .trim()
  .max(80, 'Máximo 80 caracteres')
  .optional()
  .or(z.literal('')),
  description: z
  .string()
  .trim()
  .max(2000, 'Máximo 2000 caracteres')
  .optional()
  .or(z.literal('')),
  measures: z
  .string()
  .trim()
  .max(300, 'Máximo 300 caracteres')
  .optional()
  .or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

const inputBase =
'w-full h-11 px-3 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && id !== 'nuevo';
  const productId = isEditing ? Number(id) : null;

  const categoriesQuery = useAdminCategories();
  const productQuery = useAdminProduct(productId ?? undefined);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      categoryId: 0,
      subcategory: '',
      description: '',
      measures: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isEditing || !productQuery.data) return;
    const p = productQuery.data;
    reset({
      name: p.name,
      categoryId: p.categoryId,
      subcategory: p.subcategory ?? '',
      description: p.description ?? '',
      measures: p.measures ?? '',
      isActive: p.isActive,
    });
  }, [isEditing, productQuery.data, reset]);

  const nameValue = watch('name');
  const suggestedSlug = slugify(nameValue || '');

  const submitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FormOutput) => {
    const payload = {
      name: values.name.trim(),
      categoryId: values.categoryId,
      subcategory: values.subcategory?.trim() || null,
      description: values.description?.trim() || undefined,
      measures: values.measures?.trim() || undefined,
      isActive: values.isActive,
    };

    try {
      if (isEditing && productId) {
        await updateMutation.mutateAsync(payload);
        toast.success('Producto actualizado');
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast.success('Producto creado');
        navigate(`/admin/productos/${created.id}`, { replace: true });
      }
    } catch (err) {
      const message =
      err instanceof ApiError ? err.message : 'No se pudo guardar';
      toast.error(message);
    }
  };

  if (isEditing && productQuery.isLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-8 rounded bg-slate-100 animate-pulse w-1/3" />
        <div className="h-72 rounded-xl bg-slate-100 animate-pulse" />
      </div>
      );
  }

  if (isEditing && (productQuery.isError || !productQuery.data)) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-rose-600">
          No se encontró el producto.
        </p>
        <Link
          to="/admin/productos"
          className="mt-3 inline-block text-sm font-semibold text-brand"
        >
          Volver a productos
        </Link>
      </div>
      );
  }

  const categories = categoriesQuery.data ?? [];
  const product = productQuery.data;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/productos')}
          className="p-2 -ml-2 text-slate-700"
          aria-label="Volver"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">
            {isEditing ? 'Editando producto' : 'Nuevo producto'}
          </p>
          <h1 className="text-lg font-bold text-slate-900 truncate">
            {isEditing ? (product?.name ?? 'Cargando...') : 'Crear producto'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Información básica
          </h2>

          <div>
            <label
              htmlFor="p-name"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Nombre del producto
            </label>
            <input
              id="p-name"
              type="text"
              autoFocus
              {...register('name')}
              className={cn(
                inputBase,
                errors.name ? 'border-rose-300' : 'border-slate-200',
                )}
              placeholder="Ej: Bandeja de espuma N°4"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.name.message}
              </p>
              )}
            {isEditing && product && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                URL:{' '}
                <span className="font-mono">/productos/{product.slug}</span>
              </p>
              )}
            {!isEditing && suggestedSlug && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                URL:{' '}
                <span className="font-mono">/productos/{suggestedSlug}</span>
              </p>
              )}
          </div>

          <div>
            <label
              htmlFor="p-category"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Categoría
            </label>
            <select
              id="p-category"
              {...register('categoryId')}
              className={cn(
                inputBase,
                'pr-8',
                errors.categoryId ? 'border-rose-300' : 'border-slate-200',
                )}
            >
              <option value={0}>Elegir categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {!c.isActive ? ' (oculta)' : ''}
                </option>
                ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.categoryId.message}
              </p>
              )}
          </div>

          <div>
            <label
              htmlFor="p-subcategory"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Subcategoría{' '}
              <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              id="p-subcategory"
              type="text"
              {...register('subcategory')}
              className={cn(
                inputBase,
                errors.subcategory ? 'border-rose-300' : 'border-slate-200',
                )}
              placeholder="Ej: espuma, plástica, metal"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Sirve para mostrar chips de filtro dentro de la categoría.
            </p>
            {errors.subcategory && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.subcategory.message}
              </p>
              )}
          </div>

          <div>
            <label
              htmlFor="p-description"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Descripción{' '}
              <span className="text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="p-description"
              rows={4}
              {...register('description')}
              className={cn(
                'w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none',
                errors.description ? 'border-rose-300' : 'border-slate-200',
                )}
              placeholder="Contá qué es el producto, para qué se usa, etc."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.description.message}
              </p>
              )}
          </div>

          <div>
            <label
              htmlFor="p-measures"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Medidas <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              id="p-measures"
              type="text"
              {...register('measures')}
              className={cn(
                inputBase,
                errors.measures ? 'border-rose-300' : 'border-slate-200',
                )}
              placeholder="Ej: 20 x 14 x 2 cm"
            />
            {errors.measures && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.measures.message}
              </p>
              )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              {...register('isActive')}
              className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
            />
            <div>
              <p className="text-sm text-slate-700">
                Visible en la tienda
              </p>
              <p className="text-[11px] text-slate-500">
                Si está desactivado, no aparece en el catálogo público.
              </p>
            </div>
          </label>
        </section>

        {!isEditing && (
          <div className="flex items-start gap-2 rounded-lg bg-brand-50 border border-brand-200 p-3 text-xs text-brand-900">
            <HiOutlineInformationCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Después de crear el producto vas a poder agregarle fotos,
              presentaciones y descuentos por cantidad.
            </p>
          </div>
          )}

        <div className="sticky bottom-0 bg-slate-50 pt-3 pb-3 -mx-4 px-4 border-t border-slate-200 lg:static lg:border-0 lg:p-0 lg:bg-transparent lg:mx-0">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => navigate('/admin/productos')}
              className="flex-1 h-11 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 active:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
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
              : 'Crear producto'}
            </button>
          </div>
        </div>
      </form>

      {/* Secciones extra solo en modo edición */}
      {isEditing && product && productId && (
        <>
        <ImageUploader productId={productId} images={product.images ?? []} />
        <PresentationsSection
          productId={productId}
          presentations={product.presentations ?? []}
        />
        </>
        )}
    </div>
    );
}