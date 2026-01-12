const mongoose = require('mongoose');

const ScheduledQuestionnaireSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    templateId: { type: String, default: null },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],

    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },

    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    reminders: [{
      sentAt: { type: Date },
      type: { type: String, enum: ['24h', '1h', '5m', 'custom'] },
      sentTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],

    privacyMode: { type: String, enum: ['named', 'pseudo_anon', 'anon_aggregate'], default: 'named' },
    minNForAggregate: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScheduledQuestionnaire', ScheduledQuestionnaireSchema);


