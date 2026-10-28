import { useEffect, useRef, useState } from 'react';
import { HiStar } from 'react-icons/hi2';
import { cn } from '@/lib/cn';

interface Testimonial {
  name: string;
  business: string;
  rating: number;
  quote: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'María González',
    business: 'Panadería La Estrella',
    rating: 5,
    quote:
      'Excelente atención y muy buenos precios. Siempre encuentro lo que necesito para mi negocio. ¡Totalmente recomendados!',
    initials: 'MG',
  },
  {
    name: 'Carlos Rodríguez',
    business: 'Rotisería Don Carlos',
    rating: 5,
    quote:
      'Hace años que les compro. La calidad es siempre la misma y los envíos llegan en tiempo.',
    initials: 'CR',
  },
  {
    name: 'Lucía Fernández',
    business: 'Catering Lucía',
    rating: 4,
    quote:
      'Muy buena variedad de productos y la atención es excelente. Los recomiendo para eventos.',
    initials: 'LF',
  },
];

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Índices de las posiciones de navegación realmente disponibles.
  const [dotIndexes, setDotIndexes] = useState<number[]>([]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateNavigation = () => {
      const cards = Array.from(
        container.children
      ) as HTMLElement[];

      if (cards.length === 0) return;

      const maxScroll = Math.max(
        0,
        container.scrollWidth - container.clientWidth
      );

      // Si todas las tarjetas entran en pantalla, no hacen falta dots.
      if (maxScroll <= 1) {
        setDotIndexes([]);
        setActiveIndex(0);
        return;
      }

      const firstCardLeft =
        cards[0].getBoundingClientRect().left;

      const stops: { index: number; left: number }[] = [];

      cards.forEach((card, index) => {
        const cardLeft = card.getBoundingClientRect().left;

        // Distancia de desplazamiento necesaria para llegar a esta tarjeta.
        const targetLeft = Math.min(
          maxScroll,
          Math.max(0, cardLeft - firstCardLeft)
        );

        // Evitamos crear dots que llevan exactamente a la misma posición.
        const alreadyExists = stops.some(
          (stop) => Math.abs(stop.left - targetLeft) < 2
        );

        if (!alreadyExists) {
          stops.push({
            index,
            left: targetLeft,
          });
        }
      });

      setDotIndexes(stops.map((stop) => stop.index));

      // Conservamos el dot correspondiente a la posición actual.
      let nearestIndex = stops[0]?.index ?? 0;
      let nearestDistance = Infinity;

      stops.forEach((stop) => {
        const distance = Math.abs(
          container.scrollLeft - stop.left
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = stop.index;
        }
      });

      setActiveIndex(nearestIndex);
    };

    const observer = new ResizeObserver(updateNavigation);

    observer.observe(container);

    Array.from(container.children).forEach((card) => {
      observer.observe(card);
    });

    updateNavigation();

    return () => {
      observer.disconnect();
    };
  }, []);

  // Detecta la posición activa mientras el carrusel se desplaza.
  const handleScroll = () => {
    const container = scrollRef.current;

    if (!container || dotIndexes.length === 0) return;

    const cards = Array.from(
      container.children
    ) as HTMLElement[];

    if (cards.length === 0) return;

    const maxScroll = Math.max(
      0,
      container.scrollWidth - container.clientWidth
    );

    const firstCardLeft =
      cards[0].getBoundingClientRect().left;

    let nearestIndex = dotIndexes[0];
    let nearestDistance = Infinity;

    dotIndexes.forEach((index) => {
      const card = cards[index];
      if (!card) return;

      const targetLeft = Math.min(
        maxScroll,
        Math.max(
          0,
          card.getBoundingClientRect().left - firstCardLeft
        )
      );

      const distance = Math.abs(
        container.scrollLeft - targetLeft
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex((current) =>
      current === nearestIndex ? current : nearestIndex
    );
  };

  // Navega a la posición elegida mediante los dots.
  const scrollTo = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const cards = Array.from(
      container.children
    ) as HTMLElement[];

    const firstCard = cards[0];
    const targetCard = cards[index];

    if (!firstCard || !targetCard) return;

    const targetLeft =
      targetCard.getBoundingClientRect().left -
      firstCard.getBoundingClientRect().left;

    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  };

  return (
    <section className="mt-8 md:mt-12">
      <div className="mb-3 px-4 md:px-0">
        <h2 className="text-lg font-bold text-slate-900">
          Lo que dicen nuestros clientes
        </h2>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide md:px-0"
      >
        {TESTIMONIALS.map((t) => (
          <article
            key={t.name}
            className={cn(
              'snap-start shrink-0 rounded-xl border border-slate-200 bg-white p-5',
              'w-full sm:w-[calc(50%-6px)]',
              '2xl:w-[calc(33.333%-8px)]'
            )}
          >
            <p className="text-sm leading-snug text-slate-700">
              "{t.quote}"
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <span className="text-xs font-bold text-brand">
                  {t.initials}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {t.name}
                </p>

                <p className="truncate text-[11px] text-slate-500">
                  {t.business}
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <HiStar
                  key={i}
                  className={
                    i < t.rating
                      ? 'h-4 w-4 text-amber-400'
                      : 'h-4 w-4 text-slate-200'
                  }
                />
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Los dots solo aparecen si existen posiciones de navegación. */}
      {dotIndexes.length > 0 && (
        <div className="mt-4 flex justify-center gap-2">
          {dotIndexes.map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Ir al testimonio ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                activeIndex === index
                  ? 'w-6 bg-brand'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}