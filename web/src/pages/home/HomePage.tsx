import { useNavigate, Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import { SearchInput } from '@/components/common/SearchInput';
import { CategoryCard } from '@/components/category/CategoryCard';
import { useCategories } from '@/hooks/queries/useCategories';
import { POPULAR_CATEGORY_SLUG } from '@/lib/constants';
import { HeroBanner } from './HeroBanner';
import { FeatureHighlights } from './FeatureHighlights';
import { PopularProductsSection } from './PopularProductsSection';
import { PromoBanner } from './PromoBanner';
import { WhyChooseUs } from './WhyChooseUs';
import { SolutionsBanner } from './SolutionsBanner';
import { TestimonialsSection } from './TestimonialsSection';
import { SupportCTA } from './SupportCTA';
import { FaqSection } from './FaqSection';

const CATEGORY_SKELETON_COUNT = 8;

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full aspect-square rounded-xl bg-slate-100 animate-pulse" />
      <div className="h-3 w-14 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: categories, isLoading, isError } = useCategories();

  // Filtramos "populares" del grid general
  const visibleCategories = (categories ?? [])
    .filter((c) => c.slug !== POPULAR_CATEGORY_SLUG)
    .slice(0, 8);

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

      <HeroBanner />
      <FeatureHighlights />

      <section className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Categorías</h2>
          <Link
            to="/categorias"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand"
          >
            Ver todas
            <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isError ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            No se pudieron cargar las categorías.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-x-3 gap-y-4">
            {isLoading
              ? Array.from({ length: CATEGORY_SKELETON_COUNT }).map((_, i) => (
                  <CategorySkeleton key={i} />
                ))
              : visibleCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
          </div>
        )}
      </section>

      <PopularProductsSection />
      <PromoBanner />
      <WhyChooseUs />
      <SolutionsBanner />
      <TestimonialsSection />
      <SupportCTA />
      <FaqSection />
    </div>
  );
}