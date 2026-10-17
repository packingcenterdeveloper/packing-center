import { useMemo, useState } from 'react';
import {
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { CategoryFormDialog } from './CategoryFormDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAdminCategories } from '@/hooks/queries/useAdminCategories';
import { useDeleteCategory } from '@/hooks/mutations/useCategoryMutations';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Category } from '@/api/types';

export function CategoriesPage() {
  const { data, isLoading, isError } = useAdminCategories();
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const categories = useMemo(() => data ?? [], [data]);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      toast.success('Categoría eliminada');
      setConfirmDelete(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo eliminar';
      toast.error(message);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Categorías</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organizá los productos en categorías. Los clientes navegan el
            catálogo por categorías.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-lg bg-brand text-white text-sm font-semibold active:bg-brand-700"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva categoría</span>
          <span className="sm:hidden">Nueva categoría</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-rose-600 text-center py-12">
          No se pudieron cargar las categorías.
        </p>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-50 mx-auto flex items-center justify-center mb-3">
            <HiOutlineSquares2X2 className="w-6 h-6 text-brand" />
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Todavía no hay categorías
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            Creá la primera para empezar a organizar tu catálogo.
          </p>
          <button
            type="button"
            onClick={handleNew}
            className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand text-white text-sm font-semibold"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Crear categoría
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.slug);
            return (
              <li
                key={category.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {category.name}
                    </p>
                    {!category.isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-slate-100 text-slate-500">
                        Oculta
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                    /{category.slug}
                  </p>
                  {category.description && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200"
                    aria-label={`Editar ${category.name}`}
                  >
                    <HiOutlinePencilSquare className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(category)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100"
                    aria-label={`Eliminar ${category.name}`}
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar categoría"
        description={
          confirmDelete
            ? `¿Eliminar "${confirmDelete.name}"? Esta acción no se puede deshacer. Solo funciona si la categoría no tiene productos asignados.`
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