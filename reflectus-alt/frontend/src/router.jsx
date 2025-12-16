import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import StudentHome from "./pages/student/StudentHome";
import NewReflection from "./pages/student/NewReflection";
import FillReflection from "./pages/student/FillReflection";
import History from "./pages/student/History";
import ReflectionDetail from "./pages/student/ReflectionDetail";
import TeacherHome from "./pages/teacher/TeacherHome";
import TeacherReflectionDetail from "./pages/teacher/TeacherReflectionDetail";
import { useAuthStore } from "./stores/authStore";

function RoleRedirect() {
  const { role } = useAuthStore.getState();
  if (role === "teacher") return <Navigate to="/teacher" replace />;
  if (role === "student") return <Navigate to="/student" replace />;
  return <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    element: <ProtectedRoute />, // requires auth
    children: [
      {
        element: <Layout />, // common shell
        children: [
          { index: true, element: <RoleRedirect /> },
          {
            element: <ProtectedRoute allowedRoles={["student"]} />,
            children: [
              { path: "/student", element: <StudentHome /> },
              { path: "/student/new", element: <NewReflection /> },
              { path: "/student/fill", element: <FillReflection /> },
              { path: "/student/history", element: <History /> },
              { path: "/student/reflections/:id", element: <ReflectionDetail /> }
            ]
          },
          {
            element: <ProtectedRoute allowedRoles={["teacher"]} />,
            children: [
              { path: "/teacher", element: <TeacherHome /> },
              { path: "/teacher/reflections/:id", element: <TeacherReflectionDetail /> }
            ]
          }
        ]
      }
    ]
  }
]);
