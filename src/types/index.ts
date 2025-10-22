// Core Types for NeuroTrack

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
}

export interface LearningNode {
  id: string;
  title: string;
  description: string;
  type: 'concept' | 'practice' | 'project' | 'assessment' | 'milestone';
  courseId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  prerequisites: string[]; // IDs of nodes that must be completed first
  position: { x: number; y: number };
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  progress: number; // 0-100
  tags: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  nodes: LearningNode[];
  color: string;
  icon: string;
  totalNodes: number;
  completedNodes: number;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  nodeId: string;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in minutes
}

export interface Event {
  id: string;
  userId: string;
  resourceId: string;
  resourceType: 'video' | 'quiz' | 'exercise' | 'article' | 'project';
  eventType: 'access' | 'play' | 'pause' | 'submit' | 'complete' | 'comment' | 'like';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  total: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: string[]; // course IDs
  recommendedFor: string[];
  estimatedWeeks: number;
}

export interface Recommendation {
  nodeId: string;
  reason: string;
  confidence: number;
  basedOn: string[];
}
