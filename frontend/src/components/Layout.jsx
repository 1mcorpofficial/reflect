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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={goHome} 
            className="flex items-center gap-3 cursor-pointer group transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-300">
              Reflectus
            </span>
            <Badge color={roleBadgeColor} className="group-hover:scale-105 transition-transform duration-200">
              {roleLabel}
            </Badge>
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm text-slate-600 hidden sm:inline">
              👋 {user?.name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Atsijungti
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
