import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Badge, Input } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { ROUTES } from "../../routes";

export default function TeacherReview() {
  const navigate = useNavigate();
  const [reflections, setReflections] = useState([]);
  const [filteredReflections, setFilteredReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, submitted, reviewed

  useEffect(() => {
    loadReflections();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [reflections, filter]);

  async function loadReflections() {
    try {
      const res = await api.listTeacherReflections({});
      setReflections(res.items);
    } catch (error) {
      console.error('Failed to load reflections:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilter() {
    if (filter === 'all') {
      setFilteredReflections(reflections);
    } else {
      setFilteredReflections(reflections.filter(r => r.status === filter));
    }
  }

  return (
    <Layout>
      <PageHeader 
        title="Refleksijų peržiūra" 
        subtitle="Mokinių pateiktos refleksijos"
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Visos ({reflections.length})
          </Button>
          <Button
            variant={filter === 'submitted' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('submitted')}
          >
            Laukia peržiūros ({reflections.filter(r => r.status === 'submitted').length})
          </Button>
          <Button
            variant={filter === 'reviewed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('reviewed')}
          >
            Peržiūrėtos ({reflections.filter(r => r.status === 'reviewed').length})
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card className="text-center py-12">Kraunama...</Card>
      ) : filteredReflections.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-slate-600">Nėra refleksijų</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReflections.map(r => {
            const template = getTemplate(r.templateId);
            return (
              <Card
                key={r.id}
                className="hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/teacher/reflections/${r.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{template?.icon || '📝'}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">
                        {r.studentName}
                      </h3>
                      <div className="text-sm text-slate-500">
                        {template?.name} • {new Date(r.createdAt).toLocaleDateString('lt-LT')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.teacherComment && (
                      <Badge color="green">💬 Su komentaru</Badge>
                    )}
                    <Badge color={r.status === 'reviewed' ? 'green' : 'amber'}>
                      {r.status === 'reviewed' ? '✓ Peržiūrėta' : 'Laukia'}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      Peržiūrėti →
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
