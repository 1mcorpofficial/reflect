import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Badge } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { templates } from "../../data/templates";

export default function StudentAssignments() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      try {
        const { items } = await api.listStudentAssignments(user.id);
        setItems(items);
      } catch (err) {
        setError("Nepavyko gauti užduočių");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Mokinys</p>
          <h1 className="text-2xl font-semibold text-slate-900">Paskirtos užduotys</h1>
        </div>
      </div>

      {loading ? <div className="text-sm text-slate-500">Kraunama...</div> : null}
      {error ? <Card className="text-sm text-rose-600">{error}</Card> : null}
      {!loading && !error && items.length === 0 ? (
        <Card className="text-sm text-slate-600">Šiuo metu neturi paskirtų užduočių.</Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {items.map(as => (
          <Card key={as.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{new Date(as.createdAt).toLocaleDateString()}</span>
              <Badge color="blue">{templates.find(t => t.id === as.templateId)?.title || "Custom"}</Badge>
            </div>
            <div className="text-lg font-semibold text-slate-900">{as.title}</div>
            <div className="text-sm text-slate-600">{as.description || ""}</div>
            {as.dueAt ? <div className="text-xs text-amber-700">Terminas: {as.dueAt}</div> : null}
            <Button as={Link} to={`/student/assignments/${as.id}`} size="sm">Pildyti</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
