export const TimeBlockModel = {
    id: 'uuid',
    user_id: 'uuid', // Foreign key to Users
    
    // Time information
    start_time: 'timestamp',
    end_time: 'timestamp',
    duration_minutes: 'integer', // Calculated field
    
    // Block type and relationship
    type: 'enum', // 'existing_commitment', 'scheduled_task', 'break', 'buffer'
    task_id: 'uuid', // Foreign key to Tasks (null for existing commitments)
    
    // Block details
    title: 'string',
    description: 'text',
    location: 'string', // Optional
    
    // Scheduling metadata
    is_flexible: 'boolean', // Can this block be moved during optimization?
    is_recurring: 'boolean',
    recurrence_pattern: 'jsonb', // For recurring events
    
    // Integration data
    external_calendar_id: 'string', // ID from Google Calendar, Outlook, etc.
    external_event_id: 'string',
    sync_status: 'enum', // 'synced', 'pending', 'conflict', 'local_only'
    
    created_at: 'timestamp',
    updated_at: 'timestamp'
  };