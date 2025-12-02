import { useAuthStore } from '../store/useAuthStore';
import { useLearningStore } from '../store/useLearningStore';
import { getMockAchievements } from '../data/mockData';
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Trophy,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { Card } from './Card';

export const ProfileScreen = () => {
  const { user } = useAuthStore();
  const { courses } = useLearningStore();
  const achievements = getMockAchievements();

  const totalNodes = courses.reduce((sum, c) => sum + c.nodes.length, 0);
  const completedNodes = courses.reduce(
    (sum, c) => sum + c.nodes.filter(n => n.status === 'completed').length,
    0
  );
  const totalMinutes = courses.reduce(
    (sum, c) =>
      sum +
      c.nodes
        .filter(n => n.status === 'completed')
        .reduce((s, n) => s + n.estimatedMinutes, 0),
    0
  );

  const recentActivities = courses
    .flatMap(c =>
      c.nodes
        .filter(n => n.status === 'in-progress' || n.status === 'completed')
        .map(n => ({
          ...n,
          course: c,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        }))
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  const unlockedAchievements = achievements.filter(
    a => a.progress >= a.total
  ).length;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={user?.name || 'Profile'}
          description={user?.email}
          backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
          actions={
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Edit Profile
            </button>
          }
          stats={[
            {
              label: 'Completion',
              value: `${Math.round((completedNodes / totalNodes) * 100)}%`,
            },
            {
              label: 'Completed',
              value: completedNodes,
            },
            {
              label: 'Time Spent',
              value: `${Math.round(totalMinutes / 60)}h`,
            },
            {
              label: 'Achievements',
              value: unlockedAchievements,
            },
          ]}
        />

        {/* Profile Info Card */}
        <Card>
          <div className="flex items-center gap-6">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-700"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{user?.email}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    Joined {user?.joinedAt ? format(user.joinedAt, 'MMMM yyyy') : 'Recently'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={16} />
                  <span>Level {Math.floor(completedNodes / 5) + 1}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Target size={24} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((completedNodes / totalNodes) * 100)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedNodes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(totalMinutes / 60)}h
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Trophy size={24} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {unlockedAchievements}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {activity.status === 'completed' ? (
                          <CheckCircle size={20} />
                        ) : (
                          <BookOpen size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          {activity.status === 'completed' ? 'Completed' : 'Started'}{' '}
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.course.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {format(activity.timestamp, 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Achievements */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Achievements
              </h2>
              <div className="space-y-4">
                {achievements.map(achievement => {
                  const isUnlocked = achievement.progress >= achievement.total;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isUnlocked
                          ? 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`text-3xl ${
                            isUnlocked ? 'grayscale-0' : 'grayscale opacity-50'
                          }`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-medium mb-1 ${
                              isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'
                            }`}
                          >
                            {achievement.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isUnlocked ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'
                            }`}
                            style={{
                              width: `${
                                (achievement.progress / achievement.total) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Course Progress */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Course Progress
              </h2>
              <div className="space-y-4">
                {courses.map(course => {
                  const progress = course.nodes.filter(
                    n => n.status === 'completed'
                  ).length;
                  const total = course.nodes.length;
                  const percentage = Math.round((progress / total) * 100);

                  return (
                    <div key={course.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {course.title}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {progress}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
