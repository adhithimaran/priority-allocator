export const ScheduleModel = {
    id: 'uuid',
    user_id: 'uuid', // Foreign key to Users
    
    // Schedule metadata
    name: 'string', // e.g., "Week of Dec 4-10", "Optimal Schedule v3"
    generated_at: 'timestamp',
    is_active: 'boolean', // Only one active schedule per user
    schedule_start: 'timestamp', // When this schedule begins
    schedule_end: 'timestamp',   // When this schedule ends
    
    // Optimization information
    optimization_settings: {
      algorithm_version: 'string', // Track which algorithm was used
      weight_difficulty: 'float',  // How much to weight task difficulty
      weight_urgency: 'float',     // How much to weight due dates
      weight_importance: 'float',  // How much to weight user importance
      weight_energy_match: 'float', // How much to weight energy level matching
      allow_overtime: 'boolean',   // Can schedule outside work hours?
      max_overtime_hours: 'integer', // Max hours outside work time
      buffer_time_minutes: 'integer' // Buffer between tasks
    },
    
    // Performance metrics
    metrics: {
      total_tasks_scheduled: 'integer',
      total_scheduled_hours: 'float',
      average_priority_score: 'float',
      energy_efficiency_score: 'float', // How well energy levels matched
      schedule_density: 'float', // Percentage of available time used
      estimated_completion_rate: 'float' // Predicted success rate
    },
    
    // Status tracking
    status: 'enum', // 'generating', 'ready', 'active', 'completed', 'archived'
    generation_time_ms: 'integer', // How long optimization took
    
    created_at: 'timestamp',
    updated_at: 'timestamp'
  };