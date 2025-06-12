export const UserModel = {
    id: 'uuid',
    email: 'string',
    password_hash: 'string', // for authentication
    timezone: 'string', // e.g., 'America/New_York'
    created_at: 'timestamp',
    updated_at: 'timestamp',
    
    // User preferences for scheduling
    preferences: {
      work_hours: {
        start: 'time', // e.g., '09:00'
        end: 'time',   // e.g., '17:00'
        days: ['string'] // e.g., ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      energy_patterns: {
        morning_energy: 'integer', // 1-10 scale
        afternoon_energy: 'integer',
        evening_energy: 'integer'
      },
      break_preferences: {
        min_break_duration: 'integer', // minutes
        max_work_session: 'integer',   // minutes before break needed
        lunch_break_duration: 'integer' // minutes
      },
      calendar_integration: {
        google_calendar_id: 'string',
        outlook_calendar_id: 'string',
        sync_enabled: 'boolean',
        last_sync: 'timestamp'
      }
    }
  };