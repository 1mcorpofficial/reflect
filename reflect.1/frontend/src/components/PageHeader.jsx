export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{title}</h1>
        {subtitle && <p className="text-slate-600 mt-3 text-base">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
