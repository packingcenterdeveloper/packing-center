import { useState, type FormEvent } from 'react';
import { HiOutlineTicket, HiXMark } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { quote as fetchQuote } from '@/api/cart';
import { useCartStore } from '@/stores/cart.store';
import { cn } from '@/lib/cn';

interface CouponInputProps {
  appliedCoupons: string[];
}

export function CouponInput({ appliedCoupons }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const items = useCartStore((s) => s.items);
  const shippingDepartment = useCartStore((s) => s.shippingDepartment);
  const addCoupon = useCartStore((s) => s.addCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    if (appliedCoupons.includes(trimmed)) {
      toast.error('Ese cupón ya está aplicado');
      return;
    }

    setLoading(true);
    try {
      const result = await fetchQuote({
        items,
        coupons: [...appliedCoupons, trimmed],
        shippingDepartment: shippingDepartment ?? undefined,
      });

      const appliedToAny = result.items.some(
        (i) => i.couponCode === trimmed,
      );

      if (!appliedToAny) {
        const warning = result.warnings.find((w) => w.includes(trimmed));
        toast.error(warning ?? 'El cupón no aplica a este carrito');
        return;
      }

      addCoupon(trimmed);
      setCode('');
      toast.success('Cupón aplicado');
    } catch {
      toast.error('No se pudo validar el cupón');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <HiOutlineTicket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="¿Tenés un cupón?"
            disabled={loading}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className={cn(
            'transition-all duration-200 hover:scale-105 hover:text-white hover:bg-brand-700 active:scale-95 h-10 px-4 rounded-lg text-sm font-semibold transition-colors',
            loading || !code.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-brand text-white active:bg-brand-700',
          )}
        >
          {loading ? '...' : 'Aplicar'}
        </button>
      </form>

      {appliedCoupons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {appliedCoupons.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand px-2.5 py-1 text-xs font-semibold"
            >
              {c}
              <button
                type="button"
                onClick={() => removeCoupon(c)}
                aria-label={`Quitar cupón ${c}`}
                className="ml-0.5 text-brand/70 active:text-brand"
              >
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}