// src/routes.js - visi route'ai vienoje vietoje
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  
  // Student
  STUDENT_HOME: '/student',
  STUDENT_NEW: '/student/new',
  STUDENT_NEW_TEMPLATE: '/student/new/:templateId',
  STUDENT_HISTORY: '/student/history',
  STUDENT_REFLECTION_DETAIL: '/student/reflections/:id',
  STUDENT_TASKS: '/student/tasks',
  STUDENT_STATS: '/student/stats',
  
  // Teacher
  TEACHER_HOME: '/teacher',
  TEACHER_CLASSES: '/teacher/classes',
  TEACHER_TASKS: '/teacher/tasks',
  TEACHER_TASKS_NEW: '/teacher/tasks/new',
  TEACHER_REVIEW: '/teacher/review',
  TEACHER_REFLECTION_DETAIL: '/teacher/reflections/:id',
  TEACHER_STATS: '/teacher/stats',
  TEACHER_CALENDAR: '/teacher/calendar',
  TEACHER_SCHEDULE_DETAIL: '/teacher/schedules/:id',
};

// Helper funkcija route su parametrais
export const getRoute = (routePattern, params = {}) => {
  let route = routePattern;
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  return route;
};
