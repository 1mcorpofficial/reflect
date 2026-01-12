import { Link } from "react-router-dom";
import clsx from "clsx";
import { Card } from "./ui";

export function ActionCard({ to, icon, title, subtitle, className = "", onClick, align = "left" }) {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
      return;
    }
  };

  return (
    <Link to={to || "#"} className="block group" onClick={handleClick}>
      <Card 
        className={clsx(
          "h-full cursor-pointer",
          "hover:shadow-lg hover:shadow-blue-100/50 hover:border-blue-300",
          "hover:scale-[1.02] active:scale-[0.98]",
          "transition-all duration-300 ease-in-out",
          "transform-gpu",
          className
        )}
      >
        <div className={clsx("flex flex-col h-full", align === "center" && "items-center text-center")}>
          <div className={clsx(
            "text-4xl mb-4",
            "group-hover:scale-110 group-hover:rotate-3",
            "transition-all duration-300 ease-in-out",
            "transform-gpu",
            "icon-bounce"
          )}>
            {icon}
          </div>
          <h3 className={clsx(
            "font-semibold text-lg text-slate-900 mb-2",
            "group-hover:text-blue-600",
            "transition-colors duration-300"
          )}>
            {title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed flex-1 group-hover:text-slate-700 transition-colors duration-300">{subtitle}</p>
        </div>
      </Card>
    </Link>
  );
}
