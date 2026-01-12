import clsx from "clsx";

export function PageContainer({ className, children }) {
  return (
    <div className={clsx("w-full max-w-full overflow-x-hidden", className)}>
      <div className="w-full max-w-full">
        {children}
      </div>
    </div>
  );
}
