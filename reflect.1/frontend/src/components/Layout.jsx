import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button, Badge } from './ui';
import { ROUTES } from '../routes';

export function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const roleLabel = user?.role === 'teacher' ? '👩‍🏫 Mokytojas' : '🎓 Mokinys';
  const roleBadgeColor = user?.role === 'teacher' ? 'green' : 'blue';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const goHome = () => {
    navigate(user?.role === 'teacher' ? ROUTES.TEACHER_HOME : ROUTES.STUDENT_HOME);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
            <span className="text-xl font-bold text-blue-600">Reflectus</span>
            <Badge color={roleBadgeColor}>{roleLabel}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              👋 {user?.name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Atsijungti
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
