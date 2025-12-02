import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from './Navbar';
import {
  BookOpen,
  TrendingUp,
  MessageSquare,
  Map,
  Star,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { courses } = useLearningStore();
  const { user } = useAuthStore();

  const completedNodes = courses.reduce(
    (sum, c) => sum + c.nodes.filter(n => n.status === 'completed').length,
    0
  );

  // Get other available courses (excluding first 2 shown in recommended)
  const otherCourses = courses.slice(2);

  const streakDays = 7;
  const totalXP = completedNodes * 100;
  const currentLevel = Math.floor(totalXP / 500) + 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <div className="flex items-start gap-4">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Welcome back, {user?.name?.split(' ')[0]}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
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
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
              <TrendingUp size={18} className="text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{currentLevel}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-1">
                <span>Progress to Level {currentLevel + 1}</span>
                <span>{(totalXP % 500)} / 500 XP</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${((totalXP % 500) / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
              <Star size={18} className="text-yellow-500 dark:text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalXP}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {completedNodes} lessons completed
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
              <TrendingUp size={18} className="text-orange-500 dark:text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{streakDays} days</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Keep learning to maintain your streak! 🔥
            </p>
          </div>
        </div>

        {/* Recommended for You */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recommended for You</h3>
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
              const progressPercent = (completedCount / totalCount) * 100;

              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all cursor-pointer group"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full mb-3">
                        {course.category}
                      </span>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span>{totalCount} lessons</span>
                        <span>{Math.round(totalMinutes / 60)}h {totalMinutes % 60}min</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-gray-900 dark:text-white font-medium group-hover:gap-3 transition-all">
                    {completedCount === 0 ? 'Start Learning' : 'Continue Learning'}
                    <ChevronRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* More Courses to Explore */}
        {otherCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">More Courses to Explore</h3>
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                View all
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherCourses.slice(0, 3).map((course) => {
                const totalLessons = course.nodes.length;
                const completedLessons = course.nodes.filter(n => n.status === 'completed').length;

                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all cursor-pointer group"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white opacity-80" />
                    </div>
                    <div className="p-5">
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded mb-2">
                        {course.category}
                      </span>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} />
                          {totalLessons} lessons
                        </span>
                        {completedLessons > 0 && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle size={14} />
                            {completedLessons} done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
