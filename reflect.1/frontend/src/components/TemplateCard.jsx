import clsx from "clsx";

const palette = {
  blue: {
    accent: "bg-blue-500",
    iconBg: "bg-blue-50 text-blue-600",
    text: "text-blue-700",
    border: "border-blue-100"
  },
  green: {
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    text: "text-emerald-700",
    border: "border-emerald-100"
  },
  amber: {
    accent: "bg-amber-500",
    iconBg: "bg-amber-50 text-amber-600",
    text: "text-amber-700",
    border: "border-amber-100"
  },
  rose: {
    accent: "bg-rose-500",
    iconBg: "bg-rose-50 text-rose-600",
    text: "text-rose-700",
    border: "border-rose-100"
  },
  slate: {
    accent: "bg-slate-500",
    iconBg: "bg-slate-50 text-slate-600",
    text: "text-slate-700",
    border: "border-slate-100"
  }
};

export function TemplateCard({ template, onSelect }) {
  const colors = palette[template.color] || palette.blue;

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={clsx(
        "group relative h-full w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition",
        colors.border,
        "hover:-translate-y-1 hover:shadow-lg"
      )}
    >
      <div className={clsx("absolute inset-x-0 top-0 h-1", colors.accent)} />
      <div className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className={clsx("flex h-12 w-12 items-center justify-center rounded-full text-xl", colors.iconBg)}>
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
          <span className={clsx("font-semibold text-xs", colors.text)}>
            Pasirinkti →
          </span>
        </div>
      </div>
    </button>
  );
}
