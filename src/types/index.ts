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

  // MODIFIED: Multi-category support (replaces single courseId)
  categoryIds?: string[]; // IDs of categories this node contributes to (optional during migration)

  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedMinutes: number;
  prerequisites: string[]; // IDs of nodes recommended before this one (soft prerequisites)
  position: { x: number; y: number };
  status: 'available' | 'in-progress' | 'completed'; // Removed 'locked' - total freedom!
  progress: number; // 0-100
  tags: string[];

  // Optional fields for enhanced recommendations
  actualMinutes?: number; // User's actual time spent
  completedAt?: string; // ISO date string

  // NEW: Tasks array for granular progress tracking
  tasks?: Task[];

  // DEPRECATED: Keep for backward compatibility during migration
  courseId?: string;
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

/**
 * NEW: Roadmap represents a complete learning path for a technology
 * Replaces the concept of multiple independent courses
 */
export interface Roadmap {
  id: string;
  title: string; // Ex: "Desenvolvimento Web Full Stack"
  description: string;
  icon: string;
  color: string;
  categories: LearningCategory[]; // Categories that compose this roadmap
  nodes: LearningNode[]; // ALL nodes in the roadmap
  totalNodes: number;
  completedNodes: number;
}

/**
 * NEW: Learning category - represents a skill area or knowledge domain
 * Multiple nodes can contribute to the same category
 */
export interface LearningCategory {
  id: string;
  name: string; // Ex: "Node.js", "APIs", "HTML/CSS"
  description: string;
  icon: string;
  color: string;
  totalNodes: number; // How many nodes contribute to this category
  completedNodes: number; // How many contributing nodes are completed
  nodeIds: string[]; // IDs of nodes that contribute to this category
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

/**
 * NEW: Task system for granular learning progress
 * Tasks provide structured exercises within learning nodes
 */
/**
 * Resource for exercise or reading content
 */
export interface LearningResource {
  type: 'article' | 'video' | 'documentation' | 'interactive';
  title: string;
  url: string;
  description: string;
  estimatedMinutes: number;
  language?: 'pt' | 'en';
  thumbnailUrl?: string;
}

/**
 * Rich content for exercise tasks
 */
export interface ExerciseContent {
  resources: LearningResource[];
  objectives: string[];
  practiceActivities: string[];
  selfAssessment?: QuizQuestion[];
}

/**
 * Rich content for reading tasks with embedded material
 */
export interface ReadingContent {
  url: string;
  summary: string; // Embedded summary from Wikipedia
  keyPoints: string[];
  sections?: {
    title: string;
    content: string;
  }[];
  comprehensionQuestions?: QuizQuestion[];
}

export interface Task {
  id: string;
  nodeId: string; // Parent learning node
  title: string;
  description: string;
  type: 'exercise' | 'quiz' | 'coding-challenge' | 'reading' | 'video-watch';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;

  // Task content (now with rich content support)
  content?: {
    // For quizzes
    questions?: QuizQuestion[];

    // For coding challenges
    starterCode?: string;
    testCases?: TestCase[];

    // For reading/video (basic)
    url?: string;

    // NEW: Rich content for exercises
    exercise?: ExerciseContent;

    // NEW: Rich content for reading
    reading?: ReadingContent;
  };

  // Progress tracking
  status: 'not-started' | 'in-progress' | 'completed' | 'skipped';
  completedAt?: string; // ISO timestamp
  attempts: number;
  score?: number; // 0-100 for quizzes/coding

  // Submission (for coding challenges)
  userSubmission?: string; // User's code
  feedback?: string; // AI feedback on submission
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
}

export interface TestCase {
  id: string;
  input: any;
  expectedOutput: any;
  description: string;
}
