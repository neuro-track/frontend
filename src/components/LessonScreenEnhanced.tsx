import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Navbar } from './Navbar';
import { VideoList } from './VideoPlayer';
import { WikipediaContent } from './WikipediaContent';
import { NotesPanel } from './NotesPanel';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import { Task } from '../types';
import { contentGeneratorService, LessonContent } from '../services/contentGeneratorService';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  FileText,
  AlertCircle,
  Loader,
  Sparkles,
  Star,
  Code,
} from 'lucide-react';

type TabType = 'videos' | 'article' | 'exercises' | 'notes';

export const LessonScreenEnhanced = () => {
  const { courseId, nodeId } = useParams();
  const navigate = useNavigate();
  const { courses, roadmap, updateNodeStatus, unlockDependentNodes, completeTask } = useLearningStore();
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Check roadmap first, then fall back to courses
  const isRoadmap = roadmap && courseId === roadmap.id;
  const course = isRoadmap ? null : courses.find(c => c.id === courseId);
  const node = isRoadmap
    ? roadmap!.nodes.find(n => n.id === nodeId)
    : course?.nodes.find(n => n.id === nodeId);

  // Navigation: use roadmap nodes or course nodes
  const allNodes = isRoadmap ? roadmap!.nodes : (course?.nodes || []);
  const currentIndex = allNodes.findIndex(n => n.id === nodeId) ?? -1;
  const previousNode = currentIndex > 0 ? allNodes[currentIndex - 1] : null;
  const nextNode = currentIndex >= 0 ? allNodes[currentIndex + 1] : null;

  // Calculate course/roadmap progress
  const completedNodes = allNodes.filter(n => n.status === 'completed').length || 0;
  const totalNodes = allNodes.length || 0;
  const courseProgress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  // Check if lesson is favorited
  const isFavorited = favorites.some(
    fav => fav.resourceId === nodeId && fav.resourceType === 'node'
  );

  const handleToggleFavorite = () => {
    if (!user || !nodeId) return;

    if (isFavorited) {
      const favorite = favorites.find(
        fav => fav.resourceId === nodeId && fav.resourceType === 'node'
      );
      if (favorite) {
        removeFavorite(favorite.id);
        addNotification({
          userId: user.id,
          type: 'milestone',
          title: 'Removido dos Favoritos',
          message: `"${node?.title}" foi removido dos favoritos`,
          icon: '⭐',
        });
      }
    } else {
      addFavorite(nodeId, 'node', user.id);
      addNotification({
        userId: user.id,
        type: 'milestone',
        title: 'Adicionado aos Favoritos',
        message: `"${node?.title}" foi adicionado aos favoritos`,
        icon: '⭐',
      });
    }
  };

  useEffect(() => {
    if (node) {
      loadLessonContent();
    }
  }, [node?.id]);

  const loadLessonContent = async () => {
    if (!node) return;

    setIsLoading(true);
    setError(null);

    try {
      const content = await contentGeneratorService.generateLessonContent(node.title, {
        maxVideos: 3,
        videoDuration: 'medium',
        language: 'pt',
      });
      setLessonContent(content);
    } catch (err) {
      console.error('Error loading lesson content:', err);
      setError('Erro ao carregar conteúdo da lição. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!node) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Lição não encontrada
            </h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    // Mark current node as completed
    updateNodeStatus(courseId!, nodeId!, 'completed', 100);

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    // Celebration confetti animation (lazy loaded)
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Send completion notification
    if (user) {
      addNotification({
        userId: user.id,
        type: 'achievement',
        title: 'Lição Completa!',
        message: `Você completou "${node?.title}"`,
        icon: '✅',
      });
    }

    // Check which nodes were unlocked (this is now automatic in updateNodeStatus)
    const unlockedNodeIds = unlockDependentNodes(courseId!, nodeId!);

    // Send notifications for each unlocked node with extra confetti
    if (user && unlockedNodeIds.length > 0) {
      // Extra confetti for unlocking new lessons (uses confetti from above)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);

      unlockedNodeIds.forEach(unlockedNodeId => {
        const unlockedNode = allNodes.find(n => n.id === unlockedNodeId);
        if (unlockedNode) {
          addNotification({
            userId: user.id,
            type: 'milestone',
            title: 'Nova Lição Desbloqueada!',
            message: `"${unlockedNode.title}" agora está disponível`,
            icon: '🔓',
            link: `/lesson/${courseId}/${unlockedNodeId}`,
          });
        }
      });
    }
  };

  const handleNavigate = (targetNodeId: string) => {
    navigate(`/lesson/${courseId}/${targetNodeId}`);
  };

  const handleTaskComplete = async (task: Task, submission?: string, score?: number) => {
    // Call the store method to complete the task
    if (nodeId) {
      completeTask(nodeId, task.id, submission, score);
    }

    // Close modal
    setSelectedTask(null);

    // Show celebration (lazy loaded)
    if (user) {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      addNotification({
        userId: user.id,
        type: 'achievement',
        title: 'Tarefa Completa!',
        message: `Você completou "${task.title}"${score !== undefined ? ` com ${score}% de acerto` : ''}`,
        icon: '✅',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breadcrumb and Course Progress */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Voltar ao Curso</span>
              </button>

              {/* Course Progress Bar */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progresso do Curso
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {completedNodes} de {totalNodes} lições
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {courseProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Lesson Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {node.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">{node.description}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-lg transition-all ${
                      isFavorited
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <Star size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                  {/* Completion Badge */}
                  {node.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={20} fill="currentColor" />
                      <span className="text-sm font-medium">Completo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{node.estimatedMinutes} minutos</span>
                </div>
                {lessonContent && (
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>{lessonContent.estimatedReadingTime} min de leitura</span>
                  </div>
                )}
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                  {node.type}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  node.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  node.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {node.difficulty}
                </div>
              </div>

              {/* Progress */}
              {node.status !== 'completed' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progresso da Lição
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {node.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${node.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-400 rounded-lg flex items-center gap-3 animate-pulse">
                  <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Parabéns!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Você completou esta lição com sucesso!
                    </p>
                  </div>
                </div>
              )}

              {/* Complete Button */}
              {node.status !== 'completed' && (
                <button
                  onClick={handleComplete}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <CheckCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Marcar como Completo
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Tab Headers */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'videos'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Vídeos ({lessonContent?.videos.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('article')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'article'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Artigo
                  </button>
                  <button
                    onClick={() => setActiveTab('exercises')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === 'exercises'
                        ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Code size={16} />
                    Exercícios ({node?.tasks?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'notes'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Anotações
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando conteúdo...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                ) : (
                  <>
                    {activeTab === 'videos' && lessonContent && (
                      <VideoList videos={lessonContent.videos} nodeId={nodeId} />
                    )}

                    {activeTab === 'article' && lessonContent?.article && (
                      <WikipediaContent
                        article={lessonContent.article}
                        relatedTopics={lessonContent.relatedTopics || []}
                      />
                    )}

                    {activeTab === 'exercises' && (
                      <TaskList
                        tasks={node?.tasks || []}
                        onTaskClick={setSelectedTask}
                      />
                    )}

                    {activeTab === 'notes' && (
                      <NotesPanel nodeId={nodeId!} courseId={courseId!} />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Task Modal */}
            {selectedTask && (
              <TaskModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onComplete={handleTaskComplete}
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => previousNode && handleNavigate(previousNode.id)}
                disabled={!previousNode}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  previousNode
                    ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    : 'border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={20} />
                Anterior
              </button>
              <button
                onClick={() => nextNode && handleNavigate(nextNode.id)}
                disabled={!nextNode}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  nextNode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                Próximo
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {isRoadmap ? 'Conteúdo do Roadmap' : 'Conteúdo do Curso'}
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {allNodes.map((n, index) => {
                  const isActive = n.id === nodeId;
                  const isCompleted = n.status === 'completed';
                  const isLocked = n.status === 'available' && false;

                  return (
                    <button
                      key={n.id}
                      onClick={() => !isLocked && handleNavigate(n.id)}
                      disabled={isLocked}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                          : isLocked
                          ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 mt-0.5 ${
                            isCompleted
                              ? 'text-green-600 dark:text-green-400'
                              : isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle size={16} fill="currentColor" />
                          ) : (
                            <div className="w-4 h-4 border-2 rounded-full border-current" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isActive
                                ? 'text-gray-900 dark:text-white'
                                : isLocked
                                ? 'text-gray-400 dark:text-gray-600'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {index + 1}. {n.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {n.estimatedMinutes} min
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
