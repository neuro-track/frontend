import { useState } from 'react';
import { useLearningStore } from '../store/useLearningStore';
import { RoadmapGraph } from './RoadmapGraph';
import { LearningNode } from '../types';
import { X } from 'lucide-react';
import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { Card } from './Card';

export const UnifiedLearningGraph = () => {
  const { courses, getUnifiedGraph } = useLearningStore();
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    courses.map(c => c.id)
  );

  // Get all nodes from selected courses
  const allNodes = getUnifiedGraph().filter(node =>
    selectedCourses.includes(node.courseId)
  );

  // Calculate positions for unified graph
  const layoutNodes = (): LearningNode[] => {
    const courseGroups: Record<string, LearningNode[]> = {};

    // Group nodes by course
    allNodes.forEach(node => {
      if (!courseGroups[node.courseId]) {
        courseGroups[node.courseId] = [];
      }
      courseGroups[node.courseId].push(node);
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <PageContainer maxWidth="full">
        <div className="space-y-6">
          <PageHeader
            title="Your Learning Journey"
            description="Navigate through your personalized learning paths"
            backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
            stats={[
              {
                label: 'Progress',
                value: `${completionPercentage}%`,
              },
              {
                label: 'Completed',
                value: `${completedNodes}/${totalNodes}`,
              },
              {
                label: 'In Progress',
                value: inProgressNodes,
              },
              {
                label: 'Time Est.',
                value: `${Math.round(totalMinutes / 60)}h`,
              },
            ]}
          />

          {/* Course filters */}
          <Card>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Filter by course:
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

          {/* Graph */}
          <Card padding="none" className="h-[600px] relative overflow-hidden">
            <RoadmapGraph
              nodes={positionedNodes}
              onNodeClick={setSelectedNode}
              selectedNodeId={selectedNode?.id}
            />
          </Card>
        </div>
      </PageContainer>

      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {courses.find(c => c.id === selectedNode.courseId)?.title}
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
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNode.type}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Difficulty</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNode.difficulty}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedNode.estimatedMinutes} min
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNode.status}
                  </p>
                </div>
              </div>

              {selectedNode.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Prerequisites
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
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</h3>
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
                  disabled={selectedNode.status === 'locked'}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    selectedNode.status === 'locked'
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedNode.status === 'completed'
                    ? 'Review'
                    : selectedNode.status === 'locked'
                    ? 'Locked'
                    : 'Start Learning'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
