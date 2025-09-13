/**
 * ======================
 * UTILITY FUNCTIONS
 * Healthcare Backend - Day 1 Mission 1
 * ======================
 */

/**
 * Format date for database storage
 * @param {Date} date - Date object to format
 * @returns {string} - ISO string format
 */
const formatDateForDB = (date) => {
  return new Date(date).toISOString();
};

/**
 * Generate random appointment ID for offline sync
 * @returns {string} - Unique identifier
 */
const generateOfflineId = () => {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Calculate age from date of birth
 * @param {string} dateOfBirth - Date of birth string
 * @returns {number} - Age in years
 */
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Generate audit log entry
 * @param {string} action - Action performed
 * @param {number} userId - User ID
 * @param {object} details - Additional details
 * @returns {object} - Log entry object
 */
const createLogEntry = (action, userId, details = {}) => {
  return {
    action,
    userId,
    details,
    timestamp: new Date()
  };
};

module.exports = {
  formatDateForDB,
  generateOfflineId,
  isValidEmail,
  sanitizeInput,
  calculateAge,
  createLogEntry
};
