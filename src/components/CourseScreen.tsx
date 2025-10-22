import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { RoadmapGraph } from './RoadmapGraph';
import { LearningNode } from '../types';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Users,
  Star,
  Play,
  CheckCircle,
  Lock,
  LayoutList,
  Network,
  X,
} from 'lucide-react';

type ViewMode = 'linear' | 'roadmap';

export const CourseScreen = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses } = useLearningStore();
  const [viewMode, setViewMode] = useState<ViewMode>('linear');
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);

  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Course not found
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completedCount = course.nodes.filter(
    n => n.status === 'completed'
  ).length;
  const totalCount = course.nodes.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  const groupedNodes = course.nodes.reduce((acc, node) => {
    const module = `Module ${Math.floor(course.nodes.indexOf(node) / 3) + 1}`;
    if (!acc[module]) acc[module] = [];
    acc[module].push(node);
    return acc;
  }, {} as Record<string, typeof course.nodes>);

  const handleStartLesson = (nodeId: string) => {
    navigate(`/lesson/${courseId}/${nodeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Course Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Image */}
            <div className="lg:col-span-1">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-6xl">{course.icon}</div>
              </div>
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  Beginner
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {course.title}
              </h1>
              <p className="text-gray-600 text-lg mb-6">{course.description}</p>

              {/* Meta Info */}
              <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>
                    {Math.round(
                      course.nodes.reduce((sum, n) => sum + n.estimatedMinutes, 0) /
                        60
                    )}
                    h total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  <span>{totalCount} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>1,234 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={18} fill="currentColor" />
                  <span>4.8 (250 reviews)</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Your Progress
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const nextNode = course.nodes.find(
                      n => n.status === 'available' || n.status === 'in-progress'
                    );
                    if (nextNode) handleStartLesson(nextNode.id);
                  }}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  {completedCount === 0 ? 'Start Course' : 'Continue Learning'}
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Course Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('linear')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'linear'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutList size={16} />
              Linear
            </button>
            <button
              onClick={() => setViewMode('roadmap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'roadmap'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Network size={16} />
              Roadmap
            </button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'linear' ? (
          <div className="space-y-6">
            {Object.entries(groupedNodes).map(([module, nodes]) => (
              <div key={module} className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {module}
                </h3>
                <div className="space-y-3">
                  {nodes.map((node, nodeIndex) => {
                    const isLocked = node.status === 'locked';
                    const isCompleted = node.status === 'completed';
                    const isInProgress = node.status === 'in-progress';

                    return (
                      <div
                        key={node.id}
                        className="relative"
                      >
                        {/* Timeline Connector */}
                        {nodeIndex < nodes.length - 1 && (
                          <div
                            className="absolute left-[19px] top-12 w-0.5 h-8 bg-gray-200"
                          />
                        )}

                        <button
                          onClick={() =>
                            !isLocked && handleStartLesson(node.id)
                          }
                          disabled={isLocked}
                          className={`w-full text-left flex items-start gap-4 p-4 rounded-lg border transition-all ${
                            isLocked
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
                          }`}
                        >
                          {/* Status Icon */}
                          <div
                            className={`flex-shrink-0 mt-1 ${
                              isCompleted
                                ? 'text-green-600'
                                : isInProgress
                                ? 'text-blue-600'
                                : isLocked
                                ? 'text-gray-300'
                                : 'text-gray-400'
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
                                isLocked ? 'text-gray-400' : 'text-gray-900'
                              }`}
                            >
                              {node.title}
                            </h4>
                            <p
                              className={`text-sm mb-2 ${
                                isLocked ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {node.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <span
                                className={`${
                                  isLocked ? 'text-gray-400' : 'text-gray-500'
                                }`}
                              >
                                {node.estimatedMinutes} min
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  isLocked
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {node.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  isLocked
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {node.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Progress Indicator */}
                          {isInProgress && node.progress > 0 && (
                            <div className="flex-shrink-0 text-sm text-gray-600">
                              {node.progress}%
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative h-[800px]">
            <RoadmapGraph
              nodes={course.nodes}
              onNodeClick={setSelectedNode}
              selectedNodeId={selectedNode?.id}
            />

            {/* Node details panel */}
            {selectedNode && (
              <div className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {course.title}
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
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {selectedNode.type}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {selectedNode.difficulty}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="font-semibold text-gray-900">
                          {selectedNode.estimatedMinutes} min
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {selectedNode.status === 'in-progress' ? 'In Progress' : selectedNode.status}
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
                            const prereq = course.nodes.find(n => n.id === prereqId);
                            return prereq ? (
                              <div
                                key={prereqId}
                                className="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    prereq.status === 'completed'
                                      ? 'bg-green-600'
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
                        onClick={() => !selectedNode.status.includes('locked') && handleStartLesson(selectedNode.id)}
                        disabled={selectedNode.status === 'locked'}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          selectedNode.status === 'locked'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {selectedNode.status === 'completed'
                          ? 'Review Lesson'
                          : selectedNode.status === 'locked'
                          ? 'Locked'
                          : 'Start Lesson'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
