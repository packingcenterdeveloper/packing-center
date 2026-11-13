import { useNavigate, Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import { SearchInput } from '@/components/common/SearchInput';
import { CategorySection } from '@/components/category/CategorySection';
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

function CategorySectionSkeleton() {
  return (
    <div className="mt-10 px-4 md:px-0">
      <div className="h-6 w-40 rounded bg-slate-100 animate-pulse mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-slate-100 animate-pulse"
            />
            ))}
      </div>
    </div>
    );
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: categories, isLoading, isError } = useCategories();

  const visibleCategories = (categories ?? []).filter(
    (c) => c.slug !== POPULAR_CATEGORY_SLUG,
    );

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
        {isError ? (
          <p className="mt-8 text-sm text-slate-500 py-6 text-center px-4">
            No se pudieron cargar las categorías.
          </p>
          ) : isLoading ? (
          <>
          <CategorySectionSkeleton />
          <CategorySectionSkeleton />
          </>
          ) : (
          visibleCategories.map((category) => (
            <CategorySection key={category.id} category={category} />
            ))
          )}

          {!isLoading && !isError && visibleCategories.length > 0 && (
            <div className="mt-10 px-4 md:px-0 flex justify-center">
              <Link
                to="/categorias"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                Ver todas las categorías
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            )}
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