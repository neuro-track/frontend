import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { RoadmapGraphFlow } from './RoadmapGraphFlow';
import { FreeGraphView } from './FreeGraphView';
import { LearningNode } from '../types';
import { X, Map as MapIcon, Network, List } from 'lucide-react';
import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { Card } from './Card';

export const UnifiedLearningGraph = () => {
  const navigate = useNavigate();
  const { courses, roadmap, getUnifiedGraph, loadRoadmap } = useLearningStore();
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);
  const [viewMode, setViewMode] = useState<'linear' | 'free'>('linear');

  // Load roadmap on mount
  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  // If roadmap exists, show ONLY roadmap. Otherwise show legacy courses
  const [selectedCourses, setSelectedCourses] = useState<string[]>(() => {
    if (roadmap) {
      // Only show generated roadmap
      return [roadmap.id];
    } else {
      // Show legacy courses
      return courses.map(c => c.id);
    }
  });

  // Update selectedCourses when roadmap changes
  useEffect(() => {
    if (roadmap) {
      setSelectedCourses([roadmap.id]);
    } else {
      setSelectedCourses(courses.map(c => c.id));
    }
  }, [roadmap, courses]);

  // Get all nodes from selected sources
  const allNodes = getUnifiedGraph().filter(node =>
    node.courseId && selectedCourses.includes(node.courseId)
  );

  console.log('[UnifiedLearningGraph] Debug:', {
    hasRoadmap: !!roadmap,
    coursesCount: courses.length,
    selectedCourses,
    allNodesCount: allNodes.length,
    roadmapNodesCount: roadmap?.nodes?.length || 0
  });

  // Calculate positions for unified graph
  const layoutNodes = (): LearningNode[] => {
    const courseGroups: Record<string, LearningNode[]> = {};

    // Group nodes by course
    allNodes.forEach(node => {
      if (node.courseId) {
        if (!courseGroups[node.courseId]) {
          courseGroups[node.courseId] = [];
        }
        courseGroups[node.courseId].push(node);
      }
    });

    // Layout each course in its own column
    const positionedNodes: LearningNode[] = [];
    let courseIndex = 0;

    Object.entries(courseGroups).forEach(([, nodes]) => {
      const xOffset = courseIndex * 400;

      nodes.forEach((node) => {
        positionedNodes.push({
          ...node,
          position: {
            x: xOffset + node.position.x,
            y: node.position.y,
          },
        });
      });

      courseIndex++;
    });

    return positionedNodes;
  };

  const positionedNodes = layoutNodes();

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Calculate overall stats
  const totalNodes = allNodes.length;
  const completedNodes = allNodes.filter(n => n.status === 'completed').length;
  const inProgressNodes = allNodes.filter(n => n.status === 'in-progress').length;
  const totalMinutes = allNodes.reduce((sum, n) => sum + n.estimatedMinutes, 0);
  const completionPercentage = totalNodes > 0
    ? Math.round((completedNodes / totalNodes) * 100)
    : 0;

  // Show empty state if no nodes
  if (allNodes.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
        <PageContainer maxWidth="full">
          <div className="space-y-6">
            <PageHeader
              title="Sua jornada de aprendizado"
              description="Navegue pelos seus caminhos de aprendizagem personalizados."
              backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
            />
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <MapIcon size={40} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Nenhum roadmap encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Comece criando seu roadmap personalizado conversando com nossa IA. Ela vai criar um caminho de aprendizado sob medida para você!
                </p>
                <button
                  onClick={() => window.location.href = '/chat'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Conversar com IA
                </button>
              </div>
            </Card>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <PageContainer maxWidth="full">
        <div className="space-y-6">
          <PageHeader
            title="Sua jornada de aprendizado"
            description="Navegue pelos seus caminhos de aprendizagem personalizados."
            backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
            stats={[
              {
                label: 'Progresso',
                value: `${completionPercentage}%`,
              },
              {
                label: 'Completado',
                value: `${completedNodes}/${totalNodes}`,
              },
              {
                label: 'Em Progresso',
                value: inProgressNodes,
              },
              {
                label: 'Tempo Estimado',
                value: `${Math.round(totalMinutes / 60)}h`,
              },
            ]}
          />

          {/* View Mode Toggle */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visualização
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {viewMode === 'linear' ? 'Layout linear tradicional' : 'Grafo interativo com física'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('linear')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'linear'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Linear
                </button>
                <button
                  onClick={() => setViewMode('free')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'free'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  Grafo Livre
                </button>
              </div>
            </div>
          </Card>

          {/* Course/Roadmap filters - Only show if no generated roadmap */}
          {!roadmap && courses.length > 0 && (
            <Card>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Filtrar por curso:
              </p>
              <div className="flex flex-wrap gap-2">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCourses.includes(course.id)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Graph - Conditional rendering based on viewMode */}
          {viewMode === 'linear' ? (
            <Card padding="none" className="h-[600px] relative overflow-hidden">
              <RoadmapGraphFlow
                nodes={positionedNodes}
                onNodeClick={setSelectedNode}
                selectedNodeId={selectedNode?.id}
              />
            </Card>
          ) : (
            <FreeGraphView
              nodes={allNodes}
              categories={roadmap?.categories}
              onNodeClick={setSelectedNode}
            />
          )}
        </div>
      </PageContainer>

      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 border-l-2 border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {roadmap && selectedNode.courseId === roadmap.id
                      ? roadmap.title
                      : courses.find(c => c.id === selectedNode.courseId)?.title}
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
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Tipo</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNode.type === 'concept' ? 'Conceito' :
                     selectedNode.type === 'practice' ? 'Prática' :
                     selectedNode.type === 'project' ? 'Projeto' :
                     selectedNode.type === 'assessment' ? 'Avaliação' :
                     selectedNode.type === 'milestone' ? 'Marco' : selectedNode.type}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Dificuldade</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNode.difficulty === 'beginner' ? 'Iniciante' :
                     selectedNode.difficulty === 'intermediate' ? 'Intermediário' :
                     selectedNode.difficulty === 'advanced' ? 'Avançado' :
                     selectedNode.difficulty === 'expert' ? 'Expert' : selectedNode.difficulty}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Duração</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedNode.estimatedMinutes} min
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNode.status === 'available' ? 'Disponível' :
                     selectedNode.status === 'in-progress' ? 'Em Progresso' :
                     selectedNode.status === 'completed' ? 'Concluído' : 'Disponível'}
                  </p>
                </div>
              </div>

              {selectedNode.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pré-requisitos
                  </h3>
                  <div className="space-y-2">
                    {selectedNode.prerequisites.map(prereqId => {
                      const prereq = allNodes.find(n => n.id === prereqId);
                      return prereq ? (
                        <div
                          key={prereqId}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              prereq.status === 'completed'
                                ? 'bg-green-500'
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
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs"
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
                      className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500"
                      style={{ width: `${selectedNode.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => {
                    // Navigate to lesson page: /lesson/:courseId/:nodeId
                    navigate(`/lesson/${selectedNode.courseId}/${selectedNode.id}`);
                  }}
                  className="w-full py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                  {selectedNode.status === 'completed'
                    ? 'Revisar Lição'
                    : selectedNode.status === 'in-progress'
                    ? 'Continuar Aprendendo'
                    : 'Começar a Aprender'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
