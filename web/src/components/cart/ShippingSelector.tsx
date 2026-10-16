import { SHIPPING_OPTIONS } from '@/lib/shipping';
import { useCartStore } from '@/stores/cart.store';

export function ShippingSelector() {
  const shippingDepartment = useCartStore((s) => s.shippingDepartment);
  const setShippingDepartment = useCartStore((s) => s.setShippingDepartment);

  return (
    <div>
      <label
        htmlFor="shipping-dept"
        className="block text-xs font-medium text-slate-600 mb-1.5"
      >
        Localidad de envío
      </label>
      <select
        id="shipping-dept"
        value={shippingDepartment ?? ''}
        onChange={(e) => setShippingDepartment(e.target.value || null)}
        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      >
        <option value="">Elegir localidad</option>
        <optgroup label="Envío gratis">
          {SHIPPING_OPTIONS.filter((o) => o.isFree).map((o) => (
            <option key={o.value} value={o.value}>{o.label} (Gratis)</option>
            ))}
        </optgroup>
        <optgroup label="Resto del país (DAC)">
          {SHIPPING_OPTIONS.filter((o) => !o.isFree).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </optgroup>
      </select>
    </div>
    );
}