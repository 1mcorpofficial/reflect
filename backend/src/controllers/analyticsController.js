const Response = require('../models/Response');
const ScheduledQuestionnaire = require('../models/ScheduledQuestionnaire');
const Group = require('../models/Group');
const User = require('../models/User');

/**
 * Get overall teacher statistics
 * GET /api/analytics/teacher/stats
 */
const getTeacherStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all classes for this teacher
    const classes = await Group.find({ teacherId: userId });
    const classIds = classes.map(c => c._id);
    
    // Get all schedules for these classes
    const schedules = await ScheduledQuestionnaire.find({ groupId: { $in: classIds } });
    const scheduleIds = schedules.map(s => s._id);
    
    // Get all responses for these schedules
    const responses = await Response.find({ scheduledQuestionnaireId: { $in: scheduleIds } });
    
    // Calculate statistics
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0);
    const totalResponses = responses.length;
    const totalSchedules = schedules.length;
    
    // Response rate
    const activeSchedules = schedules.filter(s => {
      const now = new Date();
      return s.startsAt <= now && s.endsAt >= now;
    });
    
    const expectedResponses = activeSchedules.reduce((sum, schedule) => {
      const class_ = classes.find(c => c._id.toString() === schedule.groupId.toString());
      return sum + (class_?.studentIds?.length || 0);
    }, 0);
    
    const responseRate = expectedResponses > 0 
      ? Math.round((totalResponses / expectedResponses) * 100) 
      : 0;
    
    // Average scores (if scale questions exist) - from Response.answers array
    const scaleAnswers = responses
      .flatMap(r => (r.answers || []).map(a => a.value).filter(v => v != null))
      .filter(a => typeof a === 'number' && a >= 1 && a <= 5);
    
    const averageScore = scaleAnswers.length > 0
      ? scaleAnswers.reduce((sum, score) => sum + score, 0) / scaleAnswers.length
      : 0;
    
    // Top factors (from chips/multi-select)
    const factorCounts = {};
    responses.forEach(r => {
      (r.answers || []).forEach(answer => {
        const value = answer.value;
        if (typeof value === 'string' && value.includes(',')) {
          value.split(',').forEach(factor => {
            const trimmed = factor.trim();
            if (trimmed) {
              factorCounts[trimmed] = (factorCounts[trimmed] || 0) + 1;
            }
          });
        }
      });
    });
    
    const topFactors = Object.entries(factorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Don't know rate - check if any answer has status 'unknown'
    const dontKnowCount = responses.filter(r => 
      (r.answers || []).some(answer => answer.status === 'unknown')
    ).length;
    
    const dontKnowRate = totalResponses > 0
      ? Math.round((dontKnowCount / totalResponses) * 100)
      : 0;
    
    res.json({
      totalClasses: classes.length,
      totalStudents,
      totalSchedules,
      totalResponses,
      responseRate,
      averageScore: parseFloat(averageScore.toFixed(2)),
      topFactors,
      dontKnowRate,
      respondedCount: new Set(responses.map(r => r.studentId.toString())).size,
    });
  } catch (error) {
    console.error('Error getting teacher stats:', error);
    res.status(500).json({ error: 'Failed to get teacher statistics' });
  }
};

/**
 * Get class-specific statistics
 * GET /api/analytics/teacher/class/:classId
 */
const getClassStats = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    
    // Verify teacher owns this class
    const class_ = await Group.findById(classId);
    if (!class_ || class_.teacherId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get schedules for this class
    const schedules = await ScheduledQuestionnaire.find({ groupId: classId });
    const scheduleIds = schedules.map(s => s._id);
    
    // Get responses
    const responses = await Response.find({ scheduledQuestionnaireId: { $in: scheduleIds } });
    
    // Calculate class-specific stats
    const studentCount = class_.studentIds?.length || 0;
    const responseCount = responses.length;
    const responseRate = studentCount > 0 
      ? Math.round((responseCount / (studentCount * schedules.length)) * 100)
      : 0;
    
    // Average scores - from Response.answers array
    const scaleAnswers = responses
      .flatMap(r => (r.answers || []).map(a => a.value).filter(v => v != null))
      .filter(a => typeof a === 'number' && a >= 1 && a <= 5);
    
    const averageScore = scaleAnswers.length > 0
      ? scaleAnswers.reduce((sum, score) => sum + score, 0) / scaleAnswers.length
      : 0;
    
    res.json({
      className: class_.name,
      studentCount,
      responseCount,
      responseRate,
      averageScore: parseFloat(averageScore.toFixed(2)),
      scheduleCount: schedules.length,
    });
  } catch (error) {
    console.error('Error getting class stats:', error);
    res.status(500).json({ error: 'Failed to get class statistics' });
  }
};

