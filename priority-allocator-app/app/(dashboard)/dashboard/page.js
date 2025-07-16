'use client';
import { useState, useEffect } from 'react';
import TaskForm from '../tasks/components/TaskForm';
import TaskList from '../../components/ui/TaskList';
import SimpleCalendar from '../../components/ui/SimpleCalendar';


export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

// TODO: Replace this with actual user authentication
// You'll want to get this from your auth context/session
const userId = "1"; // hard-coded

  // Load initial data
  useEffect(() => {
    loadTasks();
    loadTimeBlocks();
  }, []);

  const loadTasks = async () => {
    try {
      // Add userId parameter to the API call
      const response = await fetch(`/api/tasks?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Your API returns { tasks: [...] }, so access the tasks property
        setTasks(data.tasks || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
    }
  };

  const loadTimeBlocks = async () => {
    try {
      const response = await fetch('/api/timeblocks');
      if (response.ok) {
        const data = await response.json();
        setTimeBlocks(data);
      }
    } catch (error) {
      console.error('Error loading time blocks:', error);
      setError('Failed to load schedule');
    }
  };

  const handleTaskSubmit = async (taskData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Debug: Log the taskData to see what we're receiving
      console.log('Task data received:', taskData);
      
      // Ensure all required fields are present
      const requestData = {
        userId: userId,
        title: taskData.title,
        description: taskData.description || '',
        estimatedDuration: taskData.estimatedDuration,
        difficultyLevel: taskData.difficultyLevel,
        importanceLevel: taskData.importanceLevel || taskData.importance || 3, // fallback to 3 if missing
        dueDate: taskData.dueDate
      };
      
      // Debug: Log the request data
      console.log('Request data being sent:', requestData);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => [...prev, result.task]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        // Also remove any time blocks for this task
        setTimeBlocks(prev => prev.filter(block => block.task_id !== taskId));
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/schedules/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // You can add optimization settings here
          optimization_settings: {
            work_hours_start: 9,
            work_hours_end: 17,
            break_duration: 15,
            max_continuous_work: 120
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Check if scheduling was impossible
        if (result.error) {
          setError(result.error);
          return;
        }

        // Reload time blocks to show the new schedule
        await loadTimeBlocks();
        
        // Show success message
        setError(''); // Clear any previous errors
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate schedule');
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Priority Allocator</h1>
          <p className="text-gray-600 mt-2">Optimize your schedule with smart task prioritization</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Task Management */}
          <div className="space-y-6">
            <TaskForm onTaskSubmit={handleTaskSubmit} isLoading={isLoading} userId={userId}/>
            <TaskList 
              tasks={tasks}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          </div>

          {/* Right Column - Calendar View */}
          <div>
            <SimpleCalendar
              tasks={tasks}
              timeBlocks={timeBlocks}
              onGenerateSchedule={handleGenerateSchedule}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status !== 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Pending Tasks</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed Tasks</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {timeBlocks.filter(b => b.type === 'scheduled_task').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled Tasks</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">
              {tasks.length > 0 ? (tasks.reduce((sum, t) => sum + t.priority_score, 0) / tasks.length).toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-gray-600">Avg Priority</div>
          </div>
        </div>
      </div>
    </div>
  );
}