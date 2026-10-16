import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getLastOrder } from '@/lib/lastOrder';

export function CheckoutResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status') ?? '';
    const externalReference = searchParams.get('external_reference') ?? '';
    const lastOrder = getLastOrder();

    // Preferimos el external_reference que MP agrega a la URL.
    // Si no está, caemos al último pedido guardado en sessionStorage.
    const orderId = externalReference || lastOrder?.id || '';
    const phone = lastOrder?.phone ?? '';

    if (!orderId || !phone) {
      // No podemos armar la URL: mandamos a mis-pedidos
      navigate('/mis-pedidos', { replace: true });
      return;
    }

    const next = new URLSearchParams({ phone });
    if (status) next.set('status', status);

    navigate(`/pedido/${orderId}?${next.toString()}`, { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-sm text-slate-500">Redirigiendo...</p>
    </div>
  );
}