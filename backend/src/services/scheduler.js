/**
 * Scheduler Service for reminders and expiration handling
 * Uses node-cron to run periodic jobs
 */

const cron = require('node-cron');
const ScheduledQuestionnaire = require('../models/ScheduledQuestionnaire');
const Response = require('../models/Response');
const Group = require('../models/Group');

/**
 * Check and mark expired schedules
 */
const checkExpiredSchedules = async () => {
  try {
    const now = new Date();
    
    // Find active schedules that have passed their end time
    const expired = await ScheduledQuestionnaire.find({
      status: 'active',
      endsAt: { $lte: now },
    });

    if (expired.length > 0) {
      await ScheduledQuestionnaire.updateMany(
        { _id: { $in: expired.map(s => s._id) } },
        { $set: { status: 'expired' } }
      );
      
      console.log(`✅ Marked ${expired.length} schedule(s) as expired`);
    }
  } catch (error) {
    console.error('❌ Error checking expired schedules:', error);
  }
};

/**
 * Check and send reminders for upcoming deadlines
 * For MVP, we'll just log reminders (can be extended to send emails/push notifications)
 */
const checkReminders = async () => {
  try {
    const now = new Date();
    
    // Find active schedules that need reminders
    // Check for schedules ending in the next 24 hours
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Schedules ending in 24 hours (first reminder)
    const schedules24h = await ScheduledQuestionnaire.find({
      status: 'active',
      endsAt: { $gte: now, $lte: oneDayFromNow },
    }).populate('groupId', 'studentIds');
    
    // Filter out schedules that already have 24h reminder
    const schedules24hNeedingReminder = schedules24h.filter(schedule => {
      if (!schedule.reminders || schedule.reminders.length === 0) return true;
      return !schedule.reminders.some(r => r.type === '24h');
    });

    // Schedules ending in 1 hour (urgent reminder)
    const schedules1h = await ScheduledQuestionnaire.find({
      status: 'active',
      endsAt: { $gte: now, $lte: oneHourFromNow },
    }).populate('groupId', 'studentIds');
    
    const schedules1hNeedingReminder = schedules1h.filter(schedule => {
      if (!schedule.reminders || schedule.reminders.length === 0) return true;
      return !schedule.reminders.some(r => r.type === '1h');
    });

    // Schedules ending in 5 minutes (final reminder)
    const schedules5m = await ScheduledQuestionnaire.find({
      status: 'active',
      endsAt: { $gte: now, $lte: fiveMinutesFromNow },
    }).populate('groupId', 'studentIds');
    
    const schedules5mNeedingReminder = schedules5m.filter(schedule => {
      if (!schedule.reminders || schedule.reminders.length === 0) return true;
      return !schedule.reminders.some(r => r.type === '5m');
    });

    // Process 24h reminders
    for (const schedule of schedules24hNeedingReminder) {
      // Get students who haven't responded
      const responses = await Response.find({ scheduledQuestionnaireId: schedule._id });
      const respondedStudentIds = new Set(responses.map(r => r.studentId.toString()));
      const group = await Group.findById(schedule.groupId).populate('studentIds');
      const notResponded = group?.studentIds?.filter(s => !respondedStudentIds.has(s._id.toString())) || [];

      if (notResponded.length > 0) {
        console.log(`📧 [24h Reminder] Schedule "${schedule.title}": ${notResponded.length} student(s) haven't responded`);
        
        // Mark reminder as sent (for MVP, just log - can add email/push notification later)
        if (!schedule.reminders) {
          schedule.reminders = [];
        }
        schedule.reminders.push({
          type: '24h',
          sentAt: now,
          sentTo: notResponded.map(s => s._id),
        });
        await schedule.save();
      }
    }

    // Process 1h reminders
    for (const schedule of schedules1hNeedingReminder) {
      const responses = await Response.find({ scheduledQuestionnaireId: schedule._id });
      const respondedStudentIds = new Set(responses.map(r => r.studentId.toString()));
      const group = await Group.findById(schedule.groupId).populate('studentIds');
      const notResponded = group?.studentIds?.filter(s => !respondedStudentIds.has(s._id.toString())) || [];

      if (notResponded.length > 0) {
        console.log(`⚠️ [1h Reminder] Schedule "${schedule.title}": ${notResponded.length} student(s) haven't responded`);
        
        if (!schedule.reminders) {
          schedule.reminders = [];
        }
        schedule.reminders.push({
          type: '1h',
          sentAt: now,
          sentTo: notResponded.map(s => s._id),
        });
        await schedule.save();
      }
    }

    // Process 5m reminders
    for (const schedule of schedules5mNeedingReminder) {
      const responses = await Response.find({ scheduledQuestionnaireId: schedule._id });
      const respondedStudentIds = new Set(responses.map(r => r.studentId.toString()));
      const group = await Group.findById(schedule.groupId).populate('studentIds');
      const notResponded = group?.studentIds?.filter(s => !respondedStudentIds.has(s._id.toString())) || [];

      if (notResponded.length > 0) {
        console.log(`🔔 [5m Final Reminder] Schedule "${schedule.title}": ${notResponded.length} student(s) haven't responded`);
        
        if (!schedule.reminders) {
          schedule.reminders = [];
        }
        schedule.reminders.push({
          type: '5m',
          sentAt: now,
          sentTo: notResponded.map(s => s._id),
        });
        await schedule.save();
      }
    }

  } catch (error) {
    console.error('❌ Error checking reminders:', error);
  }
};

/**
 * Initialize scheduler jobs
 */
const initScheduler = () => {
  // Run every minute to check for expired schedules and reminders
  cron.schedule('* * * * *', async () => {
    await checkExpiredSchedules();
    await checkReminders();
  });

  console.log('✅ Scheduler initialized (runs every minute)');
};

module.exports = {
  initScheduler,
  checkExpiredSchedules,
  checkReminders,
};

