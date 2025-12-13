import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ExtractedProfile } from '../services/aiService';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

/**
 * Learning Goals
 */
export type LearningGoal = 'fullstack' | 'frontend' | 'backend' | 'mobile' | 'data' | 'custom';

/**
 * Learning Pace
 */
export type LearningPace = 'sprint' | 'steady' | 'explorer';

/**
 * Learning Style Preferences (auto-detected from behavior)
 */
export interface LearningStyle {
  prefersTheory: number;        // 0-1 score (0=practice-focused, 1=theory-focused)
  prefersProjects: number;      // 0-1 score (0=assessment-focused, 1=project-focused)
  difficultyTolerance: number;  // 0-1 score (comfort with hard content)
}

/**
 * User Profile Interface
 */
export interface UserProfile {
  userId: string;
  hasCompletedOnboarding: boolean;

  // Initial Setup (user-selected during onboarding)
  learningGoal: LearningGoal | null;
  targetRole: string;                  // e.g., "React Developer", "Full Stack Engineer"
  availableHoursPerWeek: number;       // Time commitment
  preferredPace: LearningPace | null;  // Learning speed preference

  // Auto-Detected Patterns (updated as user learns)
  learningStyle: LearningStyle;

  // Interest Profile (auto-generated from completed node tags)
  // Maps tag name to interest strength (0-1)
  interestTags: Record<string, number>;
  // Example: { "react": 0.9, "css": 0.7, "backend": 0.3 }

  // AI-Related Fields
  knowledgeGaps: string[];                // Skills user wants to learn
  conversationHistory: ChatMessage[];     // Chat history with AI
  lastRoadmapGeneration?: string;         // ISO date of last generation

  // Performance Metrics
  averageCompletionRate: number;  // Actual time vs estimated time (1.0 = on target)
  consistencyScore: number;       // Streak maintenance (0-1)
  explorationScore: number;       // How much they branch out (0-1)
  totalNodesCompleted: number;

  // Predictions
  predictedCompletionDate: string | null;  // ISO date string
  suggestedDailyMinutes: number;

  // Metadata
  createdAt: string;  // ISO date string
  lastUpdated: string;  // ISO date string
}

/**
 * Default Learning Style (neutral starting point)
 */
const defaultLearningStyle: LearningStyle = {
  prefersTheory: 0.5,
  prefersProjects: 0.5,
  difficultyTolerance: 0.5,
};

/**
 * Create Default User Profile
 */
const createDefaultProfile = (userId: string): UserProfile => ({
  userId,
  hasCompletedOnboarding: true, // Changed from false - chat is now the onboarding
  learningGoal: null,
  targetRole: '',
  availableHoursPerWeek: 10, // Default 10 hours/week
  preferredPace: null,
  learningStyle: { ...defaultLearningStyle },
  interestTags: {},
  knowledgeGaps: [],
  conversationHistory: [],
  lastRoadmapGeneration: undefined,
  averageCompletionRate: 1.0,
  consistencyScore: 0,
  explorationScore: 0,
  totalNodesCompleted: 0,
  predictedCompletionDate: null,
  suggestedDailyMinutes: 30, // Default 30 min/day
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
});

/**
 * User Profile Store State
 */
interface UserProfileState {
  profile: UserProfile;

  // Actions
  initializeProfile: (userId: string) => void;
  completeOnboarding: (data: {
    learningGoal: LearningGoal;
    targetRole: string;
    availableHoursPerWeek: number;
    preferredPace: LearningPace;
  }) => void;
  updateInterestTags: (tags: string[]) => void;
  updateLearningStyle: (updates: Partial<LearningStyle>) => void;
  updatePerformanceMetrics: (metrics: {
    completionRate?: number;
    consistency?: number;
    exploration?: number;
  }) => void;
  recordNodeCompletion: (nodeTags: string[], actualMinutes: number, estimatedMinutes: number) => void;
  updatePredictions: (completionDate: string | null, dailyMinutes: number) => void;
  resetProfile: () => void;

  // AI-related actions
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  updateProfileFromAI: (profile: ExtractedProfile) => void;
  markRoadmapGenerated: () => void;

  // Supabase sync actions
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: (userId: string) => Promise<void>;
}

/**
 * User Profile Store
 */
