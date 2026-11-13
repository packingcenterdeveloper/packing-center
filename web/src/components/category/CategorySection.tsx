import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductCard } from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/queries/useProducts';
import type { Category } from '@/api/types';

interface CategorySectionProps {
  category: Category;
}

const PRODUCTS_LIMIT = 5;

function CardSkeleton() {
  return (
    <div className="flex-[0_0_auto] w-[calc(50%-6px)] sm:w-[calc(33.33%-8px)] lg:w-[calc(20%-10px)]">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="aspect-square bg-slate-100 animate-pulse" />
        <div className="p-3 space-y-2">
          <div className="h-3 w-3/4 rounded bg-slate-100 animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
          <div className="h-9 rounded-lg bg-slate-100 animate-pulse" />
        </div>
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

  // Opciones de Embla: arrastre libre, sin flechas ni auto-scroll
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

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

      {/* Contenedor del carrusel (viewport) */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        {/* Track (contenedor flex) */}
        <div className="flex gap-3 md:gap-4 -ml-3 md:-ml-4">
          {isLoading
            ? Array.from({ length: PRODUCTS_LIMIT }).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            : products.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_auto] w-[calc(50%-6px)] sm:w-[calc(33.33%-8px)] lg:w-[calc(20%-10px)] min-w-0 pl-3 md:pl-4"
                >
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}