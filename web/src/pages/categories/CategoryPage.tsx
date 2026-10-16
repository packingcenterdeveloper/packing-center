import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { HiArrowLeft, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { ProductCard } from '@/components/product/ProductCard';
import { SubcategoryChips } from '@/components/category/SubcategoryChips';
import { useCategoryBySlug } from '@/hooks/queries/useCategoryBySlug';
import { useProducts } from '@/hooks/queries/useProducts';
import { useSubcategories } from '@/hooks/queries/useSubcategories';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { cn } from '@/lib/cn';

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="aspect-square bg-slate-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 rounded bg-slate-100 animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
        <div className="h-9 rounded-lg bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get('q') ?? '',
  );

  const subcategory = searchParams.get('sub');
  const search = searchParams.get('q') ?? undefined;

  const categoryQuery = useCategoryBySlug(slug);
  const subcategoriesQuery = useSubcategories(slug);
  const productsQuery = useProducts({
    category: slug,
    subcategory: subcategory ?? undefined,
    search,
    limit: 100,
  });

  if (categoryQuery.isError) {
    return <NotFoundPage />;
  }

  const setSubcategory = (sub: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (sub) next.set('sub', sub);
    else next.delete('sub');
    setSearchParams(next, { replace: true });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    const trimmed = searchInput.trim();
    if (trimmed) next.set('q', trimmed);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const products = productsQuery.data?.data ?? [];
  const total = productsQuery.data?.meta.total ?? 0;

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-slate-50 pt-3">
        <div className="px-4 flex items-center gap-3">
          <Link
            to="/categorias"
            className="p-1 -ml-1 text-slate-700"
            aria-label="Volver"
          >
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-bold text-slate-900 truncate flex-1">
            {categoryQuery.data?.name ?? 'Cargando...'}
          </h1>
        </div>

        <div className="px-4 mt-3">
          <form onSubmit={submitSearch} className="relative">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar en esta categoría..."
              className="w-full h-10 pl-4 pr-11 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-slate-500"
            >
              <HiOutlineMagnifyingGlass className="w-5 h-5" />
            </button>
          </form>
        </div>

        {subcategoriesQuery.data && subcategoriesQuery.data.length > 0 && (
          <div className="mt-3 px-4">
            <SubcategoryChips
              subcategories={subcategoriesQuery.data}
              active={subcategory}
              onChange={setSubcategory}
            />
          </div>
        )}
      </div>

      <div className="px-4 mt-4">
        {productsQuery.isError ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            No se pudieron cargar los productos.
          </p>
        ) : productsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">
              No hay productos que coincidan.
            </p>
            {(subcategory || search) && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchParams({}, { replace: true });
                }}
                className="mt-3 text-sm font-semibold text-brand"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3">
              {total} {total === 1 ? 'producto' : 'productos'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}