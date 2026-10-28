import type { IconType } from 'react-icons';
import {
  HiOutlineBanknotes,
  HiOutlineCube,
  HiOutlineTruck,
  HiOutlineUserCircle,
} from 'react-icons/hi2';

interface Reason {
  icon: IconType;
  title: string;
  subtitle: string;
}

const REASONS: Reason[] = [
  {
    icon: HiOutlineBanknotes,
    title: 'Precios competitivos',
    subtitle: 'La mejor relación precio-calidad.',
  },
  {
    icon: HiOutlineCube,
    title: 'Stock permanente',
    subtitle: 'Siempre disponible para tu negocio.',
  },
  {
    icon: HiOutlineUserCircle,
    title: 'Atención personalizada',
    subtitle: 'Estamos para ayudarte.',
  },
  {
    icon: HiOutlineTruck,
    title: 'Envíos a todo Uruguay',
    subtitle: 'Llegamos a donde estés.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="px-4 mt-8 md:px-0">
      <h2 className="text-base font-bold text-slate-900 mb-3">
        ¿Por qué elegirnos?
      </h2>
      <div className="WhyChooseUsGridContainerMB grid grid-cols-4 gap-4">
        {REASONS.map((reason) => {
          const Icon = reason.icon;
          return (
            <div
              key={reason.title}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="WhyChooseUsGridContainerIcon w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center mb-2">
                <Icon className="WhyChooseUsGridIcon w-5 h-5 text-brand" />
              </div>
              <p className="WhyChooseUsGridContainerP1 text-xs font-semibold text-slate-900 leading-tight">
                {reason.title}
              </p>
              <p className="WhyChooseUsGridContainerP2 text-[11px] text-slate-500 mt-1 leading-tight">
                {reason.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}