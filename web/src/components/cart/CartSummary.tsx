import { Link } from 'react-router-dom';
import { HiOutlineTruck } from 'react-icons/hi2';
import { formatCents } from '@/lib/format';
import { findShippingOption, SHIPPING_COST_LABEL } from '@/lib/shipping';
import { useCartStore } from '@/stores/cart.store';
import type { Quote } from '@/api/types';

interface CartSummaryProps {
  quote: Quote;
  shippingSelector?: React.ReactNode;
}

export function CartSummary({ quote, shippingSelector }: CartSummaryProps) {
  const shippingDepartment = useCartStore((s) => s.shippingDepartment);
  const option = findShippingOption(shippingDepartment);

  const totalDiscounts =
    quote.quantityDiscountCents + quote.couponDiscountCents;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      {shippingSelector && <div>{shippingSelector}</div>}

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Subtotal</span>
        <span className="font-medium text-slate-900">
          {formatCents(quote.subtotalCents)}
        </span>
      </div>

      {totalDiscounts > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Descuentos</span>
          <span className="font-medium text-emerald-600">
            - {formatCents(totalDiscounts)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <HiOutlineTruck className="w-4 h-4" />
          Envío
        </span>
        <span className="text-right text-xs text-slate-500 max-w-[60%]">
          {!option
            ? 'A coordinar'
            : option.isFree
              ? `${option.label}: Gratis`
              : SHIPPING_COST_LABEL}
        </span>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-base font-bold text-slate-900">Total</span>
        <span className="text-lg font-extrabold text-slate-900">
          {formatCents(quote.totalCents)}
        </span>
      </div>

      <Link
        to="/checkout"
        className="transition-all duration-200 hover:bg-brand-700 mt-1 inline-flex items-center justify-center w-full h-11 rounded-lg bg-brand text-white text-sm font-semibold active:bg-brand-700"
      >
        Continuar compra
      </Link>
    </div>
  );
}