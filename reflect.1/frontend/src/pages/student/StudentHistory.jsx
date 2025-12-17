import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { PageContainer } from "../../components/PageContainer";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { ROUTES } from "../../routes";

export default function StudentHistory() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReflections();
  }, [user]);

  async function loadReflections() {
    if (!user) return;
    
    try {
      const res = await api.listStudentReflections(user.id);
      setReflections(res.items);
    } catch (error) {
      console.error('Failed to load reflections:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader 
          title="Mano istorija" 
          subtitle="Visos jūsų pateiktos refleksijos"
          action={
            <Button onClick={() => navigate(ROUTES.STUDENT_NEW)}>
              Refleksija
            </Button>
          }
        />

        {loading ? (
          <Card className="text-center py-12 text-slate-500">
            Kraunama...
          </Card>
        ) : reflections.length === 0 ? (
          <Card className="text-center py-12 max-w-3xl mx-auto">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-slate-600 mb-4">Dar neturite refleksijų</p>
            <Button onClick={() => navigate(ROUTES.STUDENT_NEW)}>
              Sukurti pirmą refleksiją
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {reflections.map(r => {
              const template = getTemplate(r.templateId);
              return (
                <Card
                  key={r.id}
                  className="hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/student/reflections/${r.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{template?.icon || '📝'}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">
                          {template?.name || 'Refleksija'}
                        </h3>
                        <div className="text-sm text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString('lt-LT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.teacherComment && (
                        <Badge color="amber">💬 Komentaras</Badge>
                      )}
                      <Badge color={r.status === 'reviewed' ? 'green' : 'blue'}>
                        {r.status === 'reviewed' ? '✓ Peržiūrėta' : 'Pateikta'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageContainer>
    </Layout>
  );
}
