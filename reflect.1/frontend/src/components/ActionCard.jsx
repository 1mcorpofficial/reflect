import { Link } from "react-router-dom";
import { Card } from "./ui";

export function ActionCard({ to, icon, title, subtitle, className = "", onClick }) {
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
        className={`h-full hover:shadow-lg hover:border-blue-300 hover:scale-105 transition-all duration-200 transform cursor-pointer group-hover:shadow-xl ${className}`}
      >
        <div className="flex flex-col h-full">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
          <h3 className="font-semibold text-lg text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed flex-1">{subtitle}</p>
        </div>
      </Card>
    </Link>
  );
}
