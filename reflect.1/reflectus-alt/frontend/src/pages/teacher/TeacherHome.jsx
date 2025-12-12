import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Button, Input } from "../../components/ui";
import { api } from "../../lib/api";
import { templates } from "../../data/templates";
import { useAuthStore } from "../../stores/authStore";

export default function TeacherHome() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ templateId: "", from: "", to: "", needsComment: false });

  useEffect(() => {
    async function load() {
      const { items } = await api.listTeacherReflections(user.classId, filters);
      setItems(items);
      setLoading(false);
    }
    load();
  }, [user.classId, filters]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filters.needsComment && item.teacherComment) return false;
      return true;
    });
  }, [items, filters.needsComment]);

  function onChange(name, value) {
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Mokytojo zona</p>
          <h1 className="text-2xl font-semibold text-slate-900">Refleksijos</h1>
        </div>
      </div>

      <Card className="grid gap-3 md:grid-cols-5 md:items-end">
        <div className="space-y-1">
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
        <div className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" checked={filters.needsComment} onChange={e => onChange("needsComment", e.target.checked)} />
          <span className="text-sm text-slate-700">Be komentaro</span>
        </div>
      </Card>

      {loading ? <div className="text-sm text-slate-500">Kraunama...</div> : null}
      {!loading && filtered.length === 0 ? (
        <Card className="flex items-center justify-between text-sm text-slate-600">
          <span>Nėra refleksijų pagal filtrus.</span>
          <Button size="sm" variant="secondary" onClick={() => setFilters({ templateId: "", from: "", to: "", needsComment: false })}>
            Išvalyti filtrus
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(item => (
          <Link key={item.id} to={`/teacher/reflections/${item.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              {item.teacherComment ? <Badge color="green">Pakomentuota</Badge> : <Badge color="amber">Laukia</Badge>}
            </div>
            <div className="text-sm font-semibold text-slate-900">{templates.find(t => t.id === item.templateId)?.title}</div>
            <div className="text-xs text-slate-500">Mokinio ID: {item.studentId}{item.classId ? ` • Klasė ${item.classId}` : ""}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
