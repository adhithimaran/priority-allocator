import { useState } from 'react';

export default function TaskForm({ onTaskSubmit, isLoading, userId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    estimatedDuration: 1, // Keep as hours for user input
    difficultyLevel: 5,   // 1-10 scale to match your algorithm
    importanceLevel: 5    // 1-10 scale to match your algorithm
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedDuration' || name === 'difficultyLevel' || name === 'importanceLevel' 
        ? parseFloat(value) || 0 
        : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        newErrors.dueDate = 'Due date must be in the future';
      }
    }
    
    if (formData.estimatedDuration < 0.25) {
      newErrors.estimatedDuration = 'Duration must be at least 15 minutes (0.25 hours)';
    }
    
    if (formData.difficultyLevel < 1 || formData.difficultyLevel > 10) {
      newErrors.difficultyLevel = 'Difficulty must be between 1 and 10';
    }
    
    if (formData.importanceLevel < 1 || formData.importanceLevel > 10) {
      newErrors.importanceLevel = 'Importance must be between 1 and 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare data for API - convert hours to minutes and ensure correct field names
      const taskData = {
        userId: userId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedDuration: formData.estimatedDuration, // API expects hours, will convert internally
        difficultyLevel: formData.difficultyLevel,
        importanceLevel: formData.importanceLevel,
        dueDate: formData.dueDate
      };

      console.log('Submitting task data:', taskData);

      // Call the parent's onTaskSubmit function
      await onTaskSubmit(taskData);
      
      // Reset the form on success
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        estimatedDuration: 1,
        difficultyLevel: 5,
        importanceLevel: 5
      });
      
    } catch (error) {
      console.error('Error in task submission:', error);
      setErrors({ submit: error.message || 'Failed to create task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date for min date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Task</h2>
      
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="What needs to be done?"
            maxLength={200}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        
        {/* Description */}
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
            placeholder="Additional details (optional)..."
            maxLength={500}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={today}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dueDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
          </div>
          
          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration (hours) *
            </label>
            <input
              type="number"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              min="0.25"
              max="24"
              step="0.25"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.estimatedDuration ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.estimatedDuration && <p className="text-red-500 text-xs mt-1">{errors.estimatedDuration}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level: {formData.difficultyLevel}/10
            </label>
            <input
              type="range"
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Easy (1)</span>
              <span>Medium (5)</span>
              <span>Extremely Hard (10)</span>
            </div>
            {errors.difficultyLevel && <p className="text-red-500 text-xs mt-1">{errors.difficultyLevel}</p>}
          </div>
          
          {/* Importance Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Importance Level: {formData.importanceLevel}/10
            </label>
            <input
              type="range"
              name="importanceLevel"
              value={formData.importanceLevel}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>Medium (5)</span>
              <span>Critical (10)</span>
            </div>
            {errors.importanceLevel && <p className="text-red-500 text-xs mt-1">{errors.importanceLevel}</p>}
          </div>
        </div>

        {/* Priority Preview */}
        {formData.title && formData.dueDate && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> This task will be calculated with priority based on:
            </p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Due in {Math.ceil((new Date(formData.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days</li>
              <li>• {formData.estimatedDuration} hour{formData.estimatedDuration !== 1 ? 's' : ''} estimated</li>
              <li>• Difficulty: {formData.difficultyLevel}/10</li>
              <li>• Importance: {formData.importanceLevel}/10</li>
            </ul>
          </div>
        )}
        
        {/* Submit Errors */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting || isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Task...
            </span>
          ) : (
            'Add Task'
          )}
        </button>
      </div>
    </div>
  );
}