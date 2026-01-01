import api from './client';

export const registerUser = (email, password, name, role) => {
  return api.post('/auth/register', { email, password, name, role });
};

export const loginUser = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const getMe = () => {
  return api.get('/auth/me');
};
