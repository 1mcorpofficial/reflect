import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Input, Textarea, Card } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { PageContainer } from "../../components/PageContainer";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { ROUTES } from "../../routes";

const ratingScale = [
  { value: 1, label: "Blogai" },
  { value: 2, label: "Silpnai" },
  { value: 3, label: "Vidutiniškai" },
  { value: 4, label: "Gerai" },
  { value: 5, label: "Puikiai" },
];

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

  const visibleFields = useMemo(() => {
    if (!template) return [];
    return template.fields.filter((field) => {
      if (!field.showIf) return true;
      return answers[field.showIf.field] === field.showIf.equals;
    });
  }, [template, answers]);

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

  const toggleMultiSelect = (key, option) => {
    setAnswers(prev => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(option);
      const next = exists ? current.filter(o => o !== option) : [...current, option];
      return { ...prev, [key]: next };
    });
  };

  const isFieldFilled = (field) => {
    if (field.showIf && answers[field.showIf.field] !== field.showIf.equals) {
      return true;
    }
    const value = answers[field.key];
    if (field.type === 'multi-select') return Array.isArray(value) && value.length > 0;
    return value !== undefined && value !== null && value.toString().trim() !== '';
  };

  const prepareAnswers = () => {
    const formatted = {};
    template.fields.forEach(field => {
      if (field.showIf && answers[field.showIf.field] !== field.showIf.equals) return;
      const value = answers[field.key];
      if (field.type === 'multi-select') {
        formatted[field.key] = Array.isArray(value) ? value.join(', ') : (value || '');
      } else {
        formatted[field.key] = value ?? '';
      }
    });
    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    for (const field of visibleFields) {
      if (field.required && !isFieldFilled(field)) {
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
        answers: prepareAnswers(),
      });
      
      navigate(ROUTES.STUDENT_HISTORY);
    } catch (err) {
      setError('Nepavyko išsaugoti refleksijos');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={answers[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={`Įveskite ${field.label.toLowerCase()}...`}
            className="min-h-[120px]"
          />
        );
      case 'rating':
        return (
          <div className="flex flex-wrap gap-2">
            {ratingScale.map(opt => {
              const active = answers[field.key] === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => handleChange(field.key, opt.value)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                    active ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-semibold">{opt.value}</span>
                  <span className="text-xs text-slate-500">{opt.label}</span>
                </button>
              );
            })}
          </div>
        );
      case 'select':
        return (
          <select
            value={answers[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Pasirinkite...</option>
            {field.options?.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );
      case 'multi-select': {
        const selected = Array.isArray(answers[field.key]) ? answers[field.key] : [];
        return (
          <div className="flex flex-wrap gap-2">
            {field.options?.map(opt => {
              const active = selected.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleMultiSelect(field.key, opt)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    active ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );
      }
      case 'yesno': {
        const options = ['Taip', 'Ne'];
        return (
          <div className="flex flex-wrap gap-2">
            {options.map(opt => {
              const active = answers[field.key] === opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleChange(field.key, opt)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    active ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );
      }
      default:
        return (
          <Input
            type="text"
            value={answers[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={`Įveskite ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader 
          title={template.name} 
          subtitle={template.description || "Užpildykite visus laukus"}
        />

        {template.id === 'mood' && (
          <Card className="max-w-3xl mx-auto mb-4 border-blue-200 bg-blue-50">
            <p className="text-sm text-slate-700">
              Šią refleksiją matys atsakingi mokyklos darbuotojai (mokytojas/kuratorius).
            </p>
          </Card>
        )}

        {taskId && (
          <Card className="max-w-3xl mx-auto mb-4 border-blue-200 bg-blue-50">
            <p className="text-sm text-slate-700">
              Ši refleksija yra susieta su mokytojo paskirta užduotimi. Pateikus atsakymus ji bus matoma užduočių sraute.
            </p>
          </Card>
        )}

        <Card className="max-w-3xl mx-auto rounded-2xl shadow-sm hover:shadow-md transition">
          <form onSubmit={handleSubmit} className="space-y-5">
            {visibleFields.map(field => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-slate-800">
                  {field.label}
                  {field.required && <span className="text-rose-500 ml-1">*</span>}
                </label>
                
                {renderField(field)}
              </div>
            ))}

            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                ⚠️ {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(ROUTES.STUDENT_NEW)}
                disabled={loading}
              >
                Atšaukti
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saugoma...' : 'Pateikti'}
              </Button>
            </div>
          </form>
        </Card>
      </PageContainer>
    </Layout>
  );
}
