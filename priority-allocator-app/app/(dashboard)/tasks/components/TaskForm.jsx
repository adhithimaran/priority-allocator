import { useState } from 'react';

export default function TaskForm({ onTaskSubmit, isLoading, userId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: 1,
    difficulty: 3,
    importance: 3
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    console.log('Form data:', formData);
    console.log('User ID:', userId);
    
    if (!formData.title.trim() || !formData.dueDate || !userId) {
      console.log('Validation failed');
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          title: formData.title,
          description: formData.description,
          estimatedDuration: formData.estimatedHours,
          difficultyLevel: formData.difficulty,
          importanceLevel: formData.importance,
          dueDate: formData.dueDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const result = await response.json();
      
      // Call the parent component's callback if provided
      if (onTaskSubmit) {
        onTaskSubmit(result.task);
      }
      
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        estimatedHours: 1,
        difficulty: 3,
        importance: 3
      });
      
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter task description..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours *
            </label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              min="0.5"
              max="24"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty (1-5) *
            </label>
            <input
              type="range"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              min="1"
              max="5"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Easy</span>
              <span className="font-medium">{formData.difficulty}</span>
              <span>Hard</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Importance (1-5) *
            </label>
            <input
              type="range"
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              min="1"
              max="5"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span className="font-medium">{formData.importance}</span>
              <span>High</span>
            </div>
          </div>
        </div>
        
        {/* Debug section - you can remove this once everything is working */}
        <div className="bg-gray-100 p-2 mb-4 text-sm rounded">
          <p className="font-medium">Debug info:</p>
          <p>isLoading: {isLoading ? 'true' : 'false'}</p>
          <p>isSubmitting: {isSubmitting ? 'true' : 'false'}</p>
          <p>title: '{formData.title}' (length: {formData.title.length})</p>
          <p>dueDate: '{formData.dueDate}'</p>
          <p>userId: '{userId}'</p>
          <p>difficulty: {formData.difficulty}</p>
          <p>importance: {formData.importance}</p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || isLoading || !formData.title.trim() || !formData.dueDate || !userId}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || isLoading ? 'Adding Task...' : 'Add Task'}
        </button>
      </form>
    </div>
  );
}