import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, LearningNode, UserProgress, Achievement, Roadmap } from '../types';
import { getMockCourses, getMockRoadmap } from '../data/mockData';

interface LearningState {
  // NEW: Roadmap-based architecture
  roadmap: Roadmap | null;

  // LEGACY: Keep for backward compatibility
  courses: Course[];
  currentCourse: Course | null;

  progress: UserProgress[];
  achievements: Achievement[];

  // NEW: Roadmap methods
  loadRoadmap: () => void;
  reloadRoadmap: () => void;
  setRoadmap: (roadmap: Roadmap) => void;
  getCategoryProgress: (categoryId: string) => { completed: number; total: number; percentage: number };
  getNodesByCategory: (categoryId: string) => LearningNode[];

  // UPDATED: Core methods now work with roadmap
  setCourses: (courses: Course[]) => void;
  setCurrentCourse: (courseId: string | null) => void;
  updateNodeProgress: (nodeId: string, progress: number) => void;
  updateNodeStatus: (courseId: string, nodeId: string, status: LearningNode['status'], progress: number) => void;
  unlockDependentNodes: (courseId: string, completedNodeId: string) => string[];
  completeNode: (nodeId: string) => void;
  completeTask: (nodeId: string, taskId: string, submission?: string, score?: number) => void;
  getNodeById: (nodeId: string) => LearningNode | undefined;
  isNodeAvailable: (nodeId: string) => boolean;
  getUnifiedGraph: () => LearningNode[];
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      // NEW: Initialize roadmap
      roadmap: null,

      // LEGACY: Keep old courses for backward compatibility
      courses: getMockCourses(),
      currentCourse: null,
      progress: [],
      achievements: [],

  // NEW: Load roadmap (only loads mock if no roadmap exists)
  loadRoadmap: () => {
    const { roadmap: currentRoadmap } = get();

    // Don't overwrite AI-generated roadmaps with mock data
    if (currentRoadmap && currentRoadmap.id.startsWith('generated-roadmap-')) {
      console.log('[loadRoadmap] Preserving AI-generated roadmap:', currentRoadmap.id);
      return;
    }

    const newRoadmap = getMockRoadmap();

    // If no current roadmap, just set the new one
    if (!currentRoadmap) {
      set({ roadmap: newRoadmap });
      return;
    }

    // Merge: keep user progress but update structure (add tasks if missing)
    const mergedNodes = newRoadmap.nodes.map(newNode => {
      const existingNode = currentRoadmap.nodes.find(n => n.id === newNode.id);

      if (!existingNode) {
        // New node, use as-is
        return newNode;
      }

      // Existing node: keep progress/status, but add tasks if they don't exist
      return {
        ...newNode,
        status: existingNode.status, // Keep user's progress
        progress: existingNode.progress,
        completedAt: existingNode.completedAt,
        actualMinutes: existingNode.actualMinutes,
        tasks: existingNode.tasks || newNode.tasks, // Add tasks if missing
      };
    });

    // Update categories with current progress
    const mergedCategories = newRoadmap.categories.map(category => {
      const existingCategory = currentRoadmap.categories.find(c => c.id === category.id);
      return {
        ...category,
        completedNodes: existingCategory?.completedNodes || category.completedNodes,
      };
    });

    const mergedRoadmap: Roadmap = {
      ...newRoadmap,
      nodes: mergedNodes,
      categories: mergedCategories,
      completedNodes: mergedNodes.filter(n => n.status === 'completed').length,
    };

    set({ roadmap: mergedRoadmap });
  },

  // Force reload roadmap (clears cache)
  reloadRoadmap: () => {
    const roadmap = getMockRoadmap();
    set({ roadmap });
  },

  // Set roadmap directly (used by AI generation)
  setRoadmap: (roadmap) => {
    set({ roadmap });
  },

  // NEW: Get category progress
  getCategoryProgress: (categoryId: string) => {
    const { roadmap } = get();
    if (!roadmap) return { completed: 0, total: 0, percentage: 0 };

    const category = roadmap.categories.find(c => c.id === categoryId);
    if (!category) return { completed: 0, total: 0, percentage: 0 };

    const completed = category.completedNodes;
    const total = category.totalNodes;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  },

  // NEW: Get nodes by category
  getNodesByCategory: (categoryId: string) => {
    const { roadmap } = get();
    if (!roadmap) return [];

    const category = roadmap.categories.find(c => c.id === categoryId);
    if (!category) return [];

    return roadmap.nodes.filter(node =>
      node.categoryIds && node.categoryIds.includes(categoryId)
    );
  },

