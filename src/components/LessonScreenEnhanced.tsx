import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { Navbar } from './Navbar';
import { VideoList } from './VideoPlayer';
import { WikipediaContent } from './WikipediaContent';
import { NotesPanel } from './NotesPanel';
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
} from 'lucide-react';

type TabType = 'videos' | 'article' | 'notes';

export const LessonScreenEnhanced = () => {
  const { courseId, nodeId } = useParams();
  const navigate = useNavigate();
  const { courses, updateNodeStatus } = useLearningStore();
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);
  const node = course?.nodes.find(n => n.id === nodeId);
  const currentIndex = course?.nodes.findIndex(n => n.id === nodeId) ?? -1;
  const previousNode = currentIndex > 0 ? course?.nodes[currentIndex - 1] : null;
  const nextNode =
    currentIndex >= 0 && course ? course.nodes[currentIndex + 1] : null;

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

  if (!course || !node) {
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

  const handleComplete = () => {
    updateNodeStatus(courseId!, nodeId!, 'completed', 100);
    if (nextNode) {
      updateNodeStatus(courseId!, nextNode.id, 'available', 0);
    }
  };

  const handleNavigate = (targetNodeId: string) => {
    navigate(`/lesson/${courseId}/${targetNodeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breadcrumb */}
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Voltar ao Curso</span>
            </button>

            {/* Lesson Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {node.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">{node.description}</p>
                </div>
                {node.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 ml-4">
                    <CheckCircle size={20} fill="currentColor" />
                    <span className="text-sm font-medium">Completo</span>
                  </div>
                )}
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

              {/* Complete Button */}
              {node.status !== 'completed' && (
                <button
                  onClick={handleComplete}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
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

                    {activeTab === 'notes' && (
                      <NotesPanel nodeId={nodeId!} courseId={courseId!} />
                    )}
                  </>
                )}
              </div>
            </div>

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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Conteúdo do Curso</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {course.nodes.map((n, index) => {
                  const isActive = n.id === nodeId;
                  const isCompleted = n.status === 'completed';
                  const isLocked = n.status === 'locked';

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
