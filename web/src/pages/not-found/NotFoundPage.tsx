import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-lg font-semibold text-slate-900">
        Página no encontrada
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-brand text-white text-sm font-semibold"
      >
        Volver al inicio
      </Link>
    </div>
  );
}