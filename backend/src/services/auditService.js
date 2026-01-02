/**
 * Audit Service for logging critical actions
 */

const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 */
const logAction = async (userId, action, resourceType, resourceId = null, metadata = {}, req = null) => {
  try {
    const logEntry = {
      userId,
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.get('user-agent') || null,
    };

    await AuditLog.create(logEntry);
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error('Failed to create audit log:', error);
  }
};

/**
 * Helper to extract IP address from request
 */
const getIpAddress = (req) => {
  return req?.ip 
    || req?.connection?.remoteAddress 
    || req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || null;
};

module.exports = {
  logAction,
  getIpAddress,
};

