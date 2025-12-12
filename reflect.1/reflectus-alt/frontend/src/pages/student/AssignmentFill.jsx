import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Badge } from "../../components/ui";
import ReflectionForm from "../../components/ReflectionForm";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { useAuthStore } from "../../stores/authStore";

export default function AssignmentFill() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      try {
        const { item } = await api.getAssignment(id);
        setAssignment(item);
      } catch (err) {
        setError("Užduotis nerasta");
      }
    }
    load();
  }, [id]);

  if (error) return <div className="text-sm text-rose-600">{error}</div>;
  if (!assignment) return <div className="text-sm text-slate-500">Kraunama...</div>;

  const template = getTemplate(assignment.templateId);
  if (!template) return <div className="text-sm text-rose-600">Šablonas nerastas.</div>;

  function onSubmitted() {
    nav("/student/assignments", { replace: true });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}>← Atgal</Button>
        <Badge color="blue">{template.title}</Badge>
      </div>
      <Card className="space-y-2">
        <div className="text-lg font-semibold text-slate-900">{assignment.title}</div>
        <div className="text-sm text-slate-600">{assignment.description}</div>
        {assignment.dueAt ? <div className="text-xs text-amber-700">Terminas: {assignment.dueAt}</div> : null}
      </Card>
      <ReflectionForm
        template={template}
        user={user}
        onSubmitted={onSubmitted}
        extraPayload={{
          assignmentId: assignment.id,
          teacherId: assignment.teacherId,
          classId: assignment.classIds?.[0] || null
        }}
      />
    </div>
  );
}
