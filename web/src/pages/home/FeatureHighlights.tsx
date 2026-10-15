import type { IconType } from 'react-icons';
import {
  HiOutlineReceiptPercent,
  HiOutlineShieldCheck,
  HiOutlineTruck,
} from 'react-icons/hi2';

interface Feature {
  icon: IconType;
  title: string;
  subtitle: string;
}

const FEATURES: Feature[] = [
  {
    icon: HiOutlineTruck,
    title: 'Envíos',
    subtitle: 'a todo Uruguay',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Pagos seguros',
    subtitle: 'con Mercado Pago',
  },
  {
    icon: HiOutlineReceiptPercent,
    title: 'Descuentos',
    subtitle: 'por cantidad',
  },
];

export function FeatureHighlights() {
  return (
    <section className="grid grid-cols-3 gap-2 px-4 mt-4">
      {FEATURES.map((feature) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.title}
            className="flex flex-col items-center gap-2 rounded-xl bg-brand-50 px-2 py-3 text-center"
          >
            <Icon className="w-6 h-6 text-brand" />
            <div className="leading-tight">
              <p className="text-[11px] font-semibold text-slate-900">
                {feature.title}
              </p>
              <p className="text-[10px] text-slate-500">{feature.subtitle}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}