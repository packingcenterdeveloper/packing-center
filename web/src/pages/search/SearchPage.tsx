import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchInput } from '@/components/common/SearchInput';
import { useProducts } from '@/hooks/queries/useProducts';

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

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [input, setInput] = useState(q);

  // Sync input si la URL cambia (por ejemplo, si el usuario navega desde el home)
  useEffect(() => {
    setInput(q);
  }, [q]);

  const productsQuery = useProducts({
    search: q || undefined,
    limit: 100,
  });

  const products = productsQuery.data?.data ?? [];
  const total = productsQuery.data?.meta.total ?? 0;

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-slate-50 pt-3 pb-3">
        <div className="px-4">
          <SearchInput
            defaultValue={q}
            placeholder="Buscar productos..."
            onSubmit={(value) => {
              const next = new URLSearchParams();
              if (value) next.set('q', value);
              setSearchParams(next, { replace: true });
            }}
          />
        </div>
      </div>

      <div className="px-4 mt-2">
        {!q ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-50 mx-auto flex items-center justify-center mb-3">
              <HiOutlineMagnifyingGlass className="w-6 h-6 text-brand" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Buscá lo que necesitás
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
              Escribí el nombre de un producto y presioná Enter para ver
              resultados.
            </p>
          </div>
        ) : productsQuery.isError ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            No se pudieron cargar los resultados.
          </p>
        ) : productsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-900">
              Sin resultados
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
              No encontramos productos para "{q}". Probá con otra palabra o
              revisá el catálogo.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3">
              {total} {total === 1 ? 'resultado' : 'resultados'} para "{q}"
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