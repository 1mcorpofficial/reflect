import { useEffect, useState } from "react";
import { Card, Button, Input, Badge } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";

export default function TeacherClasses() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { items } = await api.listTeacherClasses(user.id);
    setClasses(items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createClass() {
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    try {
      await api.createClass({ name: name.trim(), teacherId: user.id });
      setName("");
      await load();
    } catch (err) {
      setError(err?.code || err?.message || "Nepavyko sukurti klasės");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Mokytojo zona</p>
          <h1 className="text-2xl font-semibold text-slate-900">Klasės</h1>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="text-sm font-medium text-slate-800">Sukurti klasę</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input placeholder="Pavadinimas (pvz. 8A)" value={name} onChange={e => setName(e.target.value)} />
          <Button onClick={createClass} disabled={creating}>Sukurti</Button>
        </div>
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
      </Card>

      {loading ? <div className="text-sm text-slate-500">Kraunama...</div> : null}
      {!loading && classes.length === 0 ? <Card className="text-sm text-slate-600">Dar nėra klasių.</Card> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {classes.map(cls => (
          <Card key={cls.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">{cls.name}</div>
                <div className="text-sm text-slate-600">Mokiniai: {cls.studentIds?.length || 0}</div>
              </div>
              <Badge color="blue">Kodas: {cls.code}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
