export const TaskModel = {
    id: 'uuid',
    user_id: 'uuid', // Foreign key to Users
    title: 'string',
    description: 'text',
    
    // Priority calculation factors
    estimated_duration: 'integer', // minutes
    difficulty_level: 'integer',   // 1-10 scale
    due_date: 'timestamp',
    importance_level: 'integer',   // 1-10 scale (user defined)
    
    // Calculated fields
    priority_score: 'float', // Calculated by algorithm
    urgency_score: 'float',  // Based on due_date vs current_time
    
    // Task metadata
    status: 'enum', // 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
    created_at: 'timestamp',
    updated_at: 'timestamp',
    completed_at: 'timestamp',
    
    // Optional fields for advanced features
    tags: ['string'], // e.g., ['work', 'urgent', 'creative']
    prerequisites: ['uuid'], // Other task IDs that must be completed first
    energy_requirement: 'enum', // 'low', 'medium', 'high'
    is_flexible: 'boolean', // Can this task be moved around easily?
    preferred_time_of_day: 'enum' // 'morning', 'afternoon', 'evening', 'any'
  };