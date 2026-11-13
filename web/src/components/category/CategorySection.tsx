import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import { ProductCard } from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/queries/useProducts';
import type { Category } from '@/api/types';

interface CategorySectionProps {
  category: Category;
}

const PRODUCTS_LIMIT = 5;

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

export function CategorySection({ category }: CategorySectionProps) {
  const { data, isLoading } = useProducts({
    category: category.slug,
    limit: PRODUCTS_LIMIT,
  });

  const products = data?.data ?? [];

  // Si no hay productos y ya terminó de cargar, no mostramos la sección
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-slate-900">
          {category.name}
        </h2>
        <Link
          to={`/categorias/${category.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-700 transition-colors"
        >
          Ver todos
          <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {isLoading
          ? Array.from({ length: PRODUCTS_LIMIT }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}