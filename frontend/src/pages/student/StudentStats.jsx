import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui";
import { ActivityRings } from "../../components/Apple";
import { LineChart } from "../../components/Charts";
import { getStudentStats } from "../../api/analytics";
import { ROUTES } from "../../routes";

export default function StudentStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const statsData = await getStudentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <Card className="text-center py-12">Kraunama...</Card>
        </PageContainer>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <PageContainer>
          <Card className="text-center py-12">
            <p className="text-slate-600">Nepavyko įkelti statistikos</p>
          </Card>
        </PageContainer>
      </Layout>
    );
  }

  // Prepare mood trend data
  const moodTrendData = stats.moodScores?.map(m => ({
    date: new Date(m.date).toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' }),
    nuotaika: m.mood,
    energija: m.energy,
    stresas: m.stress,
  })) || [];

  const reviewRate = stats.totalReflections > 0 
    ? (stats.reviewedCount / stats.totalReflections) * 100 
    : 0;
  const commentRate = stats.totalReflections > 0
    ? (stats.withComments / stats.totalReflections) * 100
    : 0;
  const moodGoal = stats.averageMood ? (stats.averageMood / 5) * 100 : 0;

  return (
    <Layout>
      <PageContainer>
        <PageHeader 
          title="Mano statistika" 
          subtitle="Asmeninis progresas ir tendencijos"
        />

        {/* Activity Rings */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Bendras progresas</h3>
          <div className="flex items-center justify-center py-6">
            <ActivityRings
              completed={reviewRate}
              progress={commentRate}
              goal={moodGoal}
              size={180}
              strokeWidth={12}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div>
              <p className="text-sm text-slate-600">Peržiūrėta</p>
              <p className="text-xl font-bold text-green-600 mt-1">{reviewRate.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Su komentarais</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{commentRate.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Vid. nuotaika</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{stats.averageMood?.toFixed(1) || '—'}</p>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalReflections}</div>
            <div className="text-sm text-slate-600 mt-2">Iš viso refleksijų</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.reviewedCount}</div>
            <div className="text-sm text-slate-600 mt-2">Peržiūrėtos</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.withComments}</div>
            <div className="text-sm text-slate-600 mt-2">Su komentarais</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-slate-600">{stats.pendingReview}</div>
            <div className="text-sm text-slate-600 mt-2">Laukia peržiūros</div>
          </Card>
        </div>

        {/* Mood Trends */}
        {moodTrendData.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Nuotaikos tendencijos</h3>
            <LineChart
              data={moodTrendData}
              lines={[
                { dataKey: 'nuotaika', stroke: '#007aff', name: 'Nuotaika' },
                { dataKey: 'energija', stroke: '#34c759', name: 'Energija' },
                { dataKey: 'stresas', stroke: '#ff9500', name: 'Stresas' },
              ]}
              height={300}
            />
          </Card>
        )}
      </PageContainer>
    </Layout>
  );
}

