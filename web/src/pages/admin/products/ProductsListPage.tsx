import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineShoppingBag,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { ProductListCard } from './ProductListCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAdminProducts } from '@/hooks/queries/useAdminProducts';
import { useAdminCategories } from '@/hooks/queries/useAdminCategories';
import { useDeleteProduct } from '@/hooks/mutations/useProductMutations';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Product } from '@/api/types';

const PAGE_SIZE = 20;

export function ProductsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get('q') ?? '',
  );

  const search = searchParams.get('q') ?? '';
  const categoryIdParam = searchParams.get('categoryId');
  const categoryId = categoryIdParam ? Number(categoryIdParam) : null;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const categoriesQuery = useAdminCategories();
  const categories = categoriesQuery.data ?? [];

  const selectedCategorySlug = useMemo(() => {
    if (!categoryId) return undefined;
    return categories.find((c) => c.id === categoryId)?.slug;
  }, [categoryId, categories]);

  const productsQuery = useAdminProducts({
    search: search || undefined,
    categorySlug: selectedCategorySlug,
    includeInactive: true,
    page,
    limit: PAGE_SIZE,
  });

  const deleteMutation = useDeleteProduct();
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const products = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta;

  const updateParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    // Reset page al cambiar filtros
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      toast.success('Producto eliminado');
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
          <h1 className="text-xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestioná precios, stock, presentaciones e imágenes.
          </p>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="shrink-0 inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-lg bg-brand text-white text-sm font-semibold active:bg-brand-700"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo producto</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <div className="space-y-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre o descripción"
            className="w-full h-11 pl-4 pr-12 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center rounded-r-lg text-slate-500 hover:text-brand"
            aria-label="Buscar"
          >
            <HiOutlineMagnifyingGlass className="w-5 h-5" />
          </button>
        </form>

        <select
          value={categoryId ?? ''}
          onChange={(e) =>
            updateParams({
              categoryId: e.target.value ? e.target.value : null,
            })
          }
          className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {!c.isActive ? ' (oculta)' : ''}
            </option>
          ))}
        </select>
      </div>

      {productsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : productsQuery.isError ? (
        <p className="text-sm text-rose-600 text-center py-12">
          No se pudieron cargar los productos.
        </p>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-50 mx-auto flex items-center justify-center mb-3">
            <HiOutlineShoppingBag className="w-6 h-6 text-brand" />
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {search || categoryId
              ? 'No hay productos que coincidan'
              : 'Todavía no hay productos'}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            {search || categoryId
              ? 'Probá cambiar los filtros.'
              : 'Creá tu primer producto para empezar a vender.'}
          </p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              'space-y-2 transition-opacity',
              productsQuery.isFetching && 'opacity-60',
            )}
          >
            {products.map((product) => {
              const category = categories.find(
                (c) => c.id === product.categoryId,
              );
              return (
                <ProductListCard
                  key={product.id}
                  product={product}
                  categoryName={category?.name ?? null}
                  onDelete={setConfirmDelete}
                />
              );
            })}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
                className={cn(
                  'h-9 px-4 rounded-lg text-sm font-semibold border transition-colors',
                  page <= 1
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 bg-white active:bg-slate-50',
                )}
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500 px-2">
                Página {meta.page} de {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
                className={cn(
                  'h-9 px-4 rounded-lg text-sm font-semibold border transition-colors',
                  page >= meta.totalPages
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-700 bg-white active:bg-slate-50',
                )}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar producto"
        description={
          confirmDelete
            ? `¿Eliminar "${confirmDelete.name}"? Esta acción no se puede deshacer. Solo funciona si no tiene presentaciones asignadas.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}