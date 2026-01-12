const Response = require('../models/Response');
const Question = require('../models/Question');
const AIAnnotation = require('../models/AIAnnotation');
const { processTextResponse, batchProcessTextResponses } = require('../services/aiService');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

/**
 * Process AI annotations for a specific response
 */
const processResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    
    // Get response
    const response = await Response.findById(responseId)
      .populate('scheduledQuestionnaireId');
    
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Check permissions (teacher must own the schedule)
    if (response.scheduledQuestionnaireId.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get questions
    const questions = await Question.find({
      _id: { $in: response.scheduledQuestionnaireId.questions }
    });

    // Process only text-type answers
    const textAnswers = response.answers.filter(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      return question && (question.type === 'text' || question.type === 'textarea') 
        && answer.status === 'answered' 
        && answer.value 
        && typeof answer.value === 'string'
        && answer.value.trim().length > 0;
    });

    const results = [];
    
    for (const answer of textAnswers) {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      try {
        const annotation = await processTextResponse(
          response._id,
          question._id,
          question.questionText,
          answer.value,
          { model: req.body.model || 'mock-v1' }
        );
        results.push({
          questionId: question._id,
          success: true,
          annotation,
        });
      } catch (error) {
        results.push({
          questionId: question._id,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      message: 'Processing completed',
      results,
    });
  } catch (error) {
    console.error('Process response AI error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Batch process responses for a schedule
 */
const processSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    const ScheduledQuestionnaire = require('../models/ScheduledQuestionnaire');
    const schedule = await ScheduledQuestionnaire.findById(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Check permissions
    if (schedule.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get all responses for this schedule
    const responses = await Response.find({ scheduledQuestionnaireId: scheduleId });
    
    // Get questions
    const questions = await Question.find({ _id: { $in: schedule.questions } });

    // Collect all text answers
    const textAnswersToProcess = [];
    
    for (const response of responses) {
      for (const answer of response.answers) {
        const question = questions.find(q => q._id.toString() === answer.questionId.toString());
        if (question && (question.type === 'text' || question.type === 'textarea') 
          && answer.status === 'answered' 
          && answer.value 
          && typeof answer.value === 'string'
          && answer.value.trim().length > 0) {
          textAnswersToProcess.push({
            responseId: response._id,
            questionId: question._id,
            questionText: question.questionText,
            answerText: answer.value,
          });
        }
      }
    }

    // Process in batches
    const results = await batchProcessTextResponses(textAnswersToProcess, {
      model: req.body.model || 'mock-v1',
    });

    res.json({
      message: 'Batch processing completed',
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    console.error('Process schedule AI error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get AI annotations for a response
 */
const getAnnotations = async (req, res) => {
  try {
    const { responseId } = req.params;
    
    const annotations = await AIAnnotation.find({ responseId })
      .populate('questionId', 'questionText type')
      .sort({ createdAt: 1 });

    res.json(annotations);
  } catch (error) {
    console.error('Get annotations error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  processResponse,
  processSchedule,
  getAnnotations,
};

