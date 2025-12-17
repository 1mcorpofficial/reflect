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
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button variant="ghost" size="sm" onClick={() => setSearch({})}>← Atgal į šablonus</Button>
          <Badge color="blue">{template.title}</Badge>
        </div>
        <ReflectionForm template={template} user={user} onSubmitted={onSubmitted} onCancel={() => setSearch({})} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">Pasirink šabloną</p>
        <h1 className="text-3xl font-semibold text-slate-900">Refleksija</h1>
        <p className="text-sm text-slate-600 mt-1">Pasirink tinkamą šabloną ir pradėk pildyti.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <Card key={t.id} className="relative h-full overflow-hidden border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500/70 to-blue-600/80" />
            <div className="space-y-2 pt-1">
              <h3 className="text-lg font-semibold text-slate-900">{t.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-3">{t.description}</p>
              <div className="text-xs text-slate-500">Klausimų: {t.fields.length}</div>
            </div>
            <div className="mt-4">
              <Button className="w-full" onClick={() => onPick(t.id)}>
                Pildyti
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
