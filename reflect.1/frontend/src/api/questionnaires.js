import api from './client';

export const createQuestionnaire = (title, description, groupId, questions, startsAt, endsAt, isAnonymous) => {
  return api.post('/questionnaires', {
    title,
    description,
    groupId,
    questions,
    startsAt,
    endsAt,
    isAnonymous,
  });
};

export const getQuestionnaires = (groupId) => {
  return api.get('/questionnaires', { params: { groupId } });
};

export const getQuestionnaireDetails = (id) => {
  return api.get(`/questionnaires/${id}`);
};

export const submitResponse = (id, answers) => {
  return api.post(`/questionnaires/${id}/responses`, { answers });
};

export const getResponsesSummary = (id) => {
  return api.get(`/questionnaires/${id}/responses/summary`);
};
