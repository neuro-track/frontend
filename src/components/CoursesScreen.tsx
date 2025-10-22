import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  BookOpen,
  Bell,
  MessageSquare,
  Clock,
  Star,
  Users,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react';

export const CoursesScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { courses } = useLearningStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const currentLevel = 1;

  const categories = ['All', 'Web Development', 'Frontend Framework', 'Backend'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Neuro Track</h1>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Dashboard
                </span>
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  AI Chat
                </span>
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Courses
                </span>
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1.5 pr-3 transition-colors"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Level {currentLevel}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h2>
          <p className="text-gray-600">
            Discover personalized learning paths tailored to your goals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>Filter by:</span>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const completedCount = course.nodes.filter(
              (n) => n.status === 'completed'
            ).length;
            const totalCount = course.nodes.length;
            const totalMinutes = course.nodes.reduce(
              (sum, n) => sum + n.estimatedMinutes,
              0
            );
            const progressPercentage = Math.round(
              (completedCount / totalCount) * 100
            );

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                {/* Course Image/Icon */}
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-6xl">{course.icon}</div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star size={12} fill="currentColor" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {Math.round(totalMinutes / 60)}h {totalMinutes % 60}min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {totalCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      1.2k
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {progressPercentage > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs font-medium text-gray-900">
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gray-900 h-1.5 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {progressPercentage > 0 ? 'Continue' : 'Start Course'}
                    </span>
                    <ChevronRight
                      size={20}
                      className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
