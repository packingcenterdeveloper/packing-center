import { Link } from 'react-router-dom';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineEnvelope,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import { cn } from '@/lib/cn';

const WHATSAPP_URL = 'https://wa.me/59895301753';
const CONTACT_EMAIL = 'contacto@packingcenter.uy';

interface FooterLink {
  label: string;
  to: string;
}

const NAV_LINKS: FooterLink[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Categorías', to: '/categorias' },
  { label: 'Buscar', to: '/buscar' },
  { label: 'Mis pedidos', to: '/mis-pedidos' },
];

const CATEGORY_LINKS: FooterLink[] = [
  { label: 'Bandejas', to: '/categorias/bandejas-espuma' },
  { label: 'Vasos', to: '/categorias/vasos' },
  { label: 'Potes y envases', to: '/categorias/potes-envases' },
  { label: 'PVC film', to: '/categorias/pvc-film' },
  { label: 'Bolsas', to: '/categorias/bolsas' },
];

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'mt-12 bg-slate-900 text-slate-300 pb-20 md:pb-6',
        className,
      )}
    >
      <div className="px-5 pt-8 max-w-5xl mx-auto">
        {/* Brand */}
        <div className="flex flex-col items-start">
          <span className="text-lg font-extrabold tracking-tight text-white leading-none">
            PACKING
          </span>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-slate-400 mt-0.5">
            CENTER
          </span>
          <p className="text-sm text-slate-400 mt-3 max-w-xs">
            Packaging y descartables para acompañar cada pedido de tu
            negocio.
          </p>
        </div>

        {/* Contacto */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contacto
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors"
              >
                <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-brand-400 shrink-0" />
                +598 95 301 753
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors"
              >
                <HiOutlineEnvelope className="w-4 h-4 text-brand-400 shrink-0" />
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="inline-flex items-start gap-2.5 text-slate-300">
              <HiOutlineMapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span>ubicacion, Uruguay</span>
            </li>
          </ul>
        </div>

        {/* Navegación y categorías */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Navegación
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Categorías
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-slate-500">
          <p>© {year} PackingCenter. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}