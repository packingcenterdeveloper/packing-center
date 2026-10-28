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
import { RevealOnScroll } from '@/components/common/RevealOnScroll';

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

  const visibleCategories = (categories ?? [])
  .filter((c) => c.slug !== POPULAR_CATEGORY_SLUG)
    .slice(0, 6); // En PC mostramos 6

  return (
    <div className="pb-8">
      {/* Buscador Mobile */}
      <div className="px-4 pt-3 md:hidden">
        <SearchInput
          placeholder="Buscar productos..."
          onSubmit={(q) => {
            if (!q) return;
            navigate(`/buscar?q=${encodeURIComponent(q)}`);
          }}
        />
      </div>

      <HeroBanner />
      
        <RevealOnScroll>
          <FeatureHighlights />
        </RevealOnScroll>
      
        <RevealOnScroll>
          <section className="mt-8 mb-12 md:mt-12 px-4 md:px-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Comprá por categoría</h2>
              <Link
                to="/categorias"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
              >
                Ver todas
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isError ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No se pudieron cargar las categorías.
              </p>
              ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-6">
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
        </RevealOnScroll>


        <RevealOnScroll>
          <PopularProductsSection />
        </RevealOnScroll>

        <RevealOnScroll>
          <PromoBanner />
        </RevealOnScroll>

        <RevealOnScroll>
          <WhyChooseUs />
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
            <SolutionsBanner />
            <SupportCTA />
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <TestimonialsSection />
        </RevealOnScroll>

        <RevealOnScroll>
          <FaqSection />
        </RevealOnScroll>
        
        
      </div>
      );
}