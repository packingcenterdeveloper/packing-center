import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';

const SOLUTIONS_IMAGE = 'https://i.postimg.cc/CxrNXwL0/Tubos.jpg';

export function SolutionsBanner() {
  return (
    <section className="mt-8 md:px-0 px-4">
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-full">
        <img
          src={SOLUTIONS_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent" />

        <div className="relative p-5 pt-16 text-white">
          <h3 className="text-xl font-extrabold leading-tight capitalize">
            Soluciones en packaging
          </h3>
          <p className="mt-1 text-sm text-white/85">
            Para todo tipo de negocios
          </p>
          <Link
            to="/categorias"
            className="transition-all duration-200 hover:scale-105 active:scale-95 mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-white text-slate-900 text-sm font-bold active:scale-95 transition-transform"
          >
            Ver categorías
            <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}