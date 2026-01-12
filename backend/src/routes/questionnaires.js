const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const authMiddleware = require('../middleware/auth');

// POST /api/questionnaires - create questionnaire (teacher only)
router.post('/', authMiddleware, questionnaireController.createQuestionnaire);

// GET /api/questionnaires - get questionnaires (with optional groupId filter)
router.get('/', authMiddleware, questionnaireController.getQuestionnaires);

// GET /api/questionnaires/:id - get questionnaire details
router.get('/:id', authMiddleware, questionnaireController.getQuestionnaireDetails);

// POST /api/questionnaires/:id/responses - submit response
router.post('/:id/responses', authMiddleware, questionnaireController.submitResponse);

// GET /api/questionnaires/:id/responses/summary - get responses summary (teacher only)
router.get('/:id/responses/summary', authMiddleware, questionnaireController.getResponsesSummary);

module.exports = router;
