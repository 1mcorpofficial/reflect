import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { ROUTES } from "../routes";

export default function TeacherHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reflections, setReflections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    
    try {
      const [reflectionsRes, classesRes, tasksRes] = await Promise.all([
        api.listTeacherReflections({ status: 'submitted' }),
        api.listTeacherClasses(user.id),
        api.listTeacherTasks(user.id),
      ]);
      
      setReflections(reflectionsRes.items);
      setClasses(classesRes.items);
      setTasks(tasksRes.items);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <PageHeader 
        title="Mokytojo skydelis" 
        subtitle="Valdykite klases ir peržiūrėkite mokinių refleksijas"
      />

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card 
          className="hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white border-0"
          onClick={() => navigate(ROUTES.TEACHER_TASKS_NEW)}
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-semibold text-lg">Nauja užduotis</h3>
          <p className="text-green-100 text-sm mt-1">Sukurkite refleksijos užduotį klasei</p>
        </Card>

        <Card 
          className="hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate(ROUTES.TEACHER_CLASSES)}
        >
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold text-lg text-slate-900">Mano klasės</h3>
          <p className="text-slate-600 text-sm mt-1">Valdykite mokinių grupes ({classes.length})</p>
        </Card>

        <Card 
          className="hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate(ROUTES.TEACHER_REVIEW)}
        >
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-lg text-slate-900">Peržiūra</h3>
          <p className="text-slate-600 text-sm mt-1">Mokinių refleksijos</p>
        </Card>
      </div>

      {/* Pending reviews */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-slate-900">Laukia peržiūros</h2>
          <Badge color={reflections.length > 0 ? "amber" : "green"}>
            {reflections.length} {reflections.length === 1 ? 'nauja' : 'naujos'}
          </Badge>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-500">Kraunama...</div>
        ) : reflections.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-3">✅</div>
            <p>Visos refleksijos peržiūrėtos!</p>
            <p className="text-sm mt-1">Čia bus rodomos mokinių pateiktos refleksijos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.slice(0, 3).map(r => (
              <div 
                key={r.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                onClick={() => navigate(`/teacher/reflections/${r.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📝</div>
                  <div>
                    <div className="font-medium text-slate-900">{r.studentName}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString('lt-LT')}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">Peržiūrėti →</Button>
              </div>
            ))}
            {reflections.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(ROUTES.TEACHER_REVIEW)}
              >
                Rodyti visas ({reflections.length}) →
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Classes overview */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-slate-900">Mano klasės</h2>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => navigate(ROUTES.TEACHER_CLASSES)}
          >
            + Pridėti klasę
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-500">Kraunama...</div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls, idx) => {
              const colors = ['blue', 'green', 'amber', 'rose', 'purple'];
              const color = colors[idx % colors.length];
              return (
                <div 
                  key={cls.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  onClick={() => navigate(ROUTES.TEACHER_CLASSES)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600 font-semibold`}>
                      {cls.name}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{cls.name} klasė</div>
                      <div className="text-sm text-slate-500">{cls.studentIds.length} mokiniai</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">Peržiūrėti →</Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
          <div className="text-sm text-slate-600">Klasės</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {classes.reduce((sum, cls) => sum + cls.studentIds.length, 0)}
          </div>
          <div className="text-sm text-slate-600">Mokiniai</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-amber-600">{reflections.length}</div>
          <div className="text-sm text-slate-600">Laukia peržiūros</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-slate-600">{tasks.length}</div>
          <div className="text-sm text-slate-600">Aktyvios užduotys</div>
        </Card>
      </div>
    </Layout>
  );
}
