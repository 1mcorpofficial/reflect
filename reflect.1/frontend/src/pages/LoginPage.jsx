import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui";
import { useAuthStore } from "../stores/authStore";
import { ROUTES } from "../routes";

const mockHints = [
  { email: "mokinys@pastas.lt", password: "test123", label: "🎓 Mokinys", color: "blue" },
  { email: "mokytojas@pastas.lt", password: "test123", label: "👩‍🏫 Mokytojas", color: "green" }
];

export const LoginPage = () => {
  const navigate = useNavigate();
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
      const redirectTo = user.role === 'teacher' ? ROUTES.TEACHER_HOME : ROUTES.STUDENT_HOME;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || err?.code || "Prisijungimas nepavyko");
    } finally {
      setLoading(false);
    }
  }

  function fillMock(mockEmail, pwd) {
    setEmail(mockEmail);
    setPassword(pwd);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <div className="grid w-full gap-10 md:grid-cols-2 md:items-center">
          {/* Kairė pusė - informacija */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Reflectus</p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">
                Sveiki atvykę į refleksijų sistemą
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Mokyklos refleksijų platforma mokiniams ir mokytojams. 
                Apmąstykite savo mokymąsi ir sekite pažangą.
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                🚀 Greitas prisijungimas (demo):
              </p>
              <div className="flex flex-wrap gap-2">
                {mockHints.map(h => (
                  <Button 
                    key={h.email} 
                    variant="secondary" 
                    size="md" 
                    onClick={() => fillMock(h.email, h.password)}
                    className="shadow-sm"
                  >
                    {h.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Slaptažodis: <code className="bg-slate-100 px-1 py-0.5 rounded">test123</code>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Demo režimas aktyvus
                </div>
              </div>
            </div>
          </div>

          {/* Dešinė pusė - forma */}
          <Card className="space-y-5 shadow-lg">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Prisijungimas</h2>
              <p className="text-sm text-slate-600 mt-1">
                Įveskite el. paštą ir slaptažodį
              </p>
            </div>
            
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">El. paštas</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="jusu@pastas.lt"
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Slaptažodis</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                />
              </div>
              
              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  ⚠️ {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Jungiamasi...
                  </span>
                ) : (
                  "Prisijungti"
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Turite problemų? Kreipkitės į mokyklos administratorių.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

