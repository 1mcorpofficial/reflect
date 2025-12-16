import { Link } from "react-router-dom";
import { Card } from "./ui";

export function ActionCard({ to, icon, title, subtitle, className = "" }) {
  return (
    <Link to={to} className="block group">
      <Card 
        className={`hover:shadow-lg hover:border-blue-300 transition cursor-pointer group-hover:scale-105 transform ${className}`}
      >
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm mt-1 opacity-75">{subtitle}</p>
      </Card>
    </Link>
  );
}
