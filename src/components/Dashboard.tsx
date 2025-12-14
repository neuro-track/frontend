import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfileStore } from '../store/useUserProfileStore';
import { Navbar } from './Navbar';
import {
  BookOpen,
  TrendingUp,
  MessageSquare,
  Map,
  Star,
  ChevronRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { courses, roadmap, loadRoadmap } = useLearningStore();
  const { user } = useAuthStore();
  const { profile, initializeProfile } = useUserProfileStore();

  // Initialize user profile on mount
  useEffect(() => {
    if (user?.id) {
      initializeProfile(user.id);
    }
  }, [user?.id, initializeProfile]);

  // Load roadmap on mount (always reload to get latest data structure)
  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  // Memoized calculations to prevent unnecessary re-computation
  const { completedNodes, totalXP, currentLevel } = useMemo(() => {
    const completed = roadmap
      ? roadmap.completedNodes
      : courses.reduce(
          (sum, c) => sum + c.nodes.filter(n => n.status === 'completed').length,
          0
        );
    const xp = completed * 100;
    const level = Math.floor(xp / 500) + 1;

    return { completedNodes: completed, totalXP: xp, currentLevel: level };
  }, [roadmap, courses]);

  // Get other available courses (excluding first 2 shown in recommended)
  const otherCourses = useMemo(() => courses.slice(2), [courses]);

  // Detect if user has generated roadmap
  const hasGeneratedRoadmap = useMemo(
    () => roadmap && roadmap.id.startsWith('generated-roadmap-'),
    [roadmap]
  );
  const hasNoRoadmap = !hasGeneratedRoadmap;

  const streakDays = 7;

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
                Bem-vindo de volta, {user?.name?.split(' ')[0]}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Pronto para continuar sua jornada de aprendizado?
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('/learn')}
                  className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <Map size={18} />
                  Ver Mapa de Aprendizado
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <MessageSquare size={18} />
                  Assistente IA
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <BookOpen size={18} />
                  Explorar Cursos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Nível Atual</p>
              <TrendingUp size={18} className="text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{currentLevel}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-1">
                <span>Progresso para Nível {currentLevel + 1}</span>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">XP Total</p>
              <Star size={18} className="text-yellow-500 dark:text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalXP}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {completedNodes} lições concluídas
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Sequência</p>
              <TrendingUp size={18} className="text-orange-500 dark:text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{streakDays} dias</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Continue aprendendo para manter sua sequência
            </p>
          </div>
        </div>

        {/* AI-Generated Roadmap Badge */}
        {roadmap && roadmap.id.startsWith('generated-roadmap-') && profile.lastRoadmapGeneration && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-400">
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Roadmap Personalizado por IA
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerado em {new Date(profile.lastRoadmapGeneration).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA to Create Personalized Plan - Show when no generated roadmap */}
        {hasNoRoadmap && (
          <div className="mb-6 p-6 bg-white dark:bg-gray-900 border-l-4 border-blue-600 dark:border-blue-400">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Sparkles size={32} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Crie Seu Plano de Estudos Personalizado
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Nossa IA pode criar um roadmap completo adaptado aos seus objetivos,
                  nível de conhecimento e tempo disponível. Leva apenas alguns minutos!
                </p>
                <button
                  onClick={() => navigate('/chat')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Conversar com IA e Criar Plano
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                  Enquanto isso, você pode explorar nossos cursos padrão abaixo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Summary or Recommended Courses */}
        {roadmap ? (
          <div className="mb-8">
            {/* Roadmap Summary Card */}
            <div
              onClick={() => navigate('/learn')}
              className="bg-blue-600 rounded-xl p-8 text-white cursor-pointer hover:bg-blue-700 transition-colors group"
            >
              <div className="mb-4">
                <h2 className="text-3xl font-bold mb-2">{roadmap.title}</h2>
                <p className="text-blue-100">{roadmap.description}</p>
              </div>
              <div className="flex items-center gap-6 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{roadmap.completedNodes} de {roadmap.totalNodes} lições concluídas</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  <span>{Math.round((roadmap.completedNodes / roadmap.totalNodes) * 100)}% completo</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/90 group-hover:text-white group-hover:gap-3 transition-all">
                <span className="font-medium">Ver Mapa Completo</span>
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recomendado para Você</h3>
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
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group"
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
                          <span>{totalCount} lições</span>
                          <span>{Math.round(totalMinutes / 60)}h {totalMinutes % 60}min</span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progresso</span>
                        <span className="font-semibold">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-gray-900 dark:text-white font-medium group-hover:gap-3 transition-all">
                      {completedCount === 0 ? 'Começar a Aprender' : 'Continuar Aprendendo'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mais Cursos para Explorar */}
        {otherCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mais Cursos para Explorar</h3>
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Ver todos
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
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group"
                  >
                    <div className="aspect-video bg-blue-600 flex items-center justify-center">
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
                          {totalLessons} lições
                        </span>
                        {completedLessons > 0 && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle size={14} />
                            {completedLessons} feitas
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
