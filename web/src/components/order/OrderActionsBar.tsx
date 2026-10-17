import { useState } from 'react';
import {
  HiCheckCircle,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineTrash,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/cn';
import {
  canTransition,
  nextStatus,
  ORDER_STATUS_FLOW,
} from '@/lib/orderStatusFlow';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { ApiError } from '@/api/client';
import {
  useCancelOrder,
  useDeleteOrder,
  useMarkPaid,
  useUpdateOrderStatus,
} from '@/hooks/mutations/useOrderMutations';
import type { Order, OrderStatus } from '@/api/types';

interface OrderActionsBarProps {
  order: Order;
  onDownload: () => void;
  downloading: boolean;
  onDeleted: () => void;
}

export function OrderActionsBar({
  order,
  onDownload,
  downloading,
  onDeleted,
}: OrderActionsBarProps) {
  const updateStatus = useUpdateOrderStatus(order.id);
  const markPaid = useMarkPaid(order.id);
  const cancelOrder = useCancelOrder(order.id);
  const deleteOrder = useDeleteOrder(order.id);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const next = nextStatus(order.status);
  const allowedTransitions = ORDER_STATUS_FLOW[order.status] ?? [];
  const canCancel = canTransition(order.status, 'cancelled');
  const canMarkPaid =
    order.status === 'pending' && order.paymentMethod !== 'mercadopago';
  const canDelete = order.status === 'cancelled';

  const handleError = (err: unknown, fallback: string) => {
    const message = err instanceof ApiError ? err.message : fallback;
    toast.error(message);
  };

  const handleAdvance = async () => {
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ status: next });
      toast.success(`Pedido marcado como "${ORDER_STATUS_LABELS[next]}"`);
    } catch (err) {
      handleError(err, 'No se pudo cambiar el estado');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaid.mutateAsync();
      toast.success('Pedido marcado como pagado');
    } catch (err) {
      handleError(err, 'No se pudo marcar como pagado');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(undefined);
      toast.success('Pedido cancelado. El stock fue restaurado.');
      setConfirmCancel(false);
    } catch (err) {
      handleError(err, 'No se pudo cancelar el pedido');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder.mutateAsync();
      toast.success('Pedido eliminado');
      onDeleted();
    } catch (err) {
      handleError(err, 'No se pudo eliminar el pedido');
    }
  };

  const handleChangeTo = async (status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ status });
      toast.success(`Estado cambiado a "${ORDER_STATUS_LABELS[status]}"`);
    } catch (err) {
      handleError(err, 'No se pudo cambiar el estado');
    }
  };

  const busy =
    updateStatus.isPending ||
    markPaid.isPending ||
    cancelOrder.isPending ||
    deleteOrder.isPending;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">
          Acciones del pedido
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Cambiá el estado a medida que avanzás con la preparación.
        </p>
      </div>

      {/* Avanzar al siguiente estado */}
      {next && (
        <button
          type="button"
          disabled={busy}
          onClick={handleAdvance}
          className={cn(
            'w-full h-11 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors',
            busy
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-brand text-white active:bg-brand-700',
          )}
        >
          <HiCheckCircle className="w-4 h-4" />
          Marcar como {ORDER_STATUS_LABELS[next].toLowerCase()}
        </button>
      )}

      {/* Marcar pagado manualmente (efectivo / transferencia) */}
      {canMarkPaid && (
        <button
          type="button"
          disabled={busy}
          onClick={handleMarkPaid}
          className={cn(
            'w-full h-11 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors border',
            busy
              ? 'border-slate-200 text-slate-400 cursor-not-allowed'
              : 'border-emerald-300 text-emerald-700 bg-emerald-50 active:bg-emerald-100',
          )}
        >
          <HiCheckCircle className="w-4 h-4" />
          Confirmar pago (efectivo/transferencia)
        </button>
      )}

      {/* Cambiar a otro estado */}
      {allowedTransitions.length > 1 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-slate-600 list-none inline-flex items-center gap-1">
            <HiOutlineArrowPath className="w-3.5 h-3.5" />
            Cambiar a otro estado
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {allowedTransitions
              .filter((s) => s !== next && s !== 'cancelled')
              .map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy}
                  onClick={() => handleChangeTo(status)}
                  className="h-8 px-3 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 active:bg-slate-100"
                >
                  {ORDER_STATUS_LABELS[status]}
                </button>
              ))}
          </div>
        </details>
      )}

      {/* Descargar */}
      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className={cn(
          'w-full h-10 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors border',
          downloading
            ? 'border-slate-200 text-slate-400 cursor-not-allowed'
            : 'border-slate-200 text-slate-700 bg-white active:bg-slate-50',
        )}
      >
        <HiOutlineArrowDownTray className="w-4 h-4" />
        {downloading ? 'Generando imagen...' : 'Descargar pedido'}
      </button>

      {/* Cancelar */}
      {canCancel && (
        <>
          {!confirmCancel ? (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="w-full h-10 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 border border-rose-200 text-rose-700 bg-white active:bg-rose-50"
            >
              <HiOutlineXCircle className="w-4 h-4" />
              Cancelar pedido
            </button>
          ) : (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 space-y-2">
              <p className="text-xs text-rose-900 font-medium">
                ¿Cancelar este pedido? El stock reservado se libera
                automáticamente.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="flex-1 h-9 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  No
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCancel}
                  className="flex-1 h-9 rounded-lg bg-rose-600 text-white text-xs font-semibold active:bg-rose-700"
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Eliminar (solo si está cancelado) */}
      {canDelete && (
        <>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full h-10 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-500 bg-white active:bg-slate-50"
            >
              <HiOutlineTrash className="w-3.5 h-3.5" />
              Eliminar pedido definitivamente
            </button>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <p className="text-xs text-slate-700 font-medium">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-9 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  No
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleDelete}
                  className="flex-1 h-9 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}