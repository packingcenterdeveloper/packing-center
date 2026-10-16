import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiOutlineLockClosed } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { useLogin } from '@/hooks/mutations/useLogin';
import { useAuthStore } from '@/stores/auth.store';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';

const loginSchema = z.object({
  email: z.string().trim().email('Ingresá un email válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const inputBase =
  'w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Si ya está logueado, redirigir
  useEffect(() => {
    if (token) {
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? '/admin', { replace: true });
    }
  }, [token, navigate, location.state]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);
      toast.success('¡Bienvenido!');
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? '/admin', { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 401
            ? 'Email o contraseña incorrectos'
            : err.message
          : 'No se pudo iniciar sesión';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mb-3">
            <HiOutlineLockClosed className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand">
            PACKING
          </span>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-slate-500">
            CENTER · ADMIN
          </span>
          <p className="text-sm text-slate-500 mt-3 text-center">
            Ingresá con tu cuenta de administrador
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              {...register('email')}
              className={cn(
                inputBase,
                errors.email && 'border-rose-300',
              )}
              placeholder="admin@packingcenter.uy"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className={cn(
                inputBase,
                errors.password && 'border-rose-300',
              )}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={cn(
              'w-full h-11 rounded-lg font-semibold text-sm transition-colors',
              loginMutation.isPending
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-brand text-white active:bg-brand-700',
            )}
          >
            {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}