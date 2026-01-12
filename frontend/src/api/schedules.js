import apiClient from './client';

export const createSchedule = (data) => {
  return apiClient.post('/schedules', data);
};

export const getSchedules = (params = {}) => {
  return apiClient.get('/schedules', { params });
};

export const getSchedule = (id) => {
  return apiClient.get(`/schedules/${id}`);
};

export const updateSchedule = (id, data) => {
  return apiClient.patch(`/schedules/${id}`, data);
};

export const deleteSchedule = (id) => {
  return apiClient.delete(`/schedules/${id}`);
};

export const getScheduleProgress = (id) => {
  return apiClient.get(`/schedules/${id}/progress`);
};

