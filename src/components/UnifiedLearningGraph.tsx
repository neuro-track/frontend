import { useState } from 'react';
import { useLearningStore } from '../store/useLearningStore';
import { RoadmapGraph } from './RoadmapGraph';
import { LearningNode } from '../types';
import { X, Award, Clock, BookOpen } from 'lucide-react';

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Learning Journey
          </h1>
          <p className="text-gray-600">
            Navigate through your personalized learning paths
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Award size={24} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completionPercentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={24} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedNodes}/{totalNodes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inProgressNodes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Est.</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(totalMinutes / 60)}h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course filters */}
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Filter by course:
            </p>
            <div className="flex flex-wrap gap-2">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => toggleCourse(course.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCourses.includes(course.id)
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {course.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 relative overflow-hidden">
        <RoadmapGraph
          nodes={positionedNodes}
          onNodeClick={setSelectedNode}
          selectedNodeId={selectedNode?.id}
        />
      </div>

      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {courses.find(c => c.id === selectedNode.courseId)?.title}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedNode.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {selectedNode.type}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {selectedNode.difficulty}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {selectedNode.estimatedMinutes} min
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {selectedNode.status}
                  </p>
                </div>
              </div>

              {selectedNode.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Prerequisites
                  </h3>
                  <div className="space-y-2">
                    {selectedNode.prerequisites.map(prereqId => {
                      const prereq = allNodes.find(n => n.id === prereqId);
                      return prereq ? (
                        <div
                          key={prereqId}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              prereq.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-gray-300'
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
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
                    <h3 className="text-sm font-semibold text-gray-700">Progress</h3>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedNode.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gray-900"
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
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
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
