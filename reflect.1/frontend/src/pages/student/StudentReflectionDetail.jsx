import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Badge } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { ROUTES } from "../../routes";

export default function StudentReflectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReflection();
  }, [id]);

  async function loadReflection() {
    try {
      const res = await api.getReflection(id);
      setReflection(res.item);
    } catch (error) {
      console.error('Failed to load reflection:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <Card className="text-center py-12">Kraunama...</Card>
      </Layout>
    );
  }

  if (!reflection) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <p className="mb-4">Refleksija nerasta</p>
          <Button onClick={() => navigate(ROUTES.STUDENT_HISTORY)}>
            Grįžti atgal
          </Button>
        </Card>
      </Layout>
    );
  }

  const template = getTemplate(reflection.templateId);
  const formatAnswer = (value) => {
    if (Array.isArray(value)) return value.join(', ');
    return value || '—';
  };

  return (
    <Layout>
      <PageHeader 
        title={template?.name || 'Refleksija'} 
        subtitle={new Date(reflection.createdAt).toLocaleDateString('lt-LT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
        action={
          <Button variant="ghost" onClick={() => navigate(ROUTES.STUDENT_HISTORY)}>
            ← Atgal
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{template?.icon || '📝'}</div>
              <div>
                <h2 className="font-semibold text-xl text-slate-900">
                  {template?.name || 'Refleksija'}
                </h2>
                <p className="text-sm text-slate-500">
                  Pateikta: {new Date(reflection.createdAt).toLocaleString('lt-LT')}
                </p>
              </div>
            </div>
            <Badge color={reflection.status === 'reviewed' ? 'green' : 'blue'}>
              {reflection.status === 'reviewed' ? '✓ Peržiūrėta' : 'Pateikta'}
            </Badge>
          </div>

          <div className="space-y-6">
            {template?.fields.map(field => (
              <div key={field.key}>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  {field.label}
                </label>
                <div className="bg-slate-50 rounded-lg p-4 text-slate-900">
                  {formatAnswer(reflection.answers[field.key])}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {reflection.teacherComment && (
          <Card className="border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💬</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-900">Mokytojo komentaras</span>
                  <span className="text-sm text-slate-500">
                    {reflection.teacherComment.teacherName}
                  </span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">
                  {reflection.teacherComment.text}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(reflection.teacherComment.createdAt).toLocaleDateString('lt-LT')}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
