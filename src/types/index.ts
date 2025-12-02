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

export interface Notification {
  id: string;
  userId: string;
  type: 'achievement' | 'recommendation' | 'reminder' | 'milestone' | 'social';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  nodeId: string;
  courseId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  resourceId: string;
  resourceType: 'course' | 'node';
  createdAt: Date;
}

export interface LessonContentData {
  videos: Array<{
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    duration: string;
    viewCount: string;
    publishedAt: string;
  }>;
  article: {
    title: string;
    extract: string;
    fullUrl: string;
    thumbnail?: string;
    categories?: string[];
  } | null;
  relatedTopics: string[];
  estimatedReadingTime: number;
}
