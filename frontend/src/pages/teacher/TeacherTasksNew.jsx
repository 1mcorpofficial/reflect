import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Textarea } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";
import { getAllTemplates } from "../../data/templates";
import { ROUTES } from "../../routes";

export default function TeacherTasksNew() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    templateId: '',
    startsAt: '',
    endsAt: '',
    privacyMode: 'named',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const templates = getAllTemplates();

  useEffect(() => {
    loadClasses();
  }, [user]);

  async function loadClasses() {
    if (!user) return;
    
    try {
      const res = await api.listTeacherClasses(user.id);
      setClasses(res.items);
      if (res.items.length > 0) {
        setFormData(prev => ({ ...prev, classId: res.items[0].id }));
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  }

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.classId || !formData.templateId || !formData.startsAt || !formData.endsAt) {
      setError('Prašome užpildyti visus privalomus laukus');
      return;
    }

    if (new Date(formData.endsAt) <= new Date(formData.startsAt)) {
      setError('Pabaigos laikas turi būti vėlesnis nei pradžios laikas');
      return;
    }

    setLoading(true);
    try {
      await api.createTask({
        ...formData,
        teacherId: user.id,
      });
      navigate(ROUTES.TEACHER_HOME);
    } catch (err) {
      setError('Nepavyko sukurti užduoties');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Nauja užduotis" 
        subtitle="Sukurkite refleksijos užduotį klasei"
      />

      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Pavadinimas <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="pvz., Savaitės refleksija"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Aprašymas
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Papildoma informacija mokiniams..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Klasė <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.classId}
              onChange={(e) => handleChange('classId', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Refleksijos tipas <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.templateId}
              onChange={(e) => handleChange('templateId', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Pasirinkite...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Pradžios laikas <span className="text-rose-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) => handleChange('startsAt', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Pabaigos laikas <span className="text-rose-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.endsAt}
                onChange={(e) => handleChange('endsAt', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Privatumo režimas <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.privacyMode}
              onChange={(e) => handleChange('privacyMode', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="named">Vardinis (matomas vardas)</option>
              <option value="pseudo_anon">Pseudonimas (tik mokytojui matomas)</option>
              <option value="anon_aggregate">Anoniminis agregatas (min. N≥5)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {formData.privacyMode === 'named' && 'Mokinio vardas matomas mokytojui'}
              {formData.privacyMode === 'pseudo_anon' && 'Mokinio vardas paslėptas, bet identifikavimas galimas'}
              {formData.privacyMode === 'anon_aggregate' && 'Rezultatai rodomi tik agreguotai (min. 5 atsakymai)'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(ROUTES.TEACHER_HOME)}
              disabled={loading}
            >
              Atšaukti
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saugoma...' : 'Sukurti užduotį'}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
