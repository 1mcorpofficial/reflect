import clsx from "clsx";

const palette = {
  blue: {
    accent: "bg-blue-500",
    iconBg: "bg-blue-50 text-blue-600",
    text: "text-blue-700",
    border: "border-blue-100",
    halo: "bg-blue-100",
    ring: "focus-visible:ring-blue-200"
  },
  green: {
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    text: "text-emerald-700",
    border: "border-emerald-100",
    halo: "bg-emerald-100",
    ring: "focus-visible:ring-emerald-200"
  },
  amber: {
    accent: "bg-amber-500",
    iconBg: "bg-amber-50 text-amber-600",
    text: "text-amber-700",
    border: "border-amber-100",
    halo: "bg-amber-100",
    ring: "focus-visible:ring-amber-200"
  },
  rose: {
    accent: "bg-rose-500",
    iconBg: "bg-rose-50 text-rose-600",
    text: "text-rose-700",
    border: "border-rose-100",
    halo: "bg-rose-100",
    ring: "focus-visible:ring-rose-200"
  },
  slate: {
    accent: "bg-slate-500",
    iconBg: "bg-slate-50 text-slate-600",
    text: "text-slate-700",
    border: "border-slate-100",
    halo: "bg-slate-200",
    ring: "focus-visible:ring-slate-200"
  }
};

export function TemplateCard({ template, onSelect }) {
  const colors = palette[template.color] || palette.blue;

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={clsx(
        "group relative h-full w-full overflow-hidden rounded-2xl border bg-white/80 text-left shadow-lg backdrop-blur-sm",
        "transition-all duration-300 ease-in-out transform-gpu",
        "hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50",
        "active:scale-[0.98]",
        colors.border,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        colors.ring
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white/85 to-slate-50" />
      <div className={clsx("absolute -right-16 -top-20 h-36 w-36 rounded-full blur-3xl opacity-30 transition duration-500 group-hover:scale-125", colors.halo)} />
      <div className={clsx("absolute inset-x-0 top-0 h-1", colors.accent)} />
      <div className="relative z-10 flex h-full flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "flex h-12 w-12 items-center justify-center rounded-full text-xl",
            "group-hover:scale-110 group-hover:rotate-6",
            "transition-all duration-300 ease-in-out transform-gpu",
            "icon-bounce",
            colors.iconBg
          )}>
            {template.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{template.name}</h3>
            {template.description && (
              <p className="text-sm text-slate-600 line-clamp-1">{template.description}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 flex-1">
          {template.summary || template.description || ""}
        </p>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium">
            Klausimų: {template.fields.length}
          </span>
          <span className={clsx(
            "font-semibold text-xs",
            "group-hover:translate-x-1",
            "transition-transform duration-300 ease-in-out",
            colors.text
          )}>
            Pasirinkti →
          </span>
        </div>
      </div>
    </button>
  );
}
