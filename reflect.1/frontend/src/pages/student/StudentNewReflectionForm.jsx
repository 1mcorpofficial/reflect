import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Input, Textarea, Card } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { ROUTES } from "../../routes";

export default function StudentNewReflectionForm() {
  const { templateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const template = getTemplate(templateId);
  const taskId = new URLSearchParams(location.search).get('taskId');
  
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!template) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Template nerastas</p>
          <Button className="mt-4" onClick={() => navigate(ROUTES.STUDENT_NEW)}>
            Grįžti atgal
          </Button>
        </div>
      </Layout>
    );
  }

  const handleChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validacija
    const requiredFields = template.fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!answers[field.key] || answers[field.key].toString().trim() === '') {
        setError(`Prašome užpildyti: ${field.label}`);
        setLoading(false);
        return;
      }
    }

    try {
      await api.createReflection({
        studentId: user.id,
        studentName: user.name || user.email,
        classId: user.classId,
        templateId: template.id,
        taskId,
        answers,
      });
      
      navigate(ROUTES.STUDENT_HISTORY);
    } catch (err) {
      setError('Nepavyko išsaugoti refleksijos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title={template.name} 
        subtitle="Užpildykite visus laukus"
      />

      {taskId && (
        <Card className="max-w-3xl mx-auto mb-4 border-blue-200 bg-blue-50">
          <p className="text-sm text-slate-700">
            Ši refleksija yra susieta su mokytojo paskirta užduotimi. Pateikus atsakymus ji bus matoma užduočių sraute.
          </p>
        </Card>
      )}

      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {template.fields.map(field => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {field.label}
                {field.required && <span className="text-rose-500 ml-1">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <Textarea
                  value={answers[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={4}
                  placeholder={`Įveskite ${field.label.toLowerCase()}...`}
                />
              ) : field.type === 'number' ? (
                <Input
                  type="number"
                  value={answers[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  min={field.min}
                  max={field.max}
                  placeholder={`${field.min || 1} - ${field.max || 10}`}
                />
              ) : (
                <Input
                  type="text"
                  value={answers[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={`Įveskite ${field.label.toLowerCase()}...`}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(ROUTES.STUDENT_NEW)}
              disabled={loading}
            >
              Atšaukti
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saugoma...' : 'Pateikti refleksiją'}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