  setCourses: (courses) => set({ courses }),

  setCurrentCourse: (courseId) => {
    const course = get().courses.find(c => c.id === courseId);
    set({ currentCourse: course || null });
  },

  updateNodeProgress: (nodeId, progress) => {
    const { courses, currentCourse } = get();

    if (!currentCourse) return;

    const updatedCourses = courses.map(course => {
      if (course.id === currentCourse.id) {
        return {
          ...course,
          nodes: course.nodes.map(node =>
            node.id === nodeId
              ? { ...node, progress, status: (progress === 100 ? 'completed' : 'in-progress') as LearningNode['status'] }
              : node
          )
        };
      }
      return course;
    });

    set({ courses: updatedCourses });
    get().setCurrentCourse(currentCourse.id);
  },

  updateNodeStatus: (courseId, nodeId, status, progress) => {
    const { courses, roadmap } = get();

    // Check if this is a roadmap update
    if (roadmap && courseId === roadmap.id) {
      const nodeIndex = roadmap.nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex === -1) return;

      // Create updated nodes array (immutable)
      const updatedNodes = roadmap.nodes.map((n, idx) =>
        idx === nodeIndex
          ? {
              ...n,
              status,
              progress,
              completedAt: status === 'completed' ? new Date().toISOString() : n.completedAt
            }
          : n
      );

      // Update ALL categories this node contributes to
      const updatedCategories = roadmap.categories.map(category => {
        if (category.nodeIds.includes(nodeId)) {
          // Count completed nodes in this category
          const completedInCategory = updatedNodes.filter(n =>
            category.nodeIds.includes(n.id) && n.status === 'completed'
          ).length;

          return {
            ...category,
            completedNodes: completedInCategory
          };
        }
        return category;
      });

      // Update roadmap completed count
      const totalCompleted = updatedNodes.filter(n => n.status === 'completed').length;

      set({
        roadmap: {
          ...roadmap,
          nodes: updatedNodes,
          categories: updatedCategories,
          completedNodes: totalCompleted
        }
      });

      return;
    }

