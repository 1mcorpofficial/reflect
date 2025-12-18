import clsx from "clsx";

export function PageHeader({ title, subtitle, action, align = "left" }) {
  const isCenter = align === "center";

  return (
    <div
      className={clsx(
        "mb-10 flex flex-col gap-4",
        isCenter ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"
      )}
    >
      <div className={clsx("flex-1", isCenter && "flex flex-col items-center")}>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="text-slate-600 mt-3 text-base">{subtitle}</p>}
      </div>
      {action && (
        <div className={clsx("flex-shrink-0", isCenter && "w-full flex justify-center")}>
          {action}
        </div>
      )}
    </div>
  );
}
