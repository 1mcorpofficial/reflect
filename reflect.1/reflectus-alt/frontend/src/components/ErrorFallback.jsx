import { Link, useRouteError } from "react-router-dom";

export default function ErrorFallback() {
  const error = useRouteError();
  const message = error?.statusText || error?.message || "Įvyko klaida";
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-rose-600">Klaida</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Nepavyko užkrauti</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-4 flex justify-center gap-3 text-sm font-medium">
          <Link className="rounded-lg bg-blue-600 px-4 py-2 text-white" to="/">Grįžti į pradžią</Link>
          <Link className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700" to={-1}>Atgal</Link>
        </div>
      </div>
    </div>
  );
}
