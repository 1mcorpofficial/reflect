const ScheduledQuestionnaire = require('../models/ScheduledQuestionnaire');
const Question = require('../models/Question');
const Response = require('../models/Response');
const Group = require('../models/Group');
const User = require('../models/User');
const { logAction } = require('../services/auditService');

const createSchedule = async (req, res) => {
  try {
    const { title, description, groupId, templateId, questions, startsAt, endsAt, privacyMode, reminders } = req.body;
    const teacherId = req.user.id;

    if (!title || !groupId || !startsAt || !endsAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (new Date(endsAt) <= new Date(startsAt)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Create schedule first (temporarily without questions)
    const schedule = await ScheduledQuestionnaire.create({
      title,
      description,
      groupId,
      teacherId,
      templateId: templateId || null,
      questions: [],
      startsAt,
      endsAt,
      reminders: reminders || [],
      privacyMode: privacyMode || 'named',
    });

    // Create questions with schedule reference
    // If questions array provided, use it; otherwise templateId should generate questions (handled in service layer if needed)
    const questionsToCreate = questions && questions.length > 0 ? questions : [];
    
    const questionDocs = await Question.insertMany(
      questionsToCreate.map((q, idx) => ({
        scheduledQuestionnaireId: schedule._id,
        questionText: q.questionText || q.label || 'Klausimas',
        type: q.type || 'text',
        options: q.options || null,
        required: q.required ?? false,
        order: idx,
      }))
    );

    // Update schedule with question IDs
    schedule.questions = questionDocs.map(q => q._id);
    await schedule.save();

    // Log audit
    await logAction(req.user.id, 'create', 'ScheduledQuestionnaire', schedule._id, {
      title: schedule.title,
      groupId: schedule.groupId,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
    }, req);

    res.status(201).json(await schedule.populate('questions'));
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const listSchedules = async (req, res) => {
  try {
    const { from, to, groupId } = req.query;
    const filter = {};
    if (groupId) filter.groupId = groupId;
    if (from || to) {
      filter.startsAt = {};
      if (from) filter.startsAt.$gte = new Date(from);
      if (to) filter.startsAt.$lte = new Date(to);
    }

    const schedules = await ScheduledQuestionnaire.find(filter).sort({ startsAt: 1 }).populate('questions');
    res.json(schedules);
  } catch (error) {
    console.error('List schedules error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getSchedule = async (req, res) => {
  try {
    const schedule = await ScheduledQuestionnaire.findById(req.params.id).populate('questions');
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const schedule = await ScheduledQuestionnaire.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    const { title, description, startsAt, endsAt, status } = req.body;
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (title) schedule.title = title;
    if (description) schedule.description = description;
    if (startsAt) schedule.startsAt = startsAt;
    if (endsAt) schedule.endsAt = endsAt;
    if (status) schedule.status = status;

    await schedule.save();
    
    // Log audit
    await logAction(req.user.id, 'update', 'ScheduledQuestionnaire', schedule._id, {
      changes: { title, description, startsAt, endsAt, status },
    }, req);

    res.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await ScheduledQuestionnaire.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    // Log audit before deletion
    await logAction(req.user.id, 'delete', 'ScheduledQuestionnaire', schedule._id, {
      title: schedule.title,
      questionsCount: schedule.questions.length,
    }, req);

    await ScheduledQuestionnaire.deleteOne({ _id: schedule._id });
    await Question.deleteMany({ _id: { $in: schedule.questions } });
    await Response.deleteMany({ scheduledQuestionnaireId: schedule._id });

    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getProgress = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = await ScheduledQuestionnaire.findById(scheduleId).populate('groupId');
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    // Get all students in the group
    const group = await Group.findById(schedule.groupId).populate('studentIds');
    const students = group?.studentIds || [];
    const totalStudents = students.length;

    // Get all responses for this schedule
    const responses = await Response.find({ scheduledQuestionnaireId: scheduleId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    // Count unique students who responded
    const respondedStudentIds = new Set(responses.map(r => r.studentId._id.toString()));
    const respondedCount = respondedStudentIds.size;

    // Calculate percentage
    const percentage = totalStudents > 0 ? (respondedCount / totalStudents) * 100 : 0;

    res.json({
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
      responded: respondedCount,
      total: totalStudents,
      students: students.map(s => ({
        _id: s._id,
        id: s._id,
        name: s.name,
        email: s.email,
      })),
      responses: responses.map(r => ({
        id: r._id.toString(),
        _id: r._id.toString(),
        studentId: r.studentId._id.toString(),
        status: r.status,
        submittedAt: r.submittedAt,
      })),
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createSchedule,
  listSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  getProgress,
};

