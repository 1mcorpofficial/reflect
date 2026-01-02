const Response = require('../models/Response');
const ScheduledQuestionnaire = require('../models/ScheduledQuestionnaire');
const Question = require('../models/Question');
const User = require('../models/User');

// List responses for teacher review or student's own responses
const listResponses = async (req, res) => {
  try {
    const { status, groupId, scheduleId, studentId } = req.query;
    const filter = {};
    const userRole = req.user.role;

    // If student, only show their own responses
    if (userRole === 'student') {
      filter.studentId = req.user.id;
    } else if (studentId) {
      // Teacher can filter by studentId
      filter.studentId = studentId;
    }

    if (status) {
      filter.status = status;
    }

    if (groupId) {
      filter.groupId = groupId;
    }

    if (scheduleId) {
      filter.scheduledQuestionnaireId = scheduleId;
    }

    const responses = await Response.find(filter)
      .populate('studentId', 'name email')
      .populate('scheduledQuestionnaireId', 'title templateId')
      .sort({ createdAt: -1 });

    res.json(
      responses.map(r => ({
        id: r._id.toString(),
        studentId: r.studentId._id.toString(),
        studentName: r.studentId.name,
        scheduledQuestionnaireId: r.scheduledQuestionnaireId._id.toString(),
        scheduleTitle: r.scheduledQuestionnaireId.title,
        templateId: r.scheduledQuestionnaireId.templateId || null,
        status: r.status,
        teacherComment: r.teacherComment,
        submittedAt: r.submittedAt,
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    console.error('List responses error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get response details
const getResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('scheduledQuestionnaireId')
      .populate('answers.questionId');

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Check permissions: students can only see their own responses
    if (req.user.role === 'student' && response.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Transform answers to object format for frontend compatibility
    const answersObj = {};
    response.answers.forEach(ans => {
      const questionId = ans.questionId?._id?.toString() || ans.questionId?.toString();
      if (questionId) {
        answersObj[questionId] = ans.value;
      }
    });

    const schedule = response.scheduledQuestionnaireId;
    
    res.json({
      id: response._id.toString(),
      studentId: response.studentId._id.toString(),
      studentName: response.studentId.name,
      scheduledQuestionnaireId: schedule._id.toString(),
      scheduleTitle: schedule.title || '',
      templateId: schedule.templateId || null, // Template ID from schedule
      groupId: response.groupId.toString(),
      answers: answersObj, // Object format for frontend (keyed by question ID as string)
      answersArray: response.answers, // Keep array format too for detailed view
      status: response.status,
      teacherComment: response.teacherComment,
      submittedAt: response.submittedAt,
      createdAt: response.createdAt,
    });
  } catch (error) {
    console.error('Get response error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Submit response (for students)
const submitResponse = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { answers } = req.body;
    const studentId = req.user.id;

    // Find schedule
    const schedule = await ScheduledQuestionnaire.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Check if response already exists
    const existingResponse = await Response.findOne({
      scheduledQuestionnaireId: scheduleId,
      studentId,
    });

    if (existingResponse) {
      return res.status(400).json({ error: 'Response already submitted' });
    }

    // Get questions ordered by order field
    const questions = await Question.find({ _id: { $in: schedule.questions } }).sort({ order: 1 });
    if (answers.length !== questions.length) {
      return res.status(400).json({ error: 'Number of answers does not match number of questions' });
    }

    // Create response - match answers to questions by order (questions are created in template field order)
    const response = await Response.create({
      scheduledQuestionnaireId: scheduleId,
      studentId,
      groupId: schedule.groupId,
      answers: answers.map((answer, idx) => ({
        questionId: questions[idx]._id,
        status: answer.status || 'answered',
        value: answer.value,
        unknownFlow: answer.unknownFlow || undefined,
      })),
      status: 'submitted',
      submittedAt: new Date(),
    });

    // Trigger AI processing for text responses (async, don't wait)
    // This will be processed in the background
    const aiService = require('../services/aiService');
    const textAnswers = response.answers.filter((answer, idx) => {
      const question = questions[idx];
      return question && (question.type === 'text' || question.type === 'textarea') 
        && answer.status === 'answered' 
        && answer.value 
        && typeof answer.value === 'string'
        && answer.value.trim().length > 0;
    });

    // Process AI annotations asynchronously (fire and forget)
    textAnswers.forEach((answer, idx) => {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      if (question) {
        // Don't await - process in background
        aiService.processTextResponse(
          response._id,
          question._id,
          question.questionText,
          answer.value
        ).catch(err => {
          console.error(`Failed to process AI annotation for response ${response._id}, question ${question._id}:`, err);
        });
      }
    });

    res.status(201).json({
      message: 'Response submitted',
      response: {
        id: response._id.toString(),
        status: response.status,
      },
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add teacher comment
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const teacherId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const response = await Response.findById(id).populate('teacherId', 'name');
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Get teacher info
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Update response
    response.teacherComment = {
      text: text.trim(),
      teacherId,
      teacherName: teacher.name,
      createdAt: new Date(),
    };

    // Update status
    if (response.status === 'submitted') {
      response.status = 'reviewed';
    } else if (response.status === 'reviewed') {
      response.status = 'commented';
    }

    await response.save();

    // Log audit
    await logAction(req.user.id, 'comment', 'Response', response._id, {
      scheduledQuestionnaireId: response.scheduledQuestionnaireId,
      commentLength: text?.trim().length || 0,
    }, req);

    res.json({
      id: response._id.toString(),
      status: response.status,
      teacherComment: response.teacherComment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  listResponses,
  getResponse,
  submitResponse,
  addComment,
};