/**
 * Get time-based trends
 * GET /api/analytics/teacher/trends
 */
const getTeacherTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const classes = await Group.find({ teacherId: userId });
    const classIds = classes.map(c => c._id);
    const schedules = await ScheduledQuestionnaire.find({ groupId: { $in: classIds } });
    const scheduleIds = schedules.map(s => s._id);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const responses = await Response.find({
      scheduledQuestionnaireId: { $in: scheduleIds },
      createdAt: { $gte: cutoffDate }
    }).sort({ createdAt: 1 });
    
    // Group by date
    const trendsByDate = {};
    responses.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      if (!trendsByDate[date]) {
        trendsByDate[date] = { count: 0, scores: [] };
      }
      trendsByDate[date].count++;
      
      // Extract scores from Response.answers array
      (r.answers || []).forEach(answer => {
        const value = answer.value;
        if (typeof value === 'number' && value >= 1 && value <= 5) {
          trendsByDate[date].scores.push(value);
        }
      });
    });
    
    // Convert to array format
    const trends = Object.entries(trendsByDate).map(([date, data]) => ({
      date,
      responseCount: data.count,
      averageScore: data.scores.length > 0
        ? parseFloat((data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length).toFixed(2))
        : null,
    }));
    
    res.json({ trends });
  } catch (error) {
    console.error('Error getting trends:', error);
    res.status(500).json({ error: 'Failed to get trends' });
  }
};

/**
 * Get student personal statistics
 * GET /api/analytics/student/stats
 */
const getStudentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const responses = await Response.find({ studentId: userId }).sort({ createdAt: -1 });
    
    const totalReflections = responses.length;
    const reviewedCount = responses.filter(r => r.status === 'reviewed').length;
    const withComments = responses.filter(r => r.teacherComment).length;
    
    // Get recent mood/wellbeing scores if available
    // Note: This requires templateId to be stored in the schedule, then we need to get it from populated schedule
    // For now, we'll try to extract from response's scheduledQuestionnaireId
    const moodResponses = await Response.find({ studentId: userId })
      .populate('scheduledQuestionnaireId', 'templateId')
      .sort({ createdAt: -1 })
      .limit(30);
    
    const moodScores = moodResponses
      .filter(r => r.scheduledQuestionnaireId?.templateId === 'mood')
      .map(r => {
        // Extract answers - need to match by question type/order
        // This is simplified - in real implementation would need to match question IDs
        const answersArray = r.answers || [];
        return {
          date: r.createdAt,
          mood: answersArray[0]?.value,
          energy: answersArray[1]?.value,
          stress: answersArray[2]?.value,
        };
      })
      .filter(m => m.mood !== undefined && typeof m.mood === 'number')
      .slice(0, 30);
    
    // Average mood score
    const avgMood = moodScores.length > 0
      ? parseFloat((moodScores.reduce((sum, m) => sum + (m.mood || 0), 0) / moodScores.length).toFixed(2))
      : null;
    
    res.json({
      totalReflections,
      reviewedCount,
      withComments,
      pendingReview: totalReflections - reviewedCount,
      moodScores,
      averageMood: avgMood,
    });
  } catch (error) {
    console.error('Error getting student stats:', error);
    res.status(500).json({ error: 'Failed to get student statistics' });
  }
};

module.exports = {
  getTeacherStats,
  getClassStats,
  getTeacherTrends,
  getStudentStats,
};
