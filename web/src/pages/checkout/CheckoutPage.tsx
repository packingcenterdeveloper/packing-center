import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { CheckoutForm } from './CheckoutForm';
import { useQuote } from '@/hooks/queries/useQuote';
import { useCheckout } from '@/hooks/mutations/useCheckout';
import { useCartStore } from '@/stores/cart.store';
import { setLastOrder } from '@/lib/lastOrder';
import { normalizePhone } from '@/lib/format';
import { ApiError } from '@/api/client';
import type { CheckoutFormValues } from '@/lib/validation';

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const coupons = useCartStore((s) => s.coupons);
  const shippingDepartment = useCartStore((s) => s.shippingDepartment);
  const clear = useCartStore((s) => s.clear);

  const quoteQuery = useQuote();
  const checkoutMutation = useCheckout();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quote = quoteQuery.data;

  // Si el carrito está vacío y no estamos procesando, volvemos al carrito
  useEffect(() => {
    if (items.length === 0 && !checkoutMutation.isPending) {
      navigate('/carrito', { replace: true });
    }
  }, [items.length, checkoutMutation.isPending, navigate]);

  const handleSubmit = async (values: CheckoutFormValues) => {
    if (!quote) return;

    setErrorMessage(null);

    try {
      const result = await checkoutMutation.mutateAsync({
        customer: {
          name: values.customerName.trim(),
          phone: normalizePhone(values.customerPhone),
          email: values.customerEmail?.trim() || undefined,
          address: values.customerAddress.trim(),
          city: values.customerCity.trim(),
          notes: values.customerNotes?.trim() || undefined,
        },
        items: items.map((i) => ({
          presentationId: i.presentationId,
          quantity: i.quantity,
        })),
        coupons,
        shippingDepartment: values.shippingDepartment,
        paymentMethod: 'mercadopago',
      });

      // Guardamos el pedido para poder volver desde MP
      setLastOrder({ id: result.order.id, phone: result.order.customerPhone });

      // Limpiamos el carrito
      clear();

      if (result.initPoint) {
        // Redirigimos a Mercado Pago
        window.location.href = result.initPoint;
      } else {
        // Fallback: si por algún motivo no hay initPoint, vamos a la confirmación
        toast.error(
          'No se pudo iniciar el pago con Mercado Pago. Contactanos.',
        );
        navigate(`/pedido/${result.order.id}`, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        toast.error(err.message);
      } else {
        setErrorMessage('No se pudo procesar el pedido. Intentá de nuevo.');
        toast.error('Error procesando el pedido');
      }
    }
  };

  return (
    <div className="pb-8">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 h-14 px-4 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-700"
            aria-label="Volver"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-slate-900">
            Finalizar compra
          </h1>
        </div>
      </div>

      <div className="px-4 mt-4 max-w-3xl mx-auto">
        {!quote ? (
          <div className="space-y-4">
            <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        ) : (
          <CheckoutForm
            quote={quote}
            defaultValues={{ shippingDepartment: shippingDepartment ?? undefined }}
            onSubmit={handleSubmit}
            submitting={checkoutMutation.isPending}
            errorMessage={errorMessage}
          />
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Al confirmar, se te redirige a Mercado Pago para completar el pago.{' '}
          <Link to="/carrito" className="text-brand font-medium">
            Volver al carrito
          </Link>
        </p>
      </div>
    </div>
  );
}