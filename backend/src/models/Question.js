const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    scheduledQuestionnaireId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledQuestionnaire', required: true },
    version: { type: Number, default: 1 },
    questionText: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        'yesno',
        'traffic-light',
        'rating',
        'emotions',
        'text',
        'textarea',
        'select',
        'multi-select',
      ],
    },
    options: mongoose.Schema.Types.Mixed,
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);


