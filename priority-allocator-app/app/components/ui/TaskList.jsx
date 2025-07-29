'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  ensureTasksPriority, 
  sortTasksByPriority, 
  getPriorityColor, 
  getPriorityLabel 
} from '../../lib/algorithms/priority-calculator';

export default function TaskList() {
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from database
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      
      // Transform API data to match your component's expected format
      const transformedTasks = data.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status?.toLowerCase() || 'pending', // Convert PENDING to pending
        due_date: task.dueDate, // API uses dueDate, component expects due_date
        estimated_duration: task.estimatedDuration, // API uses estimatedDuration
        difficulty_level: task.difficultyLevel, // API uses difficultyLevel
        importance_level: task.importanceLevel, // API uses importanceLevel
        priority_score: task.priorityScore, // API uses priorityScore
        created_at: task.createdAt,
        updated_at: task.updatedAt
      }));
      
      setTasks(transformedTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion status
  const onToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );

      // Update in database
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
    } catch (err) {
      console.error('Error updating task:', err);
      // Revert optimistic update on error
      fetchTasks();
    }
  };

  // Delete task
  const onDeleteTask = async (taskId) => {
    try {
      // Optimistically remove from UI
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

      // Delete from database
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
    } catch (err) {
      console.error('Error deleting task:', err);
      // Revert optimistic update on error
      fetchTasks();
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Ensure all tasks have priority scores and sort them
  const processedTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    const tasksWithPriority = ensureTasksPriority(tasks);
    return sortTasksByPriority(tasksWithPriority);
  }, [tasks]);

  const filteredTasks = processedTasks.filter(task => {
    if (filter === 'pending') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDifficultyColor = (level) => {
    if (!level || level <= 3) return 'bg-green-100 text-green-800';
    if (level <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const renderPriorityIndicator = (task) => {
    const score = task.priority_score || 0;
    return (
      <div
        className={`w-3 h-3 rounded-full ${getPriorityColor(score)}`}
        title={`Priority: ${getPriorityLabel(score)} (${score.toFixed(1)})`}
      />
    );
  };

  const renderPriorityText = (task) => {
    const score = task.priority_score || 0;
    return `${getPriorityLabel(score)} (${score.toFixed(1)})`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Tasks</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          Loading tasks...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Tasks</h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">Error loading tasks: {error}</div>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All ({tasks?.length || 0})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Pending ({tasks?.filter(t => t.status !== 'completed').length || 0})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Completed ({tasks?.filter(t => t.status === 'completed').length || 0})
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filter === 'all' ? 'No tasks yet. Add your first task!' : `No ${filter} tasks.`}
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => onToggleComplete(task.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <h3 className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title || 'Untitled Task'}
                      </h3>
                      {renderPriorityIndicator(task)}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-2 ml-7">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-3 ml-7 flex-wrap gap-y-1">
                      <span className="text-xs text-gray-500">
                        Due: {formatDate(task.due_date)}
                      </span>
                      {task.estimated_duration && (
                        <span className="text-xs text-gray-500">
                          {task.estimated_duration} min
                        </span>
                      )}
                      {task.difficulty_level && (
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(task.difficulty_level)}`}>
                          Difficulty: {task.difficulty_level}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Priority: {renderPriorityText(task)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 ml-4 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}