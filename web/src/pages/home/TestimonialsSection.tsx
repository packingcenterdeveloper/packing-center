import { HiStar } from 'react-icons/hi2';

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
  return (
    <section className="mt-8">
      <div className="px-4 mb-3">
        <h2 className="text-base font-bold text-slate-900">
          Lo que dicen nuestros clientes
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
        {TESTIMONIALS.map((t) => (
          <article
            key={t.name}
            className="snap-start shrink-0 w-[80%] max-w-[300px] rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm text-slate-700 leading-snug">"{t.quote}"</p>

            <div className="mt-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-brand">
                  {t.initials}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {t.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {t.business}
                </p>
              </div>
            </div>

            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <HiStar
                  key={i}
                  className={
                    i < t.rating
                      ? 'w-4 h-4 text-amber-400'
                      : 'w-4 h-4 text-slate-200'
                  }
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}