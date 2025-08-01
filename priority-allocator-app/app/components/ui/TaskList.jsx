'use client';

import { useState } from 'react';

export default function TaskList({ tasks, onDeleteTask, onToggleComplete }) {
  const [filter, setFilter] = useState('all'); // all, pending, completed

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Sort by priority score (higher first), then by due date
    if (b.priority_score !== a.priority_score) {
      return b.priority_score - a.priority_score;
    }
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (level) => {
    if (level <= 3) return 'bg-green-100 text-green-800';
    if (level <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityColor = (score) => {
    if (score >= 8) return 'bg-red-500';
    if (score >= 6) return 'bg-orange-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

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
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Pending ({tasks.filter(t => t.status !== 'completed').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filter === 'all' ? 'No tasks yet. Add your first task!' : `No ${filter} tasks.`}
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 ${
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
                        {task.title}
                      </h3>
                      <div
                        className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority_score)}`}
                        title={`Priority Score: ${task.priority_score.toFixed(1)}`}
                      ></div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-2 ml-7">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-3 ml-7">
                      <span className="text-xs text-gray-500">
                        Due: {formatDate(task.due_date)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.estimated_duration} min
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(task.difficulty_level)}`}>
                        Difficulty: {task.difficulty_level}
                      </span>
                      <span className="text-xs text-gray-500">
                        Priority: {task.priority_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
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