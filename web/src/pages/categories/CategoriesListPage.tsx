import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/common/SearchInput';
import { CategoryCard } from '@/components/category/CategoryCard';
import { useCategories } from '@/hooks/queries/useCategories';
import { POPULAR_CATEGORY_SLUG } from '@/lib/constants';

function CardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full aspect-square rounded-xl bg-slate-100 animate-pulse" />
      <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}

export function CategoriesListPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCategories();

  const categories = (data ?? []).filter(
    (c) => c.slug !== POPULAR_CATEGORY_SLUG,
  );

  return (
    <div className="pb-8">
      <div className="px-4 pt-3">
        <SearchInput
          placeholder="Buscar productos..."
          onSubmit={(q) => {
            if (!q) return;
            navigate(`/buscar?q=${encodeURIComponent(q)}`);
          }}
        />
      </div>

      <div className="px-4 mt-5">
        <h1 className="text-lg font-bold text-slate-900 mb-4">
          Todas las categorías
        </h1>

        {isError ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            No se pudieron cargar las categorías.
          </p>
        ) : isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}