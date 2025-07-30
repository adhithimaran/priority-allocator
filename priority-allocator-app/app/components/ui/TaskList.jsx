// Priority calculation functions (copied from your priority algorithm)
function calculatePriorityScore(task, options = {}) {
  const {
    urgencyWeight = 0.6,
    difficultyWeight = 0.3,
    durationWeight = 0.1,
    currentTime = new Date()
  } = options;

  if (!task.dueDate || task.difficultyLevel === undefined || task.estimatedDuration === undefined) {
    return 0;
  }

  const dueDate = new Date(task.dueDate);
  const hoursUntilDue = (dueDate - currentTime) / (1000 * 60 * 60);
  
  const urgencyScore = calculateUrgencyScore(hoursUntilDue);
  const difficultyFactor = calculateDifficultyFactor(task.difficultyLevel);
  const durationFactor = calculateDurationFactor(task.estimatedDuration * 60); // Convert hours to minutes
  
  const priorityScore = (urgencyScore * urgencyWeight) + 
                       (difficultyFactor * difficultyWeight) + 
                       (durationFactor * durationWeight);
  
  return Math.min(Math.max(priorityScore, 0), 10);
}

function calculateUrgencyScore(hoursUntilDue) {
  if (hoursUntilDue <= 0) return 10;     // Overdue
  if (hoursUntilDue <= 24) return 9;     // Due within 24 hours
  if (hoursUntilDue <= 72) return 7;     // Due within 3 days
  if (hoursUntilDue <= 168) return 5;    // Due within a week
  if (hoursUntilDue <= 720) return 3;    // Due within a month
  return 1;                              // Due later
}

function calculateDifficultyFactor(difficultyLevel) {
  return Math.min(difficultyLevel / 10, 1) * 3;
}

function calculateDurationFactor(estimatedDuration) {
  const baselineDuration = 240; // 4 hours as baseline
  return Math.min(estimatedDuration / baselineDuration, 1) * 2;
}

function getPriorityLabel(score) {
  if (score >= 8) return 'Critical';
  if (score >= 6) return 'High';
  if (score >= 4) return 'Medium';
  if (score >= 2) return 'Low';
  return 'Minimal';
}

function getPriorityColor(score) {
  if (score >= 8) return 'bg-red-500';
  if (score >= 6) return 'bg-orange-500';
  if (score >= 4) return 'bg-yellow-500';
  return 'bg-green-500';
}

function ensureTasksPriority(tasks, options = {}) {
  return tasks.map(task => ({
    ...task,
    priorityScore: task.priorityScore !== undefined 
      ? task.priorityScore 
      : calculatePriorityScore(task, options)
  }));
}

function sortTasksByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    const priorityDiff = b.priorityScore - a.priorityScore;
    if (Math.abs(priorityDiff) > 0.1) {
      return priorityDiff;
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
} 

// TaskCard component (embedded)
function TaskCard({ 
  task, 
  onToggleComplete, 
  onDeleteTask, 
  onEditTask,
  className = '' 
}) {
  const priorityScore = task.priorityScore || task.priority_score || 
    calculatePriorityScore(task);
  
  const priorityLabel = getPriorityLabel(priorityScore);
  const priorityColorClass = getPriorityColor(priorityScore);

  const getDifficultyText = (difficulty) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 4) return 'Medium';
    if (difficulty <= 6) return 'Hard';
    if (difficulty <= 8) return 'Very Hard';
    return 'Extreme';
  };

  const getImportanceText = (importance) => {
    if (importance <= 2) return 'Low';
    if (importance <= 4) return 'Medium';
    if (importance <= 6) return 'High';
    if (importance <= 8) return 'Very High';
    return 'Critical';
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  const isDueSoon = task.dueDate && task.status !== 'COMPLETED' && 
    new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const isCompleted = task.status === 'COMPLETED' || task.completed;

  return (
    <div className={`
      bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg
      ${isCompleted ? 'opacity-75 bg-green-50' : ''}
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
                ${isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
                }
              `}
            >
              {isCompleted && '✓'}
            </button>
            <div className="flex-1">
              <h3 className={`
                font-semibold text-lg leading-tight
                ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}
              `}>
                {task.title}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Priority Score */}
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Score: {priorityScore.toFixed(1)}
            </span>
            {/* Priority Label */}
            <span className={`
              text-xs px-2 py-1 rounded-full border font-medium text-white
              ${priorityColorClass}
            `}>
              {priorityLabel}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`
            text-sm mb-3 leading-relaxed
            ${isCompleted ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {task.description}
          </p>
        )}

        {/* Task details */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <span>⏱️</span>
            <span>{task.estimatedDuration}h duration</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span>📊</span>
            <span>Difficulty: {getDifficultyText(task.difficultyLevel)} ({task.difficultyLevel}/10)</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span>⚡</span>
            <span>Importance: {getImportanceText(task.importanceLevel)} ({task.importanceLevel}/10)</span>
          </div>
          
          {task.dueDate && (
            <div className={`
              flex items-center space-x-1
              ${isOverdue ? 'text-red-600 font-medium' : ''}
              ${isDueSoon && !isOverdue ? 'text-yellow-600 font-medium' : ''}
            `}>
              <span>📅</span>
              <span>
                Due: {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue!)'}
                {isDueSoon && !isOverdue && ' (Soon)'}
              </span>
            </div>
          )}
        </div>

        {/* Time until due */}
        {task.dueDate && !isCompleted && (
          <div className="text-xs text-gray-500 mb-3">
            {(() => {
              const now = new Date();
              const due = new Date(task.dueDate);
              const hoursLeft = Math.max(0, (due - now) / (1000 * 60 * 60));
              
              if (hoursLeft <= 0) return "⚠️ Overdue";
              if (hoursLeft < 24) return `🔥 ${Math.round(hoursLeft)} hours left`;
              const daysLeft = Math.round(hoursLeft / 24);
              return `📆 ${daysLeft} days left`;
            })()}
          </div>
        )}

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

// Main TaskList component
export default function TaskList({ 
  tasks = [], 
  onDeleteTask, 
  onToggleComplete, 
  onEditTask 
}) {
  // Process tasks to ensure they have priority scores and sort them
  const processedTasks = ensureTasksPriority(tasks);
  const sortedTasks = sortTasksByPriority(processedTasks);

  // Filter tasks by status
  const pendingTasks = sortedTasks.filter(task => task.status !== 'COMPLETED' && !task.completed);
  const completedTasks = sortedTasks.filter(task => task.status === 'COMPLETED' || task.completed);

  if (tasks.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">Create your first task to get started with priority scheduling.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Tasks ({pendingTasks.length})
            </h3>
            <div className="text-sm text-gray-500">
              Sorted by priority score
            </div>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Completed Tasks ({completedTasks.length})
            </h3>
            <button 
              className="text-sm text-gray-500 underline hover:text-gray-700"
              onClick={() => {
                // You could implement a "clear completed" function here
                console.log('Clear completed tasks functionality');
              }}
            >
              Clear completed
            </button>
          </div>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}