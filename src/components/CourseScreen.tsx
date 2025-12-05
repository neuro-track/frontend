import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useAuthStore } from '../store/useAuthStore';
import { RoadmapGraphFlow } from './RoadmapGraphFlow';
import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { Card } from './Card';
import { LearningNode } from '../types';
import {
  Clock,
  Play,
  CheckCircle,
  Lock,
  LayoutList,
  Network,
  X,
  Star,
} from 'lucide-react';

type ViewMode = 'linear' | 'roadmap';

export const CourseScreen = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, roadmap, loadRoadmap } = useLearningStore();
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('linear');
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);

  // Load roadmap if not loaded
  useEffect(() => {
    if (!roadmap) {
      loadRoadmap();
    }
  }, [roadmap, loadRoadmap]);

  // Try to find roadmap first, then fall back to courses
  const isRoadmap = roadmap && courseId === roadmap.id;
  const course = isRoadmap ? null : courses.find(c => c.id === courseId);

  // If it's a roadmap, use roadmap data
  const title = isRoadmap ? roadmap!.title : course?.title;
  const description = isRoadmap ? roadmap!.description : course?.description;
  const nodes = isRoadmap ? roadmap!.nodes : course?.nodes || [];

  if (!isRoadmap && !course) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="text-center max-w-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Curso não encontrado
            </h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Voltar ao Dashboard
            </button>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const completedCount = nodes.filter(n => n.status === 'completed').length;
  const totalCount = nodes.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  const totalMinutes = nodes.reduce((sum, n) => sum + n.estimatedMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const groupedNodes = nodes.reduce((acc, node) => {
    const module = `Módulo ${Math.floor(nodes.indexOf(node) / 3) + 1}`;
    if (!acc[module]) acc[module] = [];
    acc[module].push(node);
    return acc;
  }, {} as Record<string, LearningNode[]>);

  // Check if course is favorited
  const isFavorited = favorites.some(
    fav => fav.resourceId === courseId && fav.resourceType === 'course'
  );

  const handleToggleFavorite = () => {
    if (!user || !courseId) return;

    if (isFavorited) {
      const favorite = favorites.find(
        fav => fav.resourceId === courseId && fav.resourceType === 'course'
      );
      if (favorite) {
        removeFavorite(favorite.id);
      }
    } else {
      addFavorite(courseId, 'course', user.id);
    }
  };

  const handleStartLesson = (nodeId: string) => {
    navigate(`/lesson/${courseId}/${nodeId}`);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title={title || 'Roadmap'}
          description={description || ''}
          backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
          actions={
            <button
              onClick={handleToggleFavorite}
              className={`p-3 rounded-lg transition-all ${
                isFavorited
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star size={20} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          }
          stats={[
            { label: 'Progresso', value: `${progressPercentage}%` },
            { label: 'Completas', value: `${completedCount}/${totalCount}` },
            { label: 'Duração', value: `${totalHours}h ${remainingMinutes}min` },
            ...(isRoadmap ? [] : [{ label: 'Categoria', value: course?.category || '' }]),
          ]}
        />

        {/* Progress Bar */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progresso do Curso
            </span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </Card>

        {/* Action Button */}
        <Card>
          <button
            onClick={() => {
              const nextNode = nodes.find(
                n => n.status === 'available' || n.status === 'in-progress'
              );
              if (nextNode) handleStartLesson(nextNode.id);
            }}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Play size={20} />
            {completedCount === 0 ? (isRoadmap ? 'Iniciar Roadmap' : 'Iniciar Curso') : 'Continuar Aprendendo'}
          </button>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conteúdo do Curso</h2>
          <div className="flex items-center gap-3">
            {/* Linear vs Roadmap Toggle */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('linear')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'linear'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutList size={16} />
                Linear
              </button>
              <button
                onClick={() => setViewMode('roadmap')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'roadmap'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Network size={16} />
                Roadmap
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'linear' ? (
          <div className="space-y-6">
            {Object.entries(groupedNodes).map(([module, nodes]) => (
              <Card key={module}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {module}
                </h3>
                <div className="space-y-3">
                  {nodes.map((node, nodeIndex) => {
                    const isLocked = node.status === 'available' && false;
                    const isCompleted = node.status === 'completed';
                    const isInProgress = node.status === 'in-progress';

                    return (
                      <div key={node.id} className="relative">
                        {/* Timeline Connector */}
                        {nodeIndex < nodes.length - 1 && (
                          <div className="absolute left-[19px] top-12 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                        )}

                        <button
                          onClick={() => !isLocked && handleStartLesson(node.id)}
                          disabled={isLocked}
                          className={`w-full text-left flex items-start gap-4 p-4 rounded-lg border transition-all ${
                            isLocked
                              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md cursor-pointer'
                          }`}
                        >
                          {/* Status Icon */}
                          <div
                            className={`flex-shrink-0 mt-1 ${
                              isCompleted
                                ? 'text-green-600 dark:text-green-400'
                                : isInProgress
                                ? 'text-blue-600 dark:text-blue-400'
                                : isLocked
                                ? 'text-gray-300 dark:text-gray-600'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle size={20} fill="currentColor" />
                            ) : isLocked ? (
                              <Lock size={20} />
                            ) : (
                              <Play size={20} />
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1">
                            <h4
                              className={`font-medium mb-1 ${
                                isLocked
                                  ? 'text-gray-400 dark:text-gray-600'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {node.title}
                            </h4>
                            <p
                              className={`text-sm mb-2 ${
                                isLocked
                                  ? 'text-gray-400 dark:text-gray-600'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {node.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <span
                                className={`flex items-center gap-1 ${
                                  isLocked
                                    ? 'text-gray-400 dark:text-gray-600'
                                    : 'text-gray-500 dark:text-gray-500'
                                }`}
                              >
                                <Clock size={12} />
                                {node.estimatedMinutes} min
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  isLocked
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                }`}
                              >
                                {node.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  isLocked
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                                    : node.difficulty === 'beginner'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : node.difficulty === 'intermediate'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                }`}
                              >
                                {node.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Progress Indicator */}
                          {isInProgress && node.progress > 0 && (
                            <div className="flex-shrink-0 text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {node.progress}%
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="relative h-[800px]">
            <RoadmapGraphFlow
              nodes={nodes}
              onNodeClick={setSelectedNode}
              selectedNodeId={selectedNode?.id}
            />

            {/* Node details panel */}
            {selectedNode && (
              <div className="absolute right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {title}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedNode.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {selectedNode.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card padding="sm">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Tipo</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {selectedNode.type}
                        </p>
                      </Card>
                      <Card padding="sm">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Dificuldade</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {selectedNode.difficulty}
                        </p>
                      </Card>
                      <Card padding="sm">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Duração</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedNode.estimatedMinutes} min
                        </p>
                      </Card>
                      <Card padding="sm">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Status</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {selectedNode.status === 'in-progress' ? 'Em Progresso' :
                           selectedNode.status === 'available' && false ? 'Bloqueado' :
                           selectedNode.status === 'completed' ? 'Completo' : 'Disponível'}
                        </p>
                      </Card>
                    </div>

                    {selectedNode.prerequisites.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Pré-requisitos
                        </h3>
                        <div className="space-y-2">
                          {selectedNode.prerequisites.map(prereqId => {
                            const prereq = nodes.find(n => n.id === prereqId);
                            return prereq ? (
                              <div
                                key={prereqId}
                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    prereq.status === 'completed'
                                      ? 'bg-green-600 dark:bg-green-400'
                                      : 'bg-gray-300 dark:bg-gray-600'
                                  }`}
                                />
                                {prereq.title}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {selectedNode.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedNode.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedNode.progress > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progresso</h3>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedNode.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${selectedNode.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        onClick={() =>
                          !selectedNode.status.includes('never_match_this') &&
                          handleStartLesson(selectedNode.id)
                        }
                        disabled={selectedNode.status === 'available' && false}
                        className={`w-full py-3 rounded-lg font-medium transition-all ${
                          selectedNode.status === 'available' && false
                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                        }`}
                      >
                        {selectedNode.status === 'completed'
                          ? 'Revisar Lição'
                          : selectedNode.status === 'available' && false
                          ? 'Bloqueado'
                          : 'Iniciar Lição'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
