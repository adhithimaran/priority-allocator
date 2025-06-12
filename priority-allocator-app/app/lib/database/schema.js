export const DatabaseSchema = {
    relationships: {
      // One-to-Many
      'users -> tasks': 'user_id',
      'users -> timeblocks': 'user_id', 
      'users -> schedules': 'user_id',
      'tasks -> timeblocks': 'task_id',
      'schedules -> task_completions': 'schedule_id',
      
      // Many-to-Many (through junction tables if needed)
      'tasks -> prerequisites': 'task_prerequisites table'
    },
    
    indexes: [
      'users(email)', // Unique
      'tasks(user_id, status)',
      'tasks(user_id, due_date)',
      'timeblocks(user_id, start_time)',
      'timeblocks(user_id, type)',
      'schedules(user_id, is_active)',
      'task_completions(user_id, completed_at)'
    ],
    
    constraints: [
      'timeblocks: end_time > start_time',
      'tasks: difficulty_level BETWEEN 1 AND 10',
      'tasks: importance_level BETWEEN 1 AND 10',
      'schedules: Only one active schedule per user',
      'users: email must be unique'
    ]
  };
  