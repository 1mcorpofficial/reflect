// Export all models from a single file
const User = require('./User');
const Group = require('./Group');
const Question = require('./Question');
const ScheduledQuestionnaire = require('./ScheduledQuestionnaire');
const Response = require('./Response');
const AuditLog = require('./AuditLog');
const AIAnnotation = require('./AIAnnotation');

module.exports = {
  User,
  Group,
  Question,
  ScheduledQuestionnaire,
  Response,
  AuditLog,
  AIAnnotation
};

