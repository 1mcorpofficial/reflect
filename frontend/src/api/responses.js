import apiClient from './client';

export const getResponses = (params = {}) => {
  return apiClient.get('/responses', { params });
};

export const getResponse = (id) => {
  return apiClient.get(`/responses/${id}`);
};

export const createResponse = (scheduleId, data) => {
  return apiClient.post(`/responses/schedule/${scheduleId}`, data);
};

export const addComment = (responseId, comment) => {
  return apiClient.post(`/responses/${responseId}/comment`, { text: comment });
};

