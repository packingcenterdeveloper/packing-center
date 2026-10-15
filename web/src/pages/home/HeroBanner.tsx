import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';

const HERO_IMAGE = 'https://i.postimg.cc/CxrNXwL0/Tubos.jpg';

export function HeroBanner() {
  return (
    <section className="relative rounded-2xl mx-0 mt-3 bg-slate-900">
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />

      <div className="relative px-5 py-8 text-white">
        <h1 className="text-2xl font-extrabold leading-tight max-w-[240px]">
          Todo para tu negocio, en un solo lugar
        </h1>
        <p className="mt-2 text-sm text-white/85 max-w-[260px]">
          Packaging y descartables para acompañar cada pedido.
        </p>
        <Link
          to="/categorias"
          className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-brand text-white text-sm font-semibold active:scale-95 transition-transform"
        >
          Explorar catálogo
          <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}