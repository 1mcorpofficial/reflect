import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, Button, Badge } from "../../components/ui";
import ReflectionForm from "../../components/ReflectionForm";
import { templates, getTemplate } from "../../data/templates";
import { useAuthStore } from "../../stores/authStore";

export default function NewReflection() {
  const [search, setSearch] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const templateId = search.get("template");
  const template = templateId ? getTemplate(templateId) : null;

  function onPick(id) {
    setSearch({ template: id });
  }

  function onSubmitted() {
    nav("/student/history", { replace: true });
  }

  if (template) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button variant="ghost" size="sm" onClick={() => setSearch({})}>← Atgal į šablonus</Button>
          <Badge color="blue">{template.title}</Badge>
        </div>
        <ReflectionForm template={template} user={user} onSubmitted={onSubmitted} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Pasirink šabloną</p>
          <h1 className="text-2xl font-semibold text-slate-900">Nauja refleksija</h1>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map(t => (
          <Card key={t.id} className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{t.title}</h3>
              <p className="text-sm text-slate-600">{t.description}</p>
            </div>
            <div className="text-xs text-slate-500">Laukai: {t.fields.length}</div>
            <Button onClick={() => onPick(t.id)}>Pildyti</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
