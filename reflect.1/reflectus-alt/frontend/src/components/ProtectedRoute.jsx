import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

function defaultRoute(role) {
  if (role === "teacher") return "/teacher";
  if (role === "student") return "/student";
  return "/login";
}

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role, ready, hydrateFromStorage } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!ready) hydrateFromStorage();
  }, [ready, hydrateFromStorage]);

  if (!ready) return <div className="px-4 py-6 text-sm text-slate-500">Kraunama...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={defaultRoute(role)} replace />;

  return <Outlet />;
}
