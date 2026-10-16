import { Link } from 'react-router-dom';
import { HiOutlineReceiptPercent } from 'react-icons/hi2';

export function PromoBanner() {
  return (
    <section className="mt-8 px-4">
      <Link
        to="/categorias"
        className="flex items-center gap-3 rounded-xl bg-brand text-white px-4 py-4 active:bg-brand-700 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <HiOutlineReceiptPercent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">
            Descuentos por cantidad
          </p>
          <p className="text-xs text-white/85 mt-0.5">
            ¡Cuanto más comprás, más ahorrás!
          </p>
        </div>
      </Link>
    </section>
  );
}