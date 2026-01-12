import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui";
// Using simple Card components for highlights
import { PieChart, BarChart, LineChart } from "../../components/Charts";
import { ActivityRings } from "../../components/Apple";
import { getTeacherStats, getTeacherTrends, getClassStats } from "../../api/analytics";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";

export default function TeacherStats() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classStats, setClassStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (selectedClassId) {
      loadClassStats(selectedClassId);
    }
  }, [selectedClassId]);

  async function loadData() {
    if (!user) return;
    
    try {
      const [statsData, trendsData, classesRes] = await Promise.all([
        getTeacherStats(),
        getTeacherTrends(30),
        api.listTeacherClasses(user.id),
      ]);
      
      setStats(statsData);
      setTrends(trendsData);
      setClasses(classesRes.items);
      
      if (classesRes.items.length > 0) {
        setSelectedClassId(classesRes.items[0].id);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadClassStats(classId) {
    try {
      const classStatsData = await getClassStats(classId);
      setClassStats(classStatsData);
    } catch (error) {
      console.error('Failed to load class stats:', error);
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

  // Prepare chart data
  const topFactorsData = stats.topFactors?.map(f => ({
    name: f.name,
    value: f.count,
  })) || [];

  const trendsData = trends?.trends?.map(t => ({
    date: new Date(t.date).toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' }),
    responseCount: t.responseCount,
    averageScore: t.averageScore || 0,
  })) || [];

  const responseRate = stats.responseRate || 0;
  const completionRate = Math.min(responseRate, 100);

  return (
    <Layout>
      <PageContainer>
        <PageHeader 
          title="Statistika" 
          subtitle="Bendri rodikliai ir tendencijos"
        />

        {/* Highlights */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.responseRate}%</div>
            <div className="text-sm text-slate-600 mt-1">Atsakymo procentas</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.respondedCount}/{stats.totalStudents}</div>
            <div className="text-sm text-slate-600 mt-1">Atsakė mokinių</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.averageScore?.toFixed(1) || '—'}</div>
            <div className="text-sm text-slate-600 mt-1">Vidutinis įvertinimas</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-slate-600">{stats.totalSchedules}</div>
            <div className="text-sm text-slate-600 mt-1">Užduočių</div>
          </Card>
        </div>

        {/* Activity Rings */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Bendras progresas</h3>
          <div className="flex items-center justify-center py-6">
            <ActivityRings
              completed={completionRate}
              progress={stats.responseRate || 0}
              goal={stats.averageScore ? (stats.averageScore / 5) * 100 : 0}
              size={180}
              strokeWidth={12}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div>
              <p className="text-sm text-slate-600">Atsakymo procentas</p>
              <p className="text-xl font-bold text-green-600 mt-1">{stats.responseRate}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Vidutinis įvertinimas</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{stats.averageScore?.toFixed(1) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Atsakė mokinių</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{stats.respondedCount}/{stats.totalStudents}</p>
            </div>
          </div>
        </Card>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Factors Pie Chart */}
          {topFactorsData.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Dažniausi faktoriai</h3>
              <PieChart data={topFactorsData} height={250} />
            </Card>
          )}

          {/* Trends Line Chart */}
          {trendsData.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tendencijos (paskutiniai 30 dienų)</h3>
              <LineChart 
                data={trendsData}
                lines={[
                  { dataKey: 'responseCount', stroke: '#007aff', name: 'Atsakymai' },
                  { dataKey: 'averageScore', stroke: '#34c759', name: 'Vidutinis įvertinimas' },
                ]}
                height={250}
              />
            </Card>
          )}
        </div>

        {/* Class-specific stats */}
        {classes.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Statistika pagal klasę</h3>
            <div className="mb-4">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            {classStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                  <div className="text-xl font-bold text-blue-600">{classStats.studentCount}</div>
                  <div className="text-sm text-slate-600 mt-1">Mokinių</div>
                </Card>
                <Card className="text-center">
                  <div className="text-xl font-bold text-green-600">{classStats.responseCount}</div>
                  <div className="text-sm text-slate-600 mt-1">Atsakymai</div>
                </Card>
                <Card className="text-center">
                  <div className="text-xl font-bold text-amber-600">{classStats.responseRate}%</div>
                  <div className="text-sm text-slate-600 mt-1">Atsakymo %</div>
                </Card>
                <Card className="text-center">
                  <div className="text-xl font-bold text-green-600">{classStats.averageScore?.toFixed(1) || 'N/A'}</div>
                  <div className="text-sm text-slate-600 mt-1">Vid. įvertinimas</div>
                </Card>
              </div>
            )}
          </Card>
        )}
      </PageContainer>
    </Layout>
  );
}