    // LEGACY: Handle course updates
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          nodes: course.nodes.map(node =>
            node.id === nodeId
              ? { ...node, status, progress }
              : node
          )
        };
      }
      return course;
    });

    set({ courses: updatedCourses });

    // If node was just completed, automatically unlock dependent nodes
    if (status === 'completed') {
      get().unlockDependentNodes(courseId, nodeId);
    }
  },

  unlockDependentNodes: (courseId, completedNodeId) => {
    const { courses } = get();
    const course = courses.find(c => c.id === courseId);

    if (!course) return [];

    const unlockedNodes: string[] = [];

    // Find all nodes that have completedNodeId as a prerequisite
    const dependentNodes = course.nodes.filter(node =>
      node.prerequisites.includes(completedNodeId) && node.status === 'available' && false
    );

    // Check each dependent node to see if ALL its prerequisites are now completed
    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          nodes: c.nodes.map(node => {
            // Check if this is a dependent node
            if (dependentNodes.find(dn => dn.id === node.id)) {
              // Check if ALL prerequisites are completed
              const allPrerequisitesCompleted = node.prerequisites.every(prereqId => {
                const prereqNode = c.nodes.find(n => n.id === prereqId);
                return prereqNode?.status === 'completed';
              });

              // Unlock the node if all prerequisites are met
              if (allPrerequisitesCompleted) {
                unlockedNodes.push(node.id);
                return { ...node, status: 'available' as LearningNode['status'] };
              }
            }
            return node;
          })
        };
      }
      return c;
    });

    if (unlockedNodes.length > 0) {
      set({ courses: updatedCourses });
    }

    return unlockedNodes;
  },

  completeNode: (nodeId) => {
    const { roadmap } = get();

    // NEW: Roadmap-based completion (multi-category)
    if (roadmap) {
      const nodeIndex = roadmap.nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex === -1) return;

      // Create updated nodes array (immutable)
      const updatedNodes = roadmap.nodes.map((n, idx) =>
        idx === nodeIndex
          ? { ...n, status: 'completed' as const, progress: 100 }
          : n
      );

      // Update ALL categories this node contributes to
      const updatedCategories = roadmap.categories.map(category => {
        if (category.nodeIds.includes(nodeId)) {
          // Count completed nodes in this category
          const completedInCategory = updatedNodes.filter(n =>
            category.nodeIds.includes(n.id) && n.status === 'completed'
          ).length;

          return {
            ...category,
            completedNodes: completedInCategory
          };
        }
        return category;
      });

      // Update roadmap completed count
      const totalCompleted = updatedNodes.filter(n => n.status === 'completed').length;

      set({
        roadmap: {
          ...roadmap,
          nodes: updatedNodes,
          categories: updatedCategories,
          completedNodes: totalCompleted
        }
      });

      return;
    }

    // LEGACY: Course-based completion
    get().updateNodeProgress(nodeId, 100);
  },

  completeTask: (nodeId, taskId, submission, score) => {
    const { roadmap, courses } = get();

    // Handle roadmap-based tasks
    if (roadmap) {
      const nodeIndex = roadmap.nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex === -1) return;

      const node = roadmap.nodes[nodeIndex];
      if (!node.tasks) return;

      // Update task status
      const updatedTasks = node.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              attempts: task.attempts + 1,
              userSubmission: submission,
              score,
            }
          : task
      );

      // Recalculate node progress based on completed tasks
      const completedTasks = updatedTasks.filter(t => t.status === 'completed').length;
      const totalTasks = updatedTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const nodeStatus = progress === 100 ? 'completed' as const : 'in-progress' as const;

      // Update node with new tasks and progress
      const updatedNodes = roadmap.nodes.map((n, idx) =>
        idx === nodeIndex
          ? { ...n, tasks: updatedTasks, progress, status: nodeStatus }
          : n
      );

      // If node just got completed, update categories
      const updatedCategories = nodeStatus === 'completed' && node.status !== 'completed'
        ? roadmap.categories.map(category => {
            if (category.nodeIds.includes(nodeId)) {
              const completedInCategory = updatedNodes.filter(n =>
                category.nodeIds.includes(n.id) && n.status === 'completed'
              ).length;
              return { ...category, completedNodes: completedInCategory };
            }
            return category;
          })
        : roadmap.categories;

      const totalCompleted = updatedNodes.filter(n => n.status === 'completed').length;

      set({
        roadmap: {
          ...roadmap,
          nodes: updatedNodes,
          categories: updatedCategories,
          completedNodes: totalCompleted,
        },
      });

      return;
    }

    // LEGACY: Handle course-based tasks
    const updatedCourses = courses.map(course => {
      const node = course.nodes.find(n => n.id === nodeId);
      if (!node || !node.tasks) return course;

      const updatedTasks = node.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              attempts: task.attempts + 1,
              userSubmission: submission,
              score,
            }
          : task
      );

      const completedTasks = updatedTasks.filter(t => t.status === 'completed').length;
      const totalTasks = updatedTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const newStatus: LearningNode['status'] = progress === 100 ? 'completed' : 'in-progress';

      return {
        ...course,
        nodes: course.nodes.map(n =>
          n.id === nodeId
            ? { ...n, tasks: updatedTasks, progress, status: newStatus }
            : n
        ),
      };
    });

    set({ courses: updatedCourses });
  },

  getNodeById: (nodeId) => {
    const { roadmap, courses } = get();

    // Check roadmap first
    if (roadmap) {
      const node = roadmap.nodes.find(n => n.id === nodeId);
      if (node) return node;
    }

    // Fallback to courses for backward compatibility
    for (const course of courses) {
      const node = course.nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    return undefined;
  },

  isNodeAvailable: (nodeId) => {
    const node = get().getNodeById(nodeId);
    if (!node) return false;

    if (node.prerequisites.length === 0) return true;

    return node.prerequisites.every(prereqId => {
      const prereq = get().getNodeById(prereqId);
      return prereq?.status === 'completed';
    });
  },

      getUnifiedGraph: () => {
        const { roadmap, courses } = get();

        // Return roadmap nodes if available
        if (roadmap && roadmap.nodes.length > 0) {
          return roadmap.nodes;
        }

        // Fallback to courses for backward compatibility
        return courses.flatMap(course => course.nodes);
      },
    }),
    {
      name: 'learning-progress-storage',
      partialize: (state) => ({
        roadmap: state.roadmap,
        courses: state.courses,
        progress: state.progress,
        achievements: state.achievements,
      }),
    }
  )
);
