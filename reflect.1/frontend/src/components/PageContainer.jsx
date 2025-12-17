import clsx from "clsx";

export function PageContainer({ className, children }) {
  return (
    <div className={clsx("mx-auto w-full max-w-6xl px-6 py-8", className)}>
      {children}
    </div>
  );
}
