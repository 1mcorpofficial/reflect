const mongoose = require('mongoose');

const UnknownFlowStepSchema = new mongoose.Schema(
  {
    stepId: { type: String, required: true },
    question: { type: String, default: '' },
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    status: { type: String, enum: ['answered', 'skip', 'unknown'], required: true },
    value: mongoose.Schema.Types.Mixed,
    unknownFlow: {
      steps: { type: [UnknownFlowStepSchema], default: undefined },
      resolvedTo: { type: String, enum: ['answered', 'skip'], default: null },
    },
  },
  { _id: false }
);

const ResponseSchema = new mongoose.Schema(
  {
    scheduledQuestionnaireId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledQuestionnaire', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },

    answers: { type: [AnswerSchema], default: [] },

    // teacher review / comment
    teacherComment: {
      text: { type: String, default: null },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      teacherName: { type: String, default: null },
      createdAt: { type: Date, default: null },
    },

    status: { type: String, enum: ['submitted', 'reviewed', 'commented'], default: 'submitted' },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ResponseSchema.index({ scheduledQuestionnaireId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Response', ResponseSchema);


