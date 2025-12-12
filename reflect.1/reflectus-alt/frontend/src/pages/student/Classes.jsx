import { useEffect, useState } from "react";
import { Card, Button, Input, Badge } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";

export default function StudentClasses() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { items } = await api.listStudentClasses(user.id);
        setItems(items);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  async function join() {
    if (!code.trim()) return;
    setJoining(true);
    setError("");
    setMessage("");
    try {
      await api.joinClass({ code: code.trim(), studentId: user.id });
      const { items } = await api.listStudentClasses(user.id);
      setItems(items);
      setMessage("Prisijungta prie klasės");
      setCode("");
    } catch (err) {
      setError(err?.code === "CLASS_NOT_FOUND" ? "Kodas nerastas" : "Nepavyko prisijungti");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Mokinys</p>
          <h1 className="text-2xl font-semibold text-slate-900">Mano klasės</h1>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="text-sm font-medium text-slate-800">Prisijungti prie klasės</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input placeholder="Klasės kodas" value={code} onChange={e => setCode(e.target.value)} />
          <Button onClick={join} disabled={joining}>{joining ? "Jungiama..." : "Prisijungti"}</Button>
        </div>
        {message ? <div className="text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
      </Card>

      {loading ? <div className="text-sm text-slate-500">Kraunama...</div> : null}
      {!loading && items.length === 0 ? <Card className="text-sm text-slate-600">Dar neprisijungei prie jokios klasės.</Card> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {items.map(cls => (
          <Card key={cls.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">{cls.name}</div>
              <Badge>{cls.studentIds?.length || 0} nariai</Badge>
            </div>
            <div className="text-sm text-slate-600">Kodas: {cls.code}</div>
            <div className="text-xs text-slate-500">Mokytojas: {cls.teacherId || "n/a"}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
