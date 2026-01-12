import apiClient from './client';

/**
 * Get teacher statistics
 */
export async function getTeacherStats() {
  const res = await apiClient.get('/analytics/teacher/stats');
  return res.data;
}

/**
 * Get class-specific statistics
 */
export async function getClassStats(classId) {
  const res = await apiClient.get(`/analytics/teacher/class/${classId}`);
  return res.data;
}

/**
 * Get teacher trends
 */
export async function getTeacherTrends(days = 30) {
  const res = await apiClient.get('/analytics/teacher/trends', {
    params: { days },
  });
  return res.data;
}

/**
 * Get student statistics
 */
export async function getStudentStats() {
  const res = await apiClient.get('/analytics/student/stats');
  return res.data;
}
