import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import { ProductCard } from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/queries/useProducts';
import { POPULAR_CATEGORY_SLUG } from '@/lib/constants';

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

export function PopularProductsSection() {
  const { data, isLoading } = useProducts({
    category: POPULAR_CATEGORY_SLUG,
    limit: 8,
  });

  const products = data?.data ?? [];

  // Si no hay productos en "populares", ocultamos toda la sección
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-8 px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-900">Más populares</h2>
        <Link
          to={`/categorias/${POPULAR_CATEGORY_SLUG}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand"
        >
          Ver todos
          <HiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}