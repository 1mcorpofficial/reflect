import { useEffect, useState } from "react";
import { Card, Button, Input, Textarea, Badge } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { templates } from "../../data/templates";

export default function TeacherAssignments() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", templateId: "", classIds: [], dueAt: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [{ items: cls }, { items: assigns }] = await Promise.all([
        api.listTeacherClasses(user.id),
        api.listTeacherAssignments(user.id)
      ]);
      setClasses(cls);
      setItems(assigns);
      setLoading(false);
    }
    load();
  }, []);

  function toggleClass(id) {
    setForm(prev => {
      const exists = prev.classIds.includes(id);
      return { ...prev, classIds: exists ? prev.classIds.filter(x => x !== id) : [...prev.classIds, id] };
    });
  }

  async function createAssignment() {
    if (!form.title.trim() || !form.templateId || form.classIds.length === 0) {
      setError("Užpildykite pavadinimą, šabloną ir pasirinkite klasę");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.createAssignment({
        title: form.title.trim(),
        description: form.description,
        templateId: form.templateId,
        classIds: form.classIds,
        dueAt: form.dueAt || null,
        teacherId: user.id
      });
      const { items: assigns } = await api.listTeacherAssignments(user.id);
      setItems(assigns);
      setForm({ title: "", description: "", templateId: "", classIds: [], dueAt: "" });
    } catch (err) {
      setError(err?.code || err?.message || "Nepavyko sukurti užduoties");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Mokytojo zona</p>
          <h1 className="text-2xl font-semibold text-slate-900">Užduotys</h1>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="text-sm font-medium text-slate-800">Nauja užduotis</div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Pavadinimas</label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Pvz. Savaitės refleksija" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Aprašymas</label>
          <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Šablonas</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={form.templateId}
            onChange={e => setForm(f => ({ ...f, templateId: e.target.value }))}
          >
            <option value="">Pasirinkite</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Klasės</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {classes.map(c => (
              <label key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <input type="checkbox" checked={form.classIds.includes(c.id)} onChange={() => toggleClass(c.id)} />
                <span>{c.name} ({c.studentIds?.length || 0})</span>
              </label>
            ))}
            {classes.length === 0 ? <div className="text-sm text-slate-500">Nėra klasių. Sukurkite klasę.</div> : null}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Terminas (nebūtina)</label>
          <Input type="date" value={form.dueAt} onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))} />
        </div>
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        <Button onClick={createAssignment} disabled={saving || classes.length === 0}>
          {saving ? "Saugoma..." : "Sukurti užduotį"}
        </Button>
      </Card>

      {loading ? <div className="text-sm text-slate-500">Kraunama...</div> : null}
      {!loading && items.length === 0 ? <Card className="text-sm text-slate-600">Dar nėra užduočių.</Card> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {items.map(as => (
          <Card key={as.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{new Date(as.createdAt).toLocaleDateString()}</span>
              <Badge color="blue">{templates.find(t => t.id === as.templateId)?.title || "Custom"}</Badge>
            </div>
            <div className="text-lg font-semibold text-slate-900">{as.title}</div>
            <div className="text-sm text-slate-600">{as.description || ""}</div>
            <div className="text-xs text-slate-500">Klasės: {as.classIds.length}</div>
            {as.dueAt ? <div className="text-xs text-amber-700">Terminas: {as.dueAt}</div> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
