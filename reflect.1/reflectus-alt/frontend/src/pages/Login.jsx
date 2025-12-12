import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Input, Card } from "../components/ui";
import { useAuthStore } from "../stores/authStore";

const mockHints = [
  { email: "mokinys@pastas.lt", password: "test123", label: "Mokinys" },
  { email: "mokytojas@pastas.lt", password: "test123", label: "Mokytoja" }
];

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("mokinys@pastas.lt");
  const [password, setPassword] = useState("test123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login(email, password);
      const from = location.state?.from?.pathname;
      if (from) {
        nav(from, { replace: true });
      } else {
        nav(user.role === "teacher" ? "/teacher" : "/student", { replace: true });
      }
    } catch (err) {
      setError(err?.code || err?.message || "LOGIN_FAILED");
    } finally {
      setLoading(false);
    }
  }

  function fillMock(email, pwd) {
    setEmail(email);
    setPassword(pwd);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <div className="grid w-full gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">Reflectus</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Prisijunkite prie refleksijų</h1>
            <p className="mt-3 text-sm text-slate-600">Naudokite mokyklos suteiktus prisijungimus. Vėliau prisijungimas bus per backend, dabar – per mock.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {mockHints.map(h => (
                <Button key={h.email} variant="secondary" size="sm" onClick={() => fillMock(h.email, h.password)}>
                  Užpildyti {h.label}
                </Button>
              ))}
            </div>
          </div>
          <Card className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Prisijungimas</h2>
              <p className="text-sm text-slate-600">Įveskite el. paštą ir slaptažodį.</p>
            </div>
            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">El. paštas</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Slaptažodis</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Jungiamasi..." : "Prisijungti"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
