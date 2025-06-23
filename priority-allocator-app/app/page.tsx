import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Priority Allocator
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Smart task prioritization and schedule optimization. Let AI help you manage your workload more effectively.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/tasks"
              className="bg-white text-gray-700 px-8 py-3 rounded-lg text-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              View Tasks
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Smart Prioritization</h3>
            <p className="text-gray-600">
              Advanced algorithms consider due dates, difficulty, and duration to calculate optimal task priorities.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-3">Schedule Optimization</h3>
            <p className="text-gray-600">
              Automatically generate optimized schedules that fit your tasks into available time slots.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3">Productivity Boost</h3>
            <p className="text-gray-600">
              Reduce planning overhead and focus on execution with intelligent task management.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Add Tasks</h4>
              <p className="text-gray-600 text-sm">Input your tasks with duration, difficulty, and due dates</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Generate Schedule</h4>
              <p className="text-gray-600 text-sm">Let the algorithm optimize your task schedule</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Execute</h4>
              <p className="text-gray-600 text-sm">Follow your optimized schedule and track progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}