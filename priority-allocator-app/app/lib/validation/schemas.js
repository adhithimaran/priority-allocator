export const ValidationSchemas = {
    createTask: {
      title: 'required|string|max:200',
      description: 'optional|string|max:1000',
      estimated_duration: 'required|integer|min:5|max:480', // 5 min to 8 hours
      difficulty_level: 'required|integer|min:1|max:10',
      due_date: 'required|timestamp|future',
      importance_level: 'required|integer|min:1|max:10',
      tags: 'optional|array|max:10',
      energy_requirement: 'optional|enum:low,medium,high',
      preferred_time_of_day: 'optional|enum:morning,afternoon,evening,any'
    },
    
    createTimeBlock: {
      start_time: 'required|timestamp',
      end_time: 'required|timestamp|after:start_time',
      title: 'required|string|max:200',
      type: 'required|enum:existing_commitment,scheduled_task,break,buffer',
      is_flexible: 'optional|boolean'
    },
    
    updateUserPreferences: {
      'preferences.work_hours.start': 'required|time',
      'preferences.work_hours.end': 'required|time',
      'preferences.work_hours.days': 'required|array|min:1',
      'preferences.energy_patterns.morning_energy': 'required|integer|min:1|max:10',
      'preferences.energy_patterns.afternoon_energy': 'required|integer|min:1|max:10',
      'preferences.energy_patterns.evening_energy': 'required|integer|min:1|max:10'
    }
  };