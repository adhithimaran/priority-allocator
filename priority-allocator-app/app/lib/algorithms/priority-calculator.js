// utils/priorityAlgorithm.js

/**
 * Calculates task priority score based on urgency, difficulty, and duration
 * Uses a weighted algorithm inspired by Eisenhower Matrix principles
 * 
 * @param {Object} task - Task object
 * @param {string} task.due_date - ISO date string
 * @param {number} task.difficulty_level - 1-10 scale
 * @param {number} task.estimated_duration - Duration in minutes
 * @param {Object} options - Algorithm configuration options
 * @returns {number} Priority score (0-10)
 */
export function calculatePriorityScore(task, options = {}) {
    // Default weights (can be customized)
    const {
      urgencyWeight = 0.6,
      difficultyWeight = 0.3,
      durationWeight = 0.1,
      currentTime = new Date()
    } = options;
  
    // Validate required fields
    if (!task.due_date || task.difficulty_level === undefined || task.estimated_duration === undefined) {
      return 0; // Return 0 for incomplete data
    }
  
    const dueDate = new Date(task.due_date);
    const hoursUntilDue = (dueDate - currentTime) / (1000 * 60 * 60);
    
    // Calculate urgency score (0-10)
    const urgencyScore = calculateUrgencyScore(hoursUntilDue);
    
    // Calculate difficulty factor (0-3)
    const difficultyFactor = calculateDifficultyFactor(task.difficulty_level);
    
    // Calculate duration factor (0-2)
    const durationFactor = calculateDurationFactor(task.estimated_duration);
    
    // Apply weighted formula
    const priorityScore = (urgencyScore * urgencyWeight) + 
                         (difficultyFactor * difficultyWeight) + 
                         (durationFactor * durationWeight);
    
    // Clamp between 0-10
    return Math.min(Math.max(priorityScore, 0), 10);
  }
  
  /**
   * Calculate urgency score based on time until due date
   * @param {number} hoursUntilDue - Hours until task is due
   * @returns {number} Urgency score (0-10)
   */
  function calculateUrgencyScore(hoursUntilDue) {
    if (hoursUntilDue <= 0) return 10;     // Overdue
    if (hoursUntilDue <= 24) return 9;     // Due within 24 hours
    if (hoursUntilDue <= 72) return 7;     // Due within 3 days
    if (hoursUntilDue <= 168) return 5;    // Due within a week
    if (hoursUntilDue <= 720) return 3;    // Due within a month
    return 1;                              // Due later
  }
  
  /**
   * Calculate difficulty impact factor
   * @param {number} difficultyLevel - Difficulty level (1-10)
   * @returns {number} Difficulty factor (0-3)
   */
  function calculateDifficultyFactor(difficultyLevel) {
    return Math.min(difficultyLevel / 10, 1) * 3;
  }
  
  /**
   * Calculate duration impact factor
   * @param {number} estimatedDuration - Duration in minutes
   * @returns {number} Duration factor (0-2)
   */
  function calculateDurationFactor(estimatedDuration) {
    const baselineDuration = 240; // 4 hours as baseline
    return Math.min(estimatedDuration / baselineDuration, 1) * 2;
  }
  
  /**
   * Get priority label based on score
   * @param {number} score - Priority score (0-10)
   * @returns {string} Priority label
   */
  export function getPriorityLabel(score) {
    if (score >= 8) return 'Critical';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Medium';
    if (score >= 2) return 'Low';
    return 'Minimal';
  }
  
  /**
   * Get priority color class based on score
   * @param {number} score - Priority score (0-10)
   * @returns {string} Tailwind CSS class
   */
  export function getPriorityColor(score) {
    if (score >= 8) return 'bg-red-500';
    if (score >= 6) return 'bg-orange-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  }
  
  /**
   * Process array of tasks and ensure they all have priority scores
   * @param {Array} tasks - Array of task objects
   * @param {Object} options - Algorithm options
   * @returns {Array} Tasks with priority scores
   */
  export function ensureTasksPriority(tasks, options = {}) {
    return tasks.map(task => ({
      ...task,
      priority_score: task.priority_score !== undefined 
        ? task.priority_score 
        : calculatePriorityScore(task, options)
    }));
  }
  
  /**
   * Sort tasks by priority score and due date
   * @param {Array} tasks - Array of tasks with priority scores
   * @returns {Array} Sorted tasks
   */
  export function sortTasksByPriority(tasks) {
    return [...tasks].sort((a, b) => {
      // Sort by priority score (higher first), then by due date
      const priorityDiff = b.priority_score - a.priority_score;
      if (Math.abs(priorityDiff) > 0.1) { // Allow for small floating point differences
        return priorityDiff;
      }
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }