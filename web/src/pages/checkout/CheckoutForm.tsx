import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiOutlineCreditCard } from 'react-icons/hi2';
import { SHIPPING_OPTIONS } from '@/lib/shipping';
import {
  checkoutSchema,
  type CheckoutFormValues,
} from '@/lib/validation';
import { cn } from '@/lib/cn';
import { formatCents } from '@/lib/format';
import type { Quote } from '@/api/types';

interface CheckoutFormProps {
  quote: Quote;
  defaultValues?: Partial<CheckoutFormValues>;
  onSubmit: (values: CheckoutFormValues) => void;
  submitting: boolean;
  errorMessage: string | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

const inputBase =
  'w-full h-11 px-3 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

export function CheckoutForm({
  quote,
  defaultValues,
  onSubmit,
  submitting,
  errorMessage,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
    mode: 'onBlur',
  });

  return (
    <form
      id="checkout-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Tus datos</h2>

        <div>
          <label
            htmlFor="customerName"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Nombre y apellido
          </label>
          <input
            id="customerName"
            type="text"
            autoComplete="name"
            {...register('customerName')}
            className={cn(
              inputBase,
              errors.customerName ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="Ej: María González"
          />
          <FieldError message={errors.customerName?.message} />
        </div>

        <div>
          <label
            htmlFor="customerPhone"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Teléfono
          </label>
          <input
            id="customerPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register('customerPhone')}
            className={cn(
              inputBase,
              errors.customerPhone ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="Ej: 099 123 456"
          />
          <FieldError message={errors.customerPhone?.message} />
        </div>

        <div>
          <label
            htmlFor="customerEmail"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Email <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="customerEmail"
            type="email"
            autoComplete="email"
            {...register('customerEmail')}
            className={cn(
              inputBase,
              errors.customerEmail ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="tu@email.com"
          />
          <FieldError message={errors.customerEmail?.message} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Dirección de entrega
        </h2>

        <div>
          <label
            htmlFor="shippingDepartment"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Localidad
          </label>
          <select
            id="shippingDepartment"
            {...register('shippingDepartment')}
            className={cn(
              inputBase,
              'pr-8',
              errors.shippingDepartment
                ? 'border-rose-300'
                : 'border-slate-200',
            )}
          >
            <option value="">Elegir localidad</option>
            <optgroup label="Envío gratis">
              {SHIPPING_OPTIONS.filter((o) => o.isFree).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} (Gratis)
                </option>
              ))}
            </optgroup>
            <optgroup label="Resto del país (DAC)">
              {SHIPPING_OPTIONS.filter((o) => !o.isFree).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          </select>
          <FieldError message={errors.shippingDepartment?.message} />
        </div>

        <div>
          <label
            htmlFor="customerCity"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Ciudad o barrio
          </label>
          <input
            id="customerCity"
            type="text"
            autoComplete="address-level2"
            {...register('customerCity')}
            className={cn(
              inputBase,
              errors.customerCity ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="Ej: Ciudad de la Costa"
          />
          <FieldError message={errors.customerCity?.message} />
        </div>

        <div>
          <label
            htmlFor="customerAddress"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Dirección
          </label>
          <input
            id="customerAddress"
            type="text"
            autoComplete="street-address"
            {...register('customerAddress')}
            className={cn(
              inputBase,
              errors.customerAddress
                ? 'border-rose-300'
                : 'border-slate-200',
            )}
            placeholder="Calle y número"
          />
          <FieldError message={errors.customerAddress?.message} />
        </div>

        <div>
          <label
            htmlFor="customerNotes"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Referencia o notas{' '}
            <span className="text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="customerNotes"
            rows={2}
            {...register('customerNotes')}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none',
              errors.customerNotes ? 'border-rose-300' : 'border-slate-200',
            )}
            placeholder="Ej: portón verde, tocar timbre 2"
          />
          <FieldError message={errors.customerNotes?.message} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Forma de pago</h2>
        <div className="flex items-center gap-3 rounded-lg border border-brand bg-brand-50 p-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
            <HiOutlineCreditCard className="w-5 h-5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Mercado Pago
            </p>
            <p className="text-[11px] text-slate-500">
              Tarjetas, débito y dinero en cuenta
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Resumen</h2>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="text-slate-900">
              {formatCents(quote.subtotalCents)}
            </span>
          </div>

          {quote.quantityDiscountCents + quote.couponDiscountCents > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Descuentos</span>
              <span className="text-emerald-600">
                -{' '}
                {formatCents(
                  quote.quantityDiscountCents + quote.couponDiscountCents,
                )}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-600">Envío</span>
            <span className="text-right text-xs text-slate-500 max-w-[60%]">
              Se coordina al confirmar
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-base font-bold text-slate-900">Total</span>
          <span className="text-lg font-extrabold text-slate-900">
            {formatCents(quote.totalCents)}
          </span>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          'w-full h-12 rounded-lg font-semibold text-sm inline-flex items-center justify-center transition-colors',
          submitting
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-brand text-white active:bg-brand-700',
        )}
      >
        {submitting ? 'Procesando...' : 'Ir a pagar con Mercado Pago'}
      </button>
    </form>
  );
}