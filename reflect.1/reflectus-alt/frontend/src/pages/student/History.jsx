import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Input, Badge } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { templates } from "../../data/templates";

export default function History() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ templateId: "", from: "", to: "", search: "" });

  useEffect(() => {
    async function load() {
      const { items } = await api.listStudentReflections(user.id);
      setItems(items);
      setLoading(false);
    }
    load();
  }, [user.id]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filters.templateId && item.templateId !== filters.templateId) return false;
      if (filters.from && new Date(item.createdAt) < new Date(filters.from)) return false;
      if (filters.to && new Date(item.createdAt) > new Date(filters.to)) return false;
      if (filters.search) {
        const text = Object.values(item.answers || {}).join(" ").toLowerCase();
        if (!text.includes(filters.search.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, filters]);

  function onChange(name, value) {
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Archyvas</p>
          <h1 className="text-2xl font-semibold text-slate-900">Refleksijų istorija</h1>
        </div>
        <Button as={Link} to="/student/new">Nauja refleksija</Button>
      </div>

      <Card className="grid gap-3 md:grid-cols-4 md:items-end">
        <div className="space-y-1 md:col-span-1">
          <label className="text-sm font-medium text-slate-700">Šablonas</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={filters.templateId}
            onChange={e => onChange("templateId", e.target.value)}
          >
            <option value="">Visi</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nuo</label>
          <Input type="date" value={filters.from} onChange={e => onChange("from", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Iki</label>
          <Input type="date" value={filters.to} onChange={e => onChange("to", e.target.value)} />
        </div>
        <div className="space-y-1 md:col-span-1">
          <label className="text-sm font-medium text-slate-700">Paieška</label>
          <Input placeholder="Tekstas atsakymuose" value={filters.search} onChange={e => onChange("search", e.target.value)} />
        </div>
      </Card>

      {loading ? <div className="text-sm text-slate-500">Kraunama...</div> : null}
      {!loading && filtered.length === 0 ? (
        <Card className="text-sm text-slate-600">Nerasta refleksijų pagal filtrus.</Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(item => (
          <Link key={item.id} to={`/student/reflections/${item.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              <Badge color="blue">{templates.find(t => t.id === item.templateId)?.title}</Badge>
            </div>
            {item.mood ? <div className="mt-1 text-sm text-slate-700">Nuotaika: {item.mood}/5</div> : null}
            <div className="mt-2 line-clamp-3 text-sm text-slate-600">{Object.values(item.answers || {}).join(" • ")}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
