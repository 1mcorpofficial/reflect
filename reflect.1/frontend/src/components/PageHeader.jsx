export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
