export const TaskCompletionModel = {
    id: 'uuid',
    user_id: 'uuid',
    task_id: 'uuid',
    schedule_id: 'uuid',
    
    // Estimated vs Actual
    estimated_duration: 'integer', // minutes (from original task)
    actual_duration: 'integer',    // minutes (tracked)
    estimated_difficulty: 'integer', // 1-10 (from original task)
    actual_difficulty: 'integer',    // 1-10 (user feedback)
    
    // Context when completed
    completed_at: 'timestamp',
    energy_level_at_completion: 'integer', // 1-10 user reported
    interruptions_count: 'integer',
    satisfaction_score: 'integer', // 1-10 user rating
    
    // Notes for learning
    completion_notes: 'text', // User feedback
    was_rescheduled: 'boolean',
    reschedule_count: 'integer',
    
    created_at: 'timestamp'
  };