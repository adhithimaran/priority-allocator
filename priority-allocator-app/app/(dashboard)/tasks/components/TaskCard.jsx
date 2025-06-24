export default function TaskCard({ 
    task, 
    onToggleComplete, 
    onDeleteTask, 
    onEditTask,
    className = '' 
  }) {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return 'bg-red-100 text-red-700 border-red-200';
        case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };
  
    const getDifficultyText = (difficulty) => {
      const levels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
      return levels[difficulty] || 'Medium';
    };
  
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    const isDueSoon = task.dueDate && !task.completed && 
      new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  
    return (
      <div className={`
        bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg
        ${task.completed ? 'opacity-75 bg-green-50' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50' : ''}
        ${isDueSoon && !isOverdue ? 'border-yellow-300 bg-yellow-50' : ''}
        ${className}
      `}>
        <div className="p-4">
          {/* Header with checkbox and priority */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <button
                onClick={() => onToggleComplete(task.id)}
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors
                  ${task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                  }
                `}
              >
                {task.completed && '✓'}
              </button>
              <div className="flex-1">
                <h3 className={`
                  font-semibold text-lg leading-tight
                  ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}
                `}>
                  {task.title}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`
                text-xs px-2 py-1 rounded-full border font-medium
                ${getPriorityColor(task.priority)}
              `}>
                {task.priority || 'medium'}
              </span>
            </div>
          </div>
  
          {/* Description */}
          {task.description && (
            <p className={`
              text-sm mb-3 leading-relaxed
              ${task.completed ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {task.description}
            </p>
          )}
  
          {/* Task details */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
            {task.estimatedHours && (
              <span className="flex items-center">
                ⏱️ {task.estimatedHours}h
              </span>
            )}
            
            {task.difficulty && (
              <span className="flex items-center">
                📊 {getDifficultyText(task.difficulty)}
              </span>
            )}
            
            {task.dueDate && (
              <span className={`
                flex items-center
                ${isOverdue ? 'text-red-600 font-medium' : ''}
                ${isDueSoon && !isOverdue ? 'text-yellow-600 font-medium' : ''}
              `}>
                📅 {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue)'}
                {isDueSoon && !isOverdue && ' (Due Soon)'}
              </span>
            )}
          </div>
  
          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400">
              {task.createdAt && `Created ${new Date(task.createdAt).toLocaleDateString()}`}
            </div>
            
            <div className="flex items-center space-x-2">
              {onEditTask && (
                <button
                  onClick={() => onEditTask(task)}
                  className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                  title="Edit task"
                >
                  ✏️
                </button>
              )}
              
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }