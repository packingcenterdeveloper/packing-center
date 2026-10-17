import { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineCog6Tooth,
  HiOutlineEnvelope,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { useAdminSettings } from '@/hooks/queries/useAdminSettings';
import { useUpdateSettings } from '@/hooks/mutations/useUpdateSettings';
import { Switch } from '@/components/ui/Switch';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import type { SettingView } from '@/api/types';

type State = Record<string, string>;

function toState(settings: SettingView[]): State {
  const s: State = {};
  for (const item of settings) s[item.key] = item.value;
    return s;
}

function parseBoolean(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}

const inputBase =
'w-full h-11 px-3 rounded-lg border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

export function SettingsPage() {
  const { data: settings, isLoading, isError } = useAdminSettings();
  const updateMutation = useUpdateSettings();

  const initial = useMemo(
    () => (settings ? toState(settings) : null),
    [settings],
    );
  const [values, setValues] = useState<State | null>(initial);

  useEffect(() => {
    if (initial) setValues(initial);
  }, [initial]);

  const dirty = useMemo(() => {
    if (!initial || !values) return false;
    for (const key of Object.keys(initial)) {
      if (initial[key] !== values[key]) return true;
    }
    return false;
  }, [initial, values]);

  const handleSave = async () => {
    if (!initial || !values || !settings) return;

    const payload: Record<string, unknown> = {};
    for (const s of settings) {
      const before = initial[s.key];
      const after = values[s.key];
      if (before === after) continue;
      if (s.type === 'boolean') {
        if (s.key === 'MAIL_ADMIN_ENABLED') {
          payload.MAIL_ADMIN_ENABLED = parseBoolean(after ?? 'false');
        } else if (s.key === 'MAIL_CLIENT_ENABLED') {
          payload.MAIL_CLIENT_ENABLED = parseBoolean(after ?? 'false');
        }
      } else {
        if (s.key === 'MAIL_TO') payload.MAIL_TO = after ?? '';
      }
    }

    if (Object.keys(payload).length === 0) {
      toast('No hay cambios para guardar');
      return;
    }

    try {
      await updateMutation.mutateAsync(payload);
      toast.success('Configuración guardada');
    } catch (err) {
      const message =
      err instanceof ApiError ? err.message : 'No se pudo guardar';
      toast.error(message);
    }
  };

  if (isLoading || !settings || !values) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-8 rounded bg-slate-100 animate-pulse w-1/3" />
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
      </div>
      );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-rose-600">
          No se pudo cargar la configuración.
        </p>
      </div>
      );
  }

  const adminEnabled = parseBoolean(values['MAIL_ADMIN_ENABLED'] ?? 'false');
  const clientEnabled = parseBoolean(values['MAIL_CLIENT_ENABLED'] ?? 'false');
  const mailTo = values['MAIL_TO'] ?? '';

  const handleBoolean = (key: string, next: boolean) => {
    setValues((v) => (v ? { ...v, [key]: next ? 'true' : 'false' } : v));
  };

  const handleString = (key: string, next: string) => {
    setValues((v) => (v ? { ...v, [key]: next } : v));
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
          <HiOutlineCog6Tooth className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900">Configuración</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ajustes generales de la tienda.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex items-center gap-2">
          <HiOutlineEnvelope className="w-5 h-5 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">
            Notificaciones por mail
          </h2>
        </div>

        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
          <div className="flex items-start gap-3 p-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-900">
                  Avisarme por mail cuando entra un pedido
                </p>
                {adminEnabled ? (
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-emerald-100 text-emerald-700">
                    Activado
                  </span>
                  ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-slate-100 text-slate-500">
                    Desactivado
                  </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Recibís un mail con todos los datos del pedido cada vez que se
                  confirma el pago.
                </p>
              </div>
              <Switch
                checked={adminEnabled}
                onChange={(next) =>
                handleBoolean('MAIL_ADMIN_ENABLED', next)
              }
              label="Avisarme por mail cuando entra un pedido"
            />
          </div>

          <div className="flex items-start gap-3 p-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-900">
                  Enviar confirmación al cliente
                </p>
                {clientEnabled ? (
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-emerald-100 text-emerald-700">
                    Activado
                  </span>
                  ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-slate-100 text-slate-500">
                    Desactivado
                  </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  El cliente recibe un mail con el resumen de su pedido (siempre
                    que haya dejado un email al comprar).
                </p>
              </div>
              <Switch
                checked={clientEnabled}
                onChange={(next) =>
                handleBoolean('MAIL_CLIENT_ENABLED', next)
              }
              label="Enviar confirmación al cliente"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="mail-to"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Mail del proyecto (destino de avisos)
          </label>
          <input
            id="mail-to"
            type="email"
            value={mailTo}
            onChange={(e) => handleString('MAIL_TO', e.target.value)}
            className={cn(inputBase, 'border-slate-200')}
            placeholder="pedidos@packingcenter.uy"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            A esta dirección llegan los avisos de nuevos pedidos. Podés
            cambiarla cuando quieras.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          <HiOutlineInformationCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Para que los mails realmente se envíen, las credenciales de Gmail
            (usuario y contraseña de aplicación) tienen que estar configuradas
            en el servidor. Si no están, el sistema te va a avisar al intentar
            activar un flag.
          </p>
        </div>
      </section>

      <div className="sticky bottom-0 bg-slate-50 pt-3 pb-3 -mx-4 px-4 border-t border-slate-200 lg:static lg:border-0 lg:p-0 lg:bg-transparent lg:mx-0">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || updateMutation.isPending}
          className={cn(
            'w-full h-11 rounded-lg text-sm font-semibold transition-colors',
            !dirty || updateMutation.isPending
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-brand text-white active:bg-brand-700',
            )}
        >
          {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {dirty && !updateMutation.isPending && (
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Tenés cambios sin guardar
          </p>
          )}
      </div>
    </div>
    );
}