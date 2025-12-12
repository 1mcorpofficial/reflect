import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "./ui";

function navItems(role) {
  if (role === "teacher") {
    return [
      { to: "/teacher", label: "Refleksijos" },
      { to: "/teacher/classes", label: "Klasės" },
      { to: "/teacher/assignments", label: "Užduotys" }
    ];
  }
  return [
    { to: "/student", label: "Pagrindinis" },
    { to: "/student/history", label: "Istorija" },
    { to: "/student/new", label: "Nauja refleksija" },
    { to: "/student/classes", label: "Klasės" },
    { to: "/student/assignments", label: "Užduotys" }
  ];
}

export default function Layout() {
  const { user, role, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = navItems(role);

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to={role === "teacher" ? "/teacher" : "/student"} className="text-lg font-semibold text-slate-900">
              Reflectus
            </Link>
            <nav className="hidden gap-2 text-sm font-medium text-slate-600 sm:flex">
              {items.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg px-3 py-2 transition ${
                    isActive(item.to) ? "bg-slate-900 text-white" : "hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
              onClick={() => setOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              Menu
            </button>
            {user ? (
              <>
                <div className="hidden text-right text-sm leading-tight sm:block">
                  <div className="font-semibold text-slate-900">{user.name || user.email}</div>
                  <div className="text-slate-500">{role === "teacher" ? "Mokytoja" : "Mokinys"}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }}>
                  Atsijungti
                </Button>
              </>
            ) : null}
          </div>
        </div>
        {open ? (
          <div className="border-t border-slate-200 bg-white sm:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {items.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive(item.to) ? "bg-slate-900 text-white" : "hover:bg-slate-100"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <div className="flex items-center justify-between px-1 pt-2 text-sm text-slate-600">
                  <span>{user.name || user.email}</span>
                  <button onClick={() => { logout(); navigate("/login"); }} className="text-blue-600 hover:text-blue-700">
                    Atsijungti
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
