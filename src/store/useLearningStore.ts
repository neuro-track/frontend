import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, LearningNode, UserProgress, Achievement } from '../types';
import { getMockCourses } from '../data/mockData';

interface LearningState {
  courses: Course[];
  currentCourse: Course | null;
  progress: UserProgress[];
  achievements: Achievement[];

  setCourses: (courses: Course[]) => void;
  setCurrentCourse: (courseId: string | null) => void;
  updateNodeProgress: (nodeId: string, progress: number) => void;
  updateNodeStatus: (courseId: string, nodeId: string, status: LearningNode['status'], progress: number) => void;
  unlockDependentNodes: (courseId: string, completedNodeId: string) => string[];
  completeNode: (nodeId: string) => void;
  getNodeById: (nodeId: string) => LearningNode | undefined;
  isNodeAvailable: (nodeId: string) => boolean;
  getUnifiedGraph: () => LearningNode[];
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      courses: getMockCourses(),
      currentCourse: null,
      progress: [],
      achievements: [],

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
    const { courses } = get();

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
      node.prerequisites.includes(completedNodeId) && node.status === 'locked'
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
    get().updateNodeProgress(nodeId, 100);
  },

  getNodeById: (nodeId) => {
    const { courses } = get();
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
        const { courses } = get();
        return courses.flatMap(course => course.nodes);
      },
    }),
    {
      name: 'learning-progress-storage',
      partialize: (state) => ({
        courses: state.courses,
        progress: state.progress,
        achievements: state.achievements,
      }),
    }
  )
);
