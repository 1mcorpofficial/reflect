// Mock data (replace with database later)
const questionnaires = [];
const responses = [];

const createQuestionnaire = (req, res) => {
  const { title, description, groupId, questions, startsAt, endsAt, isAnonymous } = req.body;
  const teacherId = req.user.id;

  if (!title || !groupId || !questions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newQuestionnaire = {
    id: Date.now().toString(),
    title,
    description,
    groupId,
    teacherId,
    questions,
    startsAt,
    endsAt,
    isAnonymous: isAnonymous || false,
    createdAt: new Date()
  };

  questionnaires.push(newQuestionnaire);
  res.status(201).json(newQuestionnaire);
};

const getQuestionnaires = (req, res) => {
  const { groupId } = req.query;

  let filtered = questionnaires;
  if (groupId) {
    filtered = questionnaires.filter(q => q.groupId === groupId);
  }

  res.json(filtered);
};

const getQuestionnaireDetails = (req, res) => {
  const { id } = req.params;
  const questionnaire = questionnaires.find(q => q.id === id);

  if (!questionnaire) {
    return res.status(404).json({ error: 'Questionnaire not found' });
  }

  res.json(questionnaire);
};

const submitResponse = (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  const studentId = req.user.id;

  const questionnaire = questionnaires.find(q => q.id === id);
  if (!questionnaire) {
    return res.status(404).json({ error: 'Questionnaire not found' });
  }

  const newResponse = {
    id: Date.now().toString(),
    questionnaireId: id,
    groupId: questionnaire.groupId,
    studentId: questionnaire.isAnonymous ? null : studentId,
    answers,
    createdAt: new Date()
  };

  responses.push(newResponse);
  res.status(201).json({ message: 'Response submitted', response: newResponse });
};

const getResponsesSummary = (req, res) => {
  const { id } = req.params;
  const questionnaireResponses = responses.filter(r => r.questionnaireId === id);

  const summary = {
    totalResponses: questionnaireResponses.length,
    responses: questionnaireResponses
  };

  res.json(summary);
};

module.exports = {
  createQuestionnaire,
  getQuestionnaires,
  getQuestionnaireDetails,
  submitResponse,
  getResponsesSummary
};
