import api from './client';

export const createGroup = (name) => {
  return api.post('/groups', { name });
};

export const getMyGroups = () => {
  return api.get('/groups');
};

export const joinGroup = (code) => {
  return api.post('/groups/join', { code });
};

export const getGroupDetails = (id) => {
  return api.get(`/groups/${id}`);
};
