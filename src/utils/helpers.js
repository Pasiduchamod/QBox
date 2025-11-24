// Utility functions for the QBox app

/**
 * Generate a random room code
 * @param {number} length - Length of the room code (default: 6)
 * @returns {string} - Random room code
 */
export const generateRoomCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

/**
 * Generate an anonymous tag for a user
 * @returns {string} - Anonymous tag (e.g., "Panda#1274")
 */
export const generateAnonymousTag = () => {
  const animals = [
    'Panda', 'Tiger', 'Lion', 'Eagle', 'Dolphin', 'Fox', 
    'Wolf', 'Bear', 'Owl', 'Penguin', 'Koala', 'Zebra',
    'Giraffe', 'Elephant', 'Monkey', 'Rabbit', 'Deer', 'Turtle'
  ];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${animal}#${number}`;
};

/**
 * Format timestamp to relative time
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} - Relative time string (e.g., "2 min ago")
 */
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

/**
 * Validate room code format
 * @param {string} code - Room code to validate
 * @returns {boolean} - True if valid
 */
export const isValidRoomCode = (code) => {
  return /^[A-Z0-9]{6}$/.test(code);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Sort questions by various criteria
 * @param {Array} questions - Array of question objects
 * @param {string} sortBy - Sort criteria ('upvotes', 'recent', 'oldest')
 * @returns {Array} - Sorted questions
 */
export const sortQuestions = (questions, sortBy = 'upvotes') => {
  const sorted = [...questions];
  
  switch (sortBy) {
    case 'upvotes':
      return sorted.sort((a, b) => b.upvotes - a.upvotes);
    case 'recent':
      return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    default:
      return sorted;
  }
};

/**
 * Filter questions by status
 * @param {Array} questions - Array of question objects
 * @param {string} status - Status to filter by
 * @returns {Array} - Filtered questions
 */
export const filterQuestionsByStatus = (questions, status) => {
  if (status === 'all') return questions;
  return questions.filter(q => q.status === status);
};

/**
 * Validate question text
 * @param {string} text - Question text
 * @returns {Object} - Validation result { isValid, error }
 */
export const validateQuestion = (text) => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Question cannot be empty' };
  }
  if (text.trim().length < 10) {
    return { isValid: false, error: 'Question must be at least 10 characters' };
  }
  if (text.length > 500) {
    return { isValid: false, error: 'Question must be less than 500 characters' };
  }
  return { isValid: true, error: null };
};

/**
 * Count questions by status
 * @param {Array} questions - Array of question objects
 * @returns {Object} - Count object { all, approved, answered, pending, hidden }
 */
export const countQuestionsByStatus = (questions) => {
  return {
    all: questions.length,
    approved: questions.filter(q => q.status === 'approved').length,
    answered: questions.filter(q => q.status === 'answered').length,
    pending: questions.filter(q => q.status === 'pending').length,
    hidden: questions.filter(q => q.status === 'hidden').length,
  };
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default {
  generateRoomCode,
  generateAnonymousTag,
  formatRelativeTime,
  isValidRoomCode,
  truncateText,
  sortQuestions,
  filterQuestionsByStatus,
  validateQuestion,
  countQuestionsByStatus,
  debounce,
};
