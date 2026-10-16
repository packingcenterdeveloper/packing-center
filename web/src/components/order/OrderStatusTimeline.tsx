import { HiCheck } from 'react-icons/hi2';
import { cn } from '@/lib/cn';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import type { OrderStatus, OrderStatusHistory } from '@/api/types';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  history: OrderStatusHistory[];
}

const FLOW: OrderStatus[] = [
  'pending',
  'paid',
  'preparing',
  'dispatched',
  'delivered',
];

function findHistoryEntry(
  history: OrderStatusHistory[],
  status: OrderStatus,
): OrderStatusHistory | undefined {
  return history.find((h) => h.toStatus === status);
}

export function OrderStatusTimeline({
  currentStatus,
  history,
}: OrderStatusTimelineProps) {
  // Si está cancelado, mostramos un flujo distinto
  if (currentStatus === 'cancelled') {
    const cancelledEntry = findHistoryEntry(history, 'cancelled');
    const pendingEntry = findHistoryEntry(history, 'pending');

    return (
      <ol className="relative space-y-0">
        {pendingEntry && (
          <TimelineStep
            label={ORDER_STATUS_LABELS.pending}
            date={pendingEntry.createdAt}
            state="done"
            last={false}
          />
        )}
        <TimelineStep
          label={ORDER_STATUS_LABELS.cancelled}
          date={cancelledEntry?.createdAt}
          state="cancelled"
          last
        />
      </ol>
    );
  }

  const currentIndex = FLOW.indexOf(currentStatus);

  return (
    <ol className="relative space-y-0">
      {FLOW.map((status, i) => {
        const entry = findHistoryEntry(history, status);
        const state: 'done' | 'current' | 'pending' =
          i < currentIndex
            ? 'done'
            : i === currentIndex
              ? 'current'
              : 'pending';

        return (
          <TimelineStep
            key={status}
            label={ORDER_STATUS_LABELS[status]}
            date={entry?.createdAt}
            state={state}
            last={i === FLOW.length - 1}
          />
        );
      })}
    </ol>
  );
}

interface TimelineStepProps {
  label: string;
  date?: string;
  state: 'done' | 'current' | 'pending' | 'cancelled';
  last: boolean;
}

function TimelineStep({ label, date, state, last }: TimelineStepProps) {
  return (
    <li className="relative flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            state === 'done' && 'bg-emerald-500 text-white',
            state === 'current' && 'bg-brand text-white',
            state === 'pending' && 'bg-white border-2 border-slate-300',
            state === 'cancelled' && 'bg-rose-500 text-white',
          )}
        >
          {state === 'done' && <HiCheck className="w-3.5 h-3.5" />}
          {state === 'current' && (
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
          {state === 'cancelled' && (
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
        </div>
        {!last && (
          <div
            className={cn(
              'w-0.5 flex-1 min-h-[28px]',
              state === 'done' ? 'bg-emerald-500' : 'bg-slate-200',
            )}
          />
        )}
      </div>

      <div className={cn('pb-6', last && 'pb-0')}>
        <p
          className={cn(
            'text-sm font-semibold leading-tight',
            state === 'pending'
              ? 'text-slate-400'
              : state === 'cancelled'
                ? 'text-rose-600'
                : 'text-slate-900',
          )}
        >
          {label}
        </p>
        {date && (
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDateTime(date)}
          </p>
        )}
      </div>
    </li>
  );
}