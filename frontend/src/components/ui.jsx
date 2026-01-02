import clsx from "clsx";

export function Button({ as: Comp = "button", className, variant = "primary", size = "md", asChild = false, children, ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed no-underline transform-gpu active:scale-95 min-w-0 flex-shrink-0";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/30 focus-visible:outline-blue-600",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm",
    ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md hover:shadow-rose-500/30 focus-visible:outline-rose-600"
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base"
  };
  
  if (asChild) {
    // When asChild is true, pass className and variant classes to child element
    return <div className={clsx(base, variants[variant], sizes[size], className)} {...props}>{children}</div>;
  }
  
  return <Comp className={clsx(base, variants[variant], sizes[size], className)} {...props}>{children}</Comp>;
}

export function Input({ className, ...props }) {
  return (
    <input 
      className={clsx(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm",
        "transition-all duration-200 ease-in-out",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:shadow-sm",
        "hover:border-slate-300",
        className
      )} 
      {...props} 
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea 
      className={clsx(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm",
        "transition-all duration-200 ease-in-out",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:shadow-sm",
        "hover:border-slate-300",
        "resize-y",
        className
      )} 
      {...props} 
    />
  );
}

export function Card({ className, ...props }) {
  return <div className={clsx(
    "rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm",
    "hover:shadow-md hover:shadow-slate-200/50",
    "transition-all duration-300 ease-in-out",
    "transform-gpu",
    className
  )} {...props} />;
}

export function Badge({ className, color = "slate", children, size = "md" }) {
  const palette = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    gray: "bg-gray-100 text-gray-700"
  };
  const sizes = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs"
  };
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 rounded-full font-medium",
      "transition-all duration-200 ease-in-out",
      "hover:scale-105",
      palette[color], 
      sizes[size], 
      className
    )}>
      {children}
    </span>
  );
}
