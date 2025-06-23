'use client';

import { useState, useMemo } from 'react';

export default function SimpleCalendar({ tasks, timeBlocks, onGenerateSchedule, isGenerating }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // day, week

  // Get today's schedule
  const todaySchedule = useMemo(() => {
    const selectedDateTime = new Date(selectedDate);
    const startOfDay = new Date(selectedDateTime.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDateTime.setHours(23, 59, 59, 999));

    const todayBlocks = timeBlocks.filter(block => {
      const blockStart = new Date(block.start_time);
      return blockStart >= startOfDay && blockStart <= endOfDay;
    });

    return todayBlocks.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [timeBlocks, selectedDate]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (start, end) => {
    const duration = (new Date(end) - new Date(start)) / (1000 * 60);
    return `${duration} min`;
  };

  const getBlockColor = (block) => {
    if (block.type === 'existing') return 'bg-gray-200 border-gray-400';
    if (block.type === 'scheduled_task') return 'bg-blue-100 border-blue-400';
    return 'bg-green-100 border-green-400';
  };

  const getTaskForBlock = (block) => {
    if (block.task_id) {
      return tasks.find(task => task.id === block.task_id);
    }
    return null;
  };

  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  const hasUnscheduledTasks = pendingTasks.some(task => 
    !timeBlocks.some(block => block.task_id === task.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule</h2>
          <div className="flex space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={onGenerateSchedule}
              disabled={isGenerating || !hasUnscheduledTasks}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>
        </div>

        {!hasUnscheduledTasks && pendingTasks.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
            <p className="text-green-800 text-sm">✓ All tasks are scheduled!</p>
          </div>
        )}

        {hasUnscheduledTasks && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              You have unscheduled tasks. Click "Generate Schedule" to optimize your day.
            </p>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h3 className="font-medium mb-2">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        {todaySchedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No scheduled items for this day.</p>
            {hasUnscheduledTasks && (
              <p className="mt-2">Generate a schedule to see your optimized day!</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {todaySchedule.map((block, index) => {
              const task = getTaskForBlock(block);
              return (
                <div
                  key={block.id || index}
                  className={`border-l-4 rounded p-3 ${getBlockColor(block)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {formatTime(block.start_time)} - {formatTime(block.end_time)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({formatDuration(block.start_time, block.end_time)})
                        </span>
                      </div>
                      
                      <h4 className="font-medium mt-1">
                        {task ? task.title : block.title}
                      </h4>
                      
                      {task && (
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
                          <span>Difficulty: {task.difficulty_level}</span>
                          <span>Priority: {task.priority_score.toFixed(1)}</span>
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {block.type === 'existing' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          Existing Commitment
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        block.type === 'existing' ? 'bg-gray-100 text-gray-700' :
                        block.type === 'scheduled_task' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {block.type === 'existing' ? 'Busy' : 
                         block.type === 'scheduled_task' ? 'Task' : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <h4 className="text-sm font-medium mb-2">Legend:</h4>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-200 border border-gray-400"></div>
            <span>Existing Commitments</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-400"></div>
            <span>Scheduled Tasks</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 border border-green-400"></div>
            <span>Free Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}