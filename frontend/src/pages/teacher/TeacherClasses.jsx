import { useEffect, useState } from "react";
import { Button, Card, Input } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";

export default function TeacherClasses() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [className, setClassName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [user]);

  async function loadClasses() {
    if (!user) return;
    
    try {
      const res = await api.listTeacherClasses(user.id);
      setClasses(res.items);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClass(e) {
    e.preventDefault();
    if (!className.trim()) return;

    setCreating(true);
    try {
      await api.createClass({
        name: className.trim(),
        teacherId: user.id,
      });
      setClassName('');
      setShowCreate(false);
      await loadClasses();
    } catch (error) {
      console.error('Failed to create class:', error);
    } finally {
      setCreating(false);
    }
  }

  function copyCode(code) {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
  }

  return (
    <Layout>
      <PageHeader 
        title="Mano klasės" 
        subtitle="Valdykite mokinių grupes"
        action={
          <Button onClick={() => setShowCreate(true)}>+ Pridėti klasę</Button>
        }
      />

      {showCreate && (
        <Card className="mb-6 max-w-2xl">
          <form className="space-y-3" onSubmit={handleCreateClass}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Klasės pavadinimas</label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="pvz., 8A"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setClassName('');
                }}
                disabled={creating}
              >
                Atšaukti
              </Button>
              <Button type="submit" disabled={creating || !className.trim()}>
                {creating ? 'Saugoma...' : 'Sukurti klasę'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <Card className="text-center py-12">Kraunama...</Card>
      ) : classes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4 animate-bounce-slow">👥</div>
          <p className="text-slate-600 mb-4">Dar neturite klasių</p>
          <Button onClick={() => setShowCreate(true)}>Pridėti pirmą klasę</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, idx) => {
            const colors = ['blue', 'green', 'amber', 'rose', 'purple'];
            const color = colors[idx % colors.length];
            
            return (
              <Card key={cls.id} className="hover:shadow-lg transition">
                <div className={`w-16 h-16 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600 font-bold text-xl mb-4`}>
                  {cls.name}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">
                  {cls.name} klasė
                </h3>
                <div className="text-sm text-slate-600 mb-4">
                  <div>Mokiniai: {cls.studentIds.length}</div>
                  <div className="text-xs text-slate-500">Kodas: {cls.code}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => copyCode(cls.code)}
                >
                  Nukopijuoti kodą
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
