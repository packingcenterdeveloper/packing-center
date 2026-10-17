import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineEnvelope,
  HiOutlineMinusCircle,
  HiOutlinePaperAirplane,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { useOrderEmails } from '@/hooks/queries/useOrderEmails';
import { useResendOrderEmails } from '@/hooks/mutations/useResendOrderEmails';
import { ApiError } from '@/api/client';
import type { EmailEventStatus } from '@/api/admin/emails';

interface EmailsPanelProps {
  orderId: string;
}

function statusLabel(status: EmailEventStatus): string {
  switch (status) {
    case 'sent':
      return 'Enviado';
    case 'failed':
      return 'Falló';
    case 'pending':
      return 'Pendiente';
    case 'skipped':
      return 'No enviado';
  }
}

function StatusIcon({ status }: { status: EmailEventStatus }) {
  switch (status) {
    case 'sent':
      return <HiCheckCircle className="w-4 h-4 text-emerald-500" />;
    case 'failed':
      return <HiExclamationTriangle className="w-4 h-4 text-rose-500" />;
    case 'pending':
      return <HiOutlineArrowPath className="w-4 h-4 text-amber-500" />;
    case 'skipped':
      return <HiOutlineMinusCircle className="w-4 h-4 text-slate-400" />;
  }
}

export function EmailsPanel({ orderId }: EmailsPanelProps) {
  const emailsQuery = useOrderEmails(orderId);
  const resend = useResendOrderEmails(orderId);

  const handleResend = async () => {
    try {
      const result = await resend.mutateAsync();
      if (result.total === 0) {
        toast('Este pedido no tiene mails para reenviar');
        return;
      }
      toast.success(
        `Reenvío: ${result.sent} enviados, ${result.skipped} saltados, ${result.failed} fallidos`,
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudieron reenviar';
      toast.error(message);
    }
  };

  const events = emailsQuery.data ?? [];
  const hasPendingOrFailed = events.some(
    (e) => e.status === 'pending' || e.status === 'failed' || e.status === 'skipped',
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <HiOutlineEnvelope className="w-5 h-5 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-900">
          Notificaciones por mail
        </h2>
      </div>

      {emailsQuery.isLoading ? (
        <div className="space-y-2">
          <div className="h-10 rounded bg-slate-100 animate-pulse" />
          <div className="h-10 rounded bg-slate-100 animate-pulse" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-500">
          No hay notificaciones registradas para este pedido.
        </p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li
              key={e.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3',
                e.status === 'sent'
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : e.status === 'failed'
                    ? 'border-rose-200 bg-rose-50/40'
                    : 'border-slate-200 bg-slate-50/40',
              )}
            >
              <StatusIcon status={e.status} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900">
                  {e.type === 'order_admin'
                    ? 'Notificación al proyecto'
                    : 'Confirmación al cliente'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {e.toEmail}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {statusLabel(e.status)}
                  {e.sentAt ? ` · ${formatDateTime(e.sentAt)}` : ''}
                </p>
                {e.error && (
                  <p className="text-[11px] text-rose-600 mt-1 break-words">
                    {e.error}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasPendingOrFailed && (
        <button
          type="button"
          onClick={handleResend}
          disabled={resend.isPending}
          className={cn(
            'w-full h-10 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors border',
            resend.isPending
              ? 'border-slate-200 text-slate-400 cursor-not-allowed'
              : 'border-slate-200 text-slate-700 bg-white active:bg-slate-50',
          )}
        >
          <HiOutlinePaperAirplane className="w-4 h-4" />
          {resend.isPending ? 'Reenviando...' : 'Reenviar mails pendientes'}
        </button>
      )}

      <p className="text-[11px] text-slate-400 leading-snug">
        Los mails se activan desde Configuración. Si están desactivados, los
        pedidos se registran igual y podés reenviarlos después.
      </p>
    </section>
  );
}