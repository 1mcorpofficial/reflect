import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { LoginPage } from './pages/LoginPage';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';
import StudentNewReflection from './pages/student/StudentNewReflection';
import StudentNewReflectionForm from './pages/student/StudentNewReflectionForm';
import StudentHistory from './pages/student/StudentHistory';
import StudentReflectionDetail from './pages/student/StudentReflectionDetail';
import StudentTasks from './pages/student/StudentTasks';
import TeacherReview from './pages/teacher/TeacherReview';
import TeacherReflectionDetail from './pages/teacher/TeacherReflectionDetail';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherTasks from './pages/teacher/TeacherTasks';
import TeacherTasksNew from './pages/teacher/TeacherTasksNew';
import TeacherCalendar from './pages/teacher/TeacherCalendar';
import TeacherScheduleDetail from './pages/teacher/TeacherScheduleDetail';
import TeacherStats from './pages/teacher/TeacherStats';
import StudentStats from './pages/student/StudentStats';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.STUDENT_HOME,
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentHome />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_NEW,
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentNewReflection />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_NEW_TEMPLATE,
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentNewReflectionForm />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_HISTORY,
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_REFLECTION_DETAIL,
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentReflectionDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_TASKS,
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentTasks />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_STATS,
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentStats />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_HOME,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherHome />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_REVIEW,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherReview />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_REFLECTION_DETAIL,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherReflectionDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_CLASSES,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherClasses />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_TASKS,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherTasks />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_TASKS_NEW,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherTasksNew />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_CALENDAR,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherCalendar />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_SCHEDULE_DETAIL,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherScheduleDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TEACHER_STATS,
    element: (
      <ProtectedRoute requiredRole="teacher">
        <TeacherStats />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
]);
