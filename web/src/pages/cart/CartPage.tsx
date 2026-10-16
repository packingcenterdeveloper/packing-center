import { Link } from 'react-router-dom';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CouponInput } from '@/components/cart/CouponInput';
import { CartSummary } from '@/components/cart/CartSummary';
import { ShippingSelector } from '@/components/cart/ShippingSelector';
import { useQuote } from '@/hooks/queries/useQuote';
import { useCartStore } from '@/stores/cart.store';

function RowSkeleton() {
  return (
    <div className="flex gap-3 py-4 border-b border-slate-100">
      <div className="w-16 h-16 rounded-lg bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-slate-100 animate-pulse" />
        <div className="h-3 w-1/4 rounded bg-slate-100 animate-pulse" />
        <div className="h-8 w-32 rounded bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

export function CartPage() {
  const storeItems = useCartStore((s) => s.items);
  const coupons = useCartStore((s) => s.coupons);

  const quoteQuery = useQuote();
  const quote = quoteQuery.data;

  if (storeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
          <HiOutlineShoppingBag className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-base font-bold text-slate-900">
          Tu carrito está vacío
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-xs">
          Agregá productos desde el catálogo para empezar tu pedido.
        </p>
        <Link
          to="/categorias"
          className="mt-5 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-brand text-white text-sm font-semibold"
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-slate-50 border-b border-slate-200">
        <div className="px-4 h-12 flex items-center">
          <h1 className="text-base font-bold text-slate-900">
            Carrito
            {quote && (
              <span className="text-slate-400 font-medium">
                {' '}
                ({quote.items.reduce((sum, i) => sum + i.quantity, 0)})
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="px-4 mt-3">
        {quoteQuery.isError && !quote ? (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
            {quoteQuery.error instanceof Error
              ? quoteQuery.error.message
              : 'No se pudo cotizar el carrito.'}
          </div>
        ) : !quote ? (
          // Primera carga (no hay data previa)
          <>
            {storeItems.map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            <div>
              {quote.items.map((item) => (
                <CartItemRow
                  key={item.presentationId}
                  item={item}
                  available={Math.max(item.quantity, 9999)}
                />
              ))}
            </div>

            <div className="mt-4">
              <CouponInput appliedCoupons={coupons} />
            </div>

            {quote.warnings.length > 0 && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1">
                {quote.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-800">
                    {w}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-4">
              <CartSummary
                quote={quote}
                shippingSelector={<ShippingSelector />}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}