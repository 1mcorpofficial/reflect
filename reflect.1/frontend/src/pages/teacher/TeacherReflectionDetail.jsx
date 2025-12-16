import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Badge, Textarea } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { ROUTES } from "../../routes";

export default function TeacherReflectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reflection, setReflection] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReflection();
  }, [id]);

  async function loadReflection() {
    try {
      const res = await api.getReflection(id);
      setReflection(res.item);
      setComment(res.item.teacherComment?.text || '');
    } catch (error) {
      console.error('Failed to load reflection:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitComment() {
    if (!comment.trim()) return;
    
    setSubmitting(true);
    try {
      await api.addTeacherComment(id, {
        text: comment,
        teacherId: user.id,
        teacherName: user.name || user.email,
      });
      navigate(ROUTES.TEACHER_REVIEW);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Nepavyko išsaugoti komentaro');
    } finally {
      setSubmitting(false);
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
          <Button onClick={() => navigate(ROUTES.TEACHER_REVIEW)}>
            Grįžti atgal
          </Button>
        </Card>
      </Layout>
    );
  }

  const template = getTemplate(reflection.templateId);

  return (
    <Layout>
      <PageHeader 
        title={`${reflection.studentName} - ${template?.name || 'Refleksija'}`}
        subtitle={new Date(reflection.createdAt).toLocaleDateString('lt-LT')}
        action={
          <Button variant="ghost" onClick={() => navigate(ROUTES.TEACHER_REVIEW)}>
            ← Atgal į sąrašą
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Refleksijos turinys */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{template?.icon || '📝'}</div>
                <div>
                  <h2 className="font-semibold text-xl text-slate-900">
                    {template?.name || 'Refleksija'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Mokinys: {reflection.studentName}
                  </p>
                </div>
              </div>
              <Badge color={reflection.status === 'reviewed' ? 'green' : 'amber'}>
                {reflection.status === 'reviewed' ? '✓ Peržiūrėta' : 'Laukia peržiūros'}
              </Badge>
            </div>

            <div className="space-y-6">
              {template?.fields.map(field => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    {field.label}
                  </label>
                  <div className="bg-slate-50 rounded-lg p-4 text-slate-900">
                    {reflection.answers[field.key] || '—'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Komentaro forma */}
        <div>
          <Card className="sticky top-24">
            <h3 className="font-semibold text-lg text-slate-900 mb-4">
              💬 Jūsų komentaras
            </h3>
            
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={8}
              placeholder="Parašykite komentarą mokiniui..."
              className="mb-4"
            />

            <Button
              onClick={handleSubmitComment}
              disabled={!comment.trim() || submitting}
              className="w-full"
            >
              {submitting ? 'Saugoma...' : reflection.teacherComment ? 'Atnaujinti komentarą' : 'Pateikti komentarą'}
            </Button>

            {reflection.teacherComment && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">
                <div className="font-medium text-green-900 mb-1">
                  Komentaras pateiktas
                </div>
                <div className="text-green-700 text-xs">
                  {new Date(reflection.teacherComment.createdAt).toLocaleString('lt-LT')}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
