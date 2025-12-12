import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Badge } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { templates } from "../../data/templates";

export default function StudentHome() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { items } = await api.listStudentReflections(user.id);
        setItems(items);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const lastWeek = items.filter(i => new Date(i.createdAt) >= weekAgo).length;
    return { lastWeek, total: items.length };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Sveikas sugrįžęs</p>
          <h1 className="text-2xl font-semibold text-slate-900">{user.name || user.email}</h1>
        </div>
        <Button as={Link} to="/student/new">
          Nauja refleksija
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Per 7 dienas</p>
          <div className="text-3xl font-semibold text-slate-900">{stats.lastWeek}</div>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Iš viso pateikta</p>
          <div className="text-3xl font-semibold text-slate-900">{stats.total}</div>
        </Card>
        <Card className="flex flex-col gap-2">
          <p className="text-sm text-slate-500">Paskutinė refleksija</p>
          {items[0] ? (
            <div>
              <div className="text-sm text-slate-900">{new Date(items[0].createdAt).toLocaleDateString()}</div>
              <div className="text-xs text-slate-500">{templates.find(t => t.id === items[0].templateId)?.title}</div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Dar nieko nepateikei</div>
          )}
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Paskutinės refleksijos</h3>
          <Link to="/student/history" className="text-sm text-blue-600 hover:text-blue-700">Žiūrėti viską</Link>
        </div>
        {loading ? <div className="text-sm text-slate-500">Kraunama...</div> : null}
        {!loading && items.length === 0 ? (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 px-3 py-3 text-sm text-slate-600">
            <span>Kol kas nėra įrašų.</span>
            <Button size="sm" as={Link} to="/student/new">Sukurti</Button>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          {items.slice(0, 5).map(item => (
            <Link key={item.id} to={`/student/reflections/${item.id}`} className="block rounded-lg border border-slate-200 p-3 hover:border-slate-300">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <Badge color="blue">{templates.find(t => t.id === item.templateId)?.title}</Badge>
              </div>
              {item.mood ? <div className="mt-1 text-sm text-slate-700">Nuotaika: {item.mood}/5</div> : null}
              <div className="mt-1 line-clamp-2 text-sm text-slate-600">{Object.values(item.answers || {}).join(" • ")}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
