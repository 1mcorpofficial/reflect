import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, Button, Textarea, Badge } from "../../components/ui";
import { api } from "../../lib/api";
import { templates } from "../../data/templates";

export default function TeacherReflectionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { item } = await api.getReflection(id);
        setItem(item);
        setComment(item.teacherComment || "");
      } catch (err) {
        setError("Nepavyko gauti duomenų");
      }
    }
    load();
  }, [id]);

  async function saveComment() {
    setSaving(true);
    setError("");
    try {
      const { item } = await api.addTeacherComment(id, comment);
      setItem(item);
      nav("/teacher", { replace: true });
    } catch (err) {
      setError("Nepavyko išsaugoti komentaro");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="text-sm text-rose-600">{error}</div>;
  if (!item) return <div className="text-sm text-slate-500">Kraunama...</div>;

  const template = templates.find(t => t.id === item.templateId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" as={Link} to="/teacher">← Atgal</Button>
        {template ? <Badge color="blue">{template.title}</Badge> : null}
      </div>
      <Card className="space-y-3">
        <div className="text-sm text-slate-600">{new Date(item.createdAt).toLocaleString()}</div>
        {item.mood ? <div className="text-sm text-slate-700">Nuotaika: {item.mood}/5</div> : null}
        <div className="grid gap-3">
          {template?.fields.map(field => (
            <div key={field.key}>
              <div className="text-sm font-medium text-slate-800">{field.label}</div>
              <div className="text-sm text-slate-700">{String(item.answers?.[field.key] || "-")}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-800">Komentaras</div>
          <Textarea rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder="Parašykite komentarą" />
          {error ? <div className="text-xs text-rose-600">{error}</div> : null}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => nav(-1)}>Atgal</Button>
            <Button onClick={saveComment} disabled={saving}>{saving ? "Saugoma..." : "Išsaugoti komentarą"}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
