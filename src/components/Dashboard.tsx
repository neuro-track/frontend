import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  BookOpen,
  Bell,
  TrendingUp,
  MessageSquare,
  Map,
  Users,
  Star,
  ChevronRight,
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { courses } = useLearningStore();
  const { user } = useAuthStore();

  const completedNodes = courses.reduce(
    (sum, c) => sum + c.nodes.filter(n => n.status === 'completed').length,
    0
  );

  const mockCommunityPosts = [
    {
      id: 1,
      title: 'Python for Beginners',
      author: 'Ana Silva',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
      tags: ['Programming', 'Backend'],
      students: 1240,
      rating: 4.8,
    },
    {
      id: 2,
      title: 'Modern UI/UX Design',
      author: 'Carlos Mendes',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
      tags: ['Design', 'Creativity'],
      students: 892,
      rating: 4.9,
    },
    {
      id: 3,
      title: 'Advanced Digital Marketing',
      author: 'Lucia Santos',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
      tags: ['Marketing', 'Business'],
      students: 756,
      rating: 4.7,
    },
  ];

  const streakDays = 7;
  const totalXP = completedNodes * 100;
  const currentLevel = Math.floor(totalXP / 500) + 1;

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
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg"
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
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
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
        {/* Welcome Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-4">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back, {user?.name?.split(' ')[0]}
              </h2>
              <p className="text-gray-600 mb-6">
                Ready to continue your learning journey?
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('/learn')}
                  className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <Map size={18} />
                  View Learning Map
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <MessageSquare size={18} />
                  AI Assistant
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <BookOpen size={18} />
                  Browse Courses
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Current Level</p>
              <TrendingUp size={18} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{currentLevel}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total XP</p>
              <Star size={18} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalXP}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Streak</p>
              <TrendingUp size={18} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{streakDays} days</p>
          </div>
        </div>

        {/* Recommended for You */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.slice(0, 2).map((course) => {
              const completedCount = course.nodes.filter(
                (n) => n.status === 'completed'
              ).length;
              const totalCount = course.nodes.length;
              const totalMinutes = course.nodes.reduce(
                (sum, n) => sum + n.estimatedMinutes,
                0
              );

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full mb-3">
                        {course.category}
                      </span>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>{totalCount} lessons</span>
                        <span>{Math.round(totalMinutes / 60)}h {totalMinutes % 60}min</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full transition-all"
                        style={{
                          width: `${(completedCount / totalCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-gray-900 font-medium hover:gap-3 transition-all">
                    Start
                    <ChevronRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular in Community */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Popular in Community</h3>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              View all
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCommunityPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">by {post.author}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {post.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} fill="currentColor" />
                      {post.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
