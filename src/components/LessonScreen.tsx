import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  FileText,
  Download,
  MessageSquare,
} from 'lucide-react';

type TabType = 'overview' | 'resources' | 'notes';

export const LessonScreen = () => {
  const { courseId, nodeId } = useParams();
  const navigate = useNavigate();
  const { courses, updateNodeStatus } = useLearningStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const course = courses.find(c => c.id === courseId);
  const node = course?.nodes.find(n => n.id === nodeId);
  const currentIndex = course?.nodes.findIndex(n => n.id === nodeId) ?? -1;
  const previousNode = currentIndex > 0 ? course?.nodes[currentIndex - 1] : null;
  const nextNode =
    currentIndex >= 0 && course ? course.nodes[currentIndex + 1] : null;

  if (!course || !node) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Lesson not found
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Course</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <div className="text-white text-center">
                  <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-sm text-gray-300">Video Player</p>
                </div>
              </div>
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {node.title}
                  </h1>
                  <p className="text-gray-600">{node.description}</p>
                </div>
                {node.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600 ml-4">
                    <CheckCircle size={20} fill="currentColor" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{node.estimatedMinutes} minutes</span>
                </div>
                <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {node.type}
                </div>
                <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {node.difficulty}
                </div>
              </div>

              {/* Progress */}
              {node.status !== 'completed' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Lesson Progress
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {node.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Mark as Complete
                </button>
              )}
            </div>

            {/* Tabs Content */}
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'resources'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Resources
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'notes'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Notes
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      What you'll learn
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>Core concepts and fundamentals</li>
                      <li>Practical applications and examples</li>
                      <li>Best practices and common patterns</li>
                      <li>Hands-on exercises</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'resources' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          Lesson slides.pdf
                        </span>
                      </div>
                      <Download size={16} className="text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          Code examples.zip
                        </span>
                      </div>
                      <Download size={16} className="text-gray-400" />
                    </div>
                  </div>
                )}
                {activeTab === 'notes' && (
                  <div className="text-center py-8">
                    <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No notes yet</p>
                    <button className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline">
                      Add your first note
                    </button>
                  </div>
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
                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <button
                onClick={() => nextNode && handleNavigate(nextNode.id)}
                disabled={!nextNode}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  nextNode
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
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
                          ? 'bg-gray-100 border border-gray-300'
                          : isLocked
                          ? 'bg-gray-50 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 mt-0.5 ${
                            isCompleted
                              ? 'text-green-600'
                              : isActive
                              ? 'text-blue-600'
                              : 'text-gray-300'
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
                                ? 'text-gray-900'
                                : isLocked
                                ? 'text-gray-400'
                                : 'text-gray-700'
                            }`}
                          >
                            {index + 1}. {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
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
