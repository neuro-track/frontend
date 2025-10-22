import { create } from 'zustand';
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
  completeNode: (nodeId: string) => void;
  getNodeById: (nodeId: string) => LearningNode | undefined;
  isNodeAvailable: (nodeId: string) => boolean;
  getUnifiedGraph: () => LearningNode[];
}

export const useLearningStore = create<LearningState>((set, get) => ({
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
}));
