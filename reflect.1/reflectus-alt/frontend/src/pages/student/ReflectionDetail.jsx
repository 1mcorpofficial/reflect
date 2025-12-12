import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Badge, Button } from "../../components/ui";
import { api } from "../../lib/api";
import { templates } from "../../data/templates";

export default function ReflectionDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { item } = await api.getReflection(id);
        setItem(item);
      } catch (err) {
        setError("Nepavyko gauti refleksijos");
      }
    }
    load();
  }, [id]);

  if (error) return <div className="text-sm text-rose-600">{error}</div>;
  if (!item) return <div className="text-sm text-slate-500">Kraunama...</div>;

  const template = templates.find(t => t.id === item.templateId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" as={Link} to="/student/history">← Atgal</Button>
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
        {item.teacherComment ? (
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
            <div className="font-semibold">Mokytojo komentaras</div>
            <div>{item.teacherComment}</div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