export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profile: createDefaultProfile('default-user'),

      /**
       * Initialize profile for a specific user
       */
      initializeProfile: (userId: string) => {
        const existingProfile = get().profile;
        if (existingProfile.userId !== userId) {
          set({ profile: createDefaultProfile(userId) });
        }
      },

      /**
       * Complete onboarding and set initial preferences
       */
      completeOnboarding: (data) => {
        const currentProfile = get().profile;

        // Calculate suggested daily minutes based on hours per week
        const dailyMinutes = Math.round((data.availableHoursPerWeek * 60) / 7);

        set({
          profile: {
            ...currentProfile,
            hasCompletedOnboarding: true,
            learningGoal: data.learningGoal,
            targetRole: data.targetRole,
            availableHoursPerWeek: data.availableHoursPerWeek,
            preferredPace: data.preferredPace,
            suggestedDailyMinutes: dailyMinutes,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Update interest tags based on completed node tags
       * Uses exponential moving average to give more weight to recent interests
       */
      updateInterestTags: (tags: string[]) => {
        const currentProfile = get().profile;
        const currentInterests = { ...currentProfile.interestTags };
        const alpha = 0.3; // Smoothing factor for exponential moving average

        tags.forEach((tag) => {
          const currentScore = currentInterests[tag] || 0;
          // Exponential moving average: new_score = alpha * 1.0 + (1 - alpha) * old_score
          currentInterests[tag] = alpha * 1.0 + (1 - alpha) * currentScore;
        });

        // Decay all interest scores slightly (0.95 multiplier)
        // This ensures old interests fade over time if not reinforced
        Object.keys(currentInterests).forEach((tag) => {
          if (!tags.includes(tag)) {
            currentInterests[tag] *= 0.95;
          }
        });

        // Remove interests below threshold
        Object.keys(currentInterests).forEach((tag) => {
          if (currentInterests[tag] < 0.1) {
            delete currentInterests[tag];
          }
        });

        set({
          profile: {
            ...currentProfile,
            interestTags: currentInterests,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Update learning style preferences
       */
      updateLearningStyle: (updates) => {
        const currentProfile = get().profile;
        set({
          profile: {
            ...currentProfile,
            learningStyle: {
              ...currentProfile.learningStyle,
              ...updates,
            },
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Update performance metrics
       */
      updatePerformanceMetrics: (metrics) => {
        const currentProfile = get().profile;
        set({
          profile: {
            ...currentProfile,
            averageCompletionRate: metrics.completionRate ?? currentProfile.averageCompletionRate,
            consistencyScore: metrics.consistency ?? currentProfile.consistencyScore,
            explorationScore: metrics.exploration ?? currentProfile.explorationScore,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Record node completion and update profile
       * This is the main function that adapts the profile based on behavior
       */
      recordNodeCompletion: (nodeTags: string[], actualMinutes: number, estimatedMinutes: number) => {
        const currentProfile = get().profile;

        // Update interest tags
        get().updateInterestTags(nodeTags);

        // Calculate completion rate (actual vs estimated)
        const completionRate = estimatedMinutes > 0 ? actualMinutes / estimatedMinutes : 1.0;

        // Update average completion rate (exponential moving average)
        const alpha = 0.2;
        const newAvgCompletionRate =
          alpha * completionRate + (1 - alpha) * currentProfile.averageCompletionRate;

        // Increment total nodes completed
        const newTotalCompleted = currentProfile.totalNodesCompleted + 1;

        set({
          profile: {
            ...currentProfile,
            averageCompletionRate: newAvgCompletionRate,
            totalNodesCompleted: newTotalCompleted,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Update timeline predictions
       */
      updatePredictions: (completionDate, dailyMinutes) => {
        const currentProfile = get().profile;
        set({
          profile: {
            ...currentProfile,
            predictedCompletionDate: completionDate,
            suggestedDailyMinutes: dailyMinutes,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Reset profile to default
       */
      resetProfile: () => {
        const userId = get().profile.userId;
        set({ profile: createDefaultProfile(userId) });
      },

      /**
       * Add chat message to conversation history
       */
      addChatMessage: (message) => {
        const currentProfile = get().profile;
        set({
          profile: {
            ...currentProfile,
            conversationHistory: [
              ...currentProfile.conversationHistory,
              {
                ...message,
                timestamp: message.timestamp || new Date().toISOString(),
              },
            ],
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Clear chat history
       */
      clearChatHistory: () => {
        const currentProfile = get().profile;
        set({
          profile: {
            ...currentProfile,
            conversationHistory: [],
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Update profile from AI-extracted data
       */
      updateProfileFromAI: (extractedProfile) => {
        const currentProfile = get().profile;

        set({
          profile: {
            ...currentProfile,
            targetRole: extractedProfile.targetRole || currentProfile.targetRole,
            knowledgeGaps: extractedProfile.knowledgeGaps,
            interestTags: {
              ...currentProfile.interestTags,
              ...extractedProfile.interestTags,
            },
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Mark that roadmap was generated
       */
      markRoadmapGenerated: () => {
        const currentProfile = get().profile;
        set({
          profile: {
            ...currentProfile,
            lastRoadmapGeneration: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      /**
       * Sync profile to Supabase
       */
      syncToSupabase: async () => {
        if (!isSupabaseEnabled || !supabase) {
          console.log('Supabase not enabled, skipping sync');
          return;
        }

        const currentProfile = get().profile;

        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            console.error('No authenticated user found');
            return;
          }

          // Update profile in Supabase
          const { error } = await supabase
            .from('profiles')
            .update({
              learning_goal: currentProfile.learningGoal,
              target_role: currentProfile.targetRole,
              available_hours_per_week: currentProfile.availableHoursPerWeek,
              preferred_pace: currentProfile.preferredPace,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) {
            console.error('Failed to sync profile to Supabase:', error);
          } else {
            console.log('Profile synced to Supabase successfully');
          }
        } catch (error) {
          console.error('Error syncing to Supabase:', error);
        }
      },

      /**
       * Load profile from Supabase
       */
      loadFromSupabase: async (_userId: string) => {
        if (!isSupabaseEnabled || !supabase) {
          console.log('Supabase not enabled, using local profile');
          return;
        }

        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            console.error('No authenticated user found');
            return;
          }

          // Fetch profile from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Failed to load profile from Supabase:', error);
            return;
          }

          if (data) {
            const currentProfile = get().profile;

            // Merge Supabase data with local profile
            set({
              profile: {
                ...currentProfile,
                userId: data.id,
                learningGoal: (data.learning_goal as LearningGoal) || null,
                targetRole: data.target_role || '',
                availableHoursPerWeek: data.available_hours_per_week || 10,
                preferredPace: (data.preferred_pace as LearningPace) || null,
                lastUpdated: data.updated_at || new Date().toISOString(),
              },
            });

            console.log('Profile loaded from Supabase successfully');
          }
        } catch (error) {
          console.error('Error loading from Supabase:', error);
        }
      },
    }),
    {
      name: 'user-profile-storage',
      version: 2, // Increment version due to schema change
    }
  )
);

/**
 * Helper Functions
 */

/**
 * Get learning pace description
 */
export const getLearningPaceDescription = (pace: LearningPace | null): string => {
  switch (pace) {
    case 'sprint':
      return 'Sprint Mode: 15+ hrs/week - Complete quickly';
    case 'steady':
      return 'Steady Pace: 8-15 hrs/week - Balanced learning';
    case 'explorer':
      return 'Explorer: <8 hrs/week - Learn at your own pace';
    default:
      return 'Not set';
  }
};

/**
 * Get learning goal description
 */
export const getLearningGoalDescription = (goal: LearningGoal | null): string => {
  switch (goal) {
    case 'fullstack':
      return 'Full Stack Developer';
    case 'frontend':
      return 'Frontend Developer';
    case 'backend':
      return 'Backend Developer';
    case 'mobile':
      return 'Mobile Developer';
    case 'data':
      return 'Data Scientist';
    case 'custom':
      return 'Custom Learning Path';
    default:
      return 'Not set';
  }
};

/**
 * Calculate estimated weeks to completion
 */
export const calculateEstimatedWeeks = (
  totalMinutesRemaining: number,
  hoursPerWeek: number
): number => {
  if (hoursPerWeek <= 0) return 0;
  const minutesPerWeek = hoursPerWeek * 60;
  return Math.ceil(totalMinutesRemaining / minutesPerWeek);
};
