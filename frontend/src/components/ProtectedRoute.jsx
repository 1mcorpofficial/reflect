import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../routes';

export function ProtectedRoute({ children, requiredRole }) {
  const { user, token, ready } = useAuthStore();

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-slate-600">Kraunama...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectTo = user.role === 'teacher' ? ROUTES.TEACHER_HOME : ROUTES.STUDENT_HOME;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
