import { LearningNode } from '../types';
import { UserProfile } from '../store/useUserProfileStore';

/**
 * Node Recommendation with score and reasoning
 */
export interface NodeRecommendation {
  nodeId: string;
  score: number; // 0-100 recommendation strength
  reasons: string[]; // Why recommended
  estimatedDifficulty: number; // Personalized difficulty (0-1)
  priority: 'high' | 'medium' | 'low';
  matchType: 'interest' | 'skill-gap' | 'next-step' | 'exploration';
  glowIntensity: number; // 0-1 for visual heat map
  heatColor: string; // CSS color for heat map
}

/**
 * Scoring Weights for Recommendation Algorithm
 */
const WEIGHTS = {
  interestMatch: 0.4, // 40% - Tags similarity to user's interests
  skillProgression: 0.3, // 30% - Optimal difficulty for growth
  prerequisiteReadiness: 0.2, // 20% - Prerequisites completed
  explorationBonus: 0.1, // 10% - Encourage trying new topics
};

/**
 * Get top N recommendations for a user
 */
export const getTopRecommendations = (
  userProfile: UserProfile,
  allNodes: LearningNode[],
  completedNodeIds: Set<string>,
  limit: number = 10
): NodeRecommendation[] => {
  // Filter to available nodes (not completed)
  const availableNodes = allNodes.filter((node) => !completedNodeIds.has(node.id));

  // Calculate recommendations for each node
  const recommendations = availableNodes.map((node) =>
    calculateNodeRecommendation(node, userProfile, allNodes, completedNodeIds)
  );

  // Sort by score (highest first) and take top N
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((rec) => ({
      ...rec,
      // Determine priority based on score
      priority: rec.score >= 80 ? 'high' : rec.score >= 60 ? 'medium' : 'low',
    }));
};

/**
 * Calculate recommendation score for a single node
 */
export const calculateNodeRecommendation = (
  node: LearningNode,
  userProfile: UserProfile,
  allNodes: LearningNode[],
  completedNodeIds: Set<string>
): NodeRecommendation => {
  // 1. Interest Match Score (40%)
  const interestScore = calculateInterestMatch(node, userProfile.interestTags);

  // 2. Skill Progression Score (30%)
  const progressionScore = calculateSkillProgression(node, userProfile);

  // 3. Prerequisite Readiness Score (20%)
  const prerequisiteScore = calculatePrerequisiteReadiness(
    node,
    allNodes,
    completedNodeIds
  );

  // 4. Exploration Bonus (10%)
  const explorationScore = calculateExplorationBonus(
    node,
    userProfile.interestTags,
    userProfile.explorationScore
  );

  // Calculate weighted total score (0-100)
  const totalScore =
    interestScore * WEIGHTS.interestMatch * 100 +
    progressionScore * WEIGHTS.skillProgression * 100 +
    prerequisiteScore * WEIGHTS.prerequisiteReadiness * 100 +
    explorationScore * WEIGHTS.explorationBonus * 100;

  // Generate reasons for recommendation
  const reasons = generateReasons(
    node,
    interestScore,
    progressionScore,
    prerequisiteScore,
    explorationScore
  );

  // Determine match type
  const matchType = determineMatchType(
    interestScore,
    progressionScore,
    prerequisiteScore,
    explorationScore
  );

  // Calculate personalized difficulty
  const personalizedDifficulty = calculatePersonalizedDifficulty(node, userProfile);

  // Calculate visual properties for heat map
  const { glowIntensity, heatColor } = calculateHeatMapProperties(totalScore);

  return {
    nodeId: node.id,
    score: Math.round(totalScore),
    reasons,
    estimatedDifficulty: personalizedDifficulty,
    priority: 'medium', // Will be overridden in getTopRecommendations
    matchType,
    glowIntensity,
    heatColor,
  };
};

/**
 * Calculate interest match based on node tags vs user interests
 * Returns score 0-1
 */
const calculateInterestMatch = (
  node: LearningNode,
  interestTags: Record<string, number>
): number => {
  if (node.tags.length === 0) return 0.5; // Neutral if no tags

  let totalMatch = 0;
  let tagCount = 0;

  node.tags.forEach((tag) => {
    const interestScore = interestTags[tag] || 0;
    totalMatch += interestScore;
    tagCount++;
  });

  return tagCount > 0 ? totalMatch / tagCount : 0.5;
};

/**
 * Calculate optimal skill progression score
 * Considers difficulty tolerance and current skill level
 * Returns score 0-1
 */
const calculateSkillProgression = (
  node: LearningNode,
  userProfile: UserProfile
): number => {
  const difficultyMap: Record<string, number> = {
    beginner: 0.2,
    intermediate: 0.5,
    advanced: 0.8,
    expert: 1.0,
  };

  const nodeDifficulty = difficultyMap[node.difficulty] || 0.5;
  const userTolerance = userProfile.learningStyle.difficultyTolerance;

  // Optimal difficulty is slightly above user's tolerance (growth zone)
  const optimalDifficulty = Math.min(userTolerance + 0.2, 1.0);

  // Calculate how close node difficulty is to optimal
  const difficultyDelta = Math.abs(nodeDifficulty - optimalDifficulty);

  // Score inversely proportional to delta (closer = better)
  return Math.max(0, 1 - difficultyDelta * 2);
};

/**
 * Calculate prerequisite readiness
 * Returns score 0-1 based on % of prerequisites completed
 */
const calculatePrerequisiteReadiness = (
  node: LearningNode,
  _allNodes: LearningNode[],
  completedNodeIds: Set<string>
): number => {
  if (node.prerequisites.length === 0) return 1.0; // No prerequisites = ready

  const completedPrereqs = node.prerequisites.filter((prereqId) =>
    completedNodeIds.has(prereqId)
  ).length;

  return completedPrereqs / node.prerequisites.length;
};

/**
 * Calculate exploration bonus
 * Encourages trying topics outside comfort zone
 * Returns score 0-1
 */
const calculateExplorationBonus = (
  node: LearningNode,
  interestTags: Record<string, number>,
  userExplorationScore: number
): number => {
  // Check if node has tags that are new/low interest
  const hasNewTags = node.tags.some((tag) => !interestTags[tag] || interestTags[tag] < 0.3);

  if (hasNewTags) {
    // Bonus proportional to user's exploration score
    // High explorers get bigger bonus for new topics
    return 0.5 + userExplorationScore * 0.5;
  }

  return 0.5; // Neutral if no new tags
};

/**
 * Generate human-readable reasons for recommendation
 */
const generateReasons = (
  _node: LearningNode,
  interestScore: number,
  progressionScore: number,
  prerequisiteScore: number,
  explorationScore: number
): string[] => {
  const reasons: string[] = [];

  if (interestScore > 0.7) {
    reasons.push('Matches your interests perfectly');
  } else if (interestScore > 0.5) {
    reasons.push('Aligns with your learning preferences');
  }

  if (progressionScore > 0.7) {
    reasons.push('Perfect difficulty level for your growth');
  } else if (progressionScore > 0.5) {
    reasons.push('Good next step in your skill progression');
  }

  if (prerequisiteScore === 1.0) {
    reasons.push('All prerequisites completed');
  } else if (prerequisiteScore > 0.5) {
    reasons.push(`${Math.round(prerequisiteScore * 100)}% prerequisites done`);
  } else if (prerequisiteScore === 0) {
    reasons.push('Start here anytime - no prerequisites');
  }

  if (explorationScore > 0.7) {
    reasons.push('Explore something new');
  }

  if (reasons.length === 0) {
    reasons.push('Available to start');
  }

  return reasons.slice(0, 3); // Max 3 reasons
};

/**
 * Determine primary match type
 */
const determineMatchType = (
  interestScore: number,
  progressionScore: number,
  prerequisiteScore: number,
  explorationScore: number
): NodeRecommendation['matchType'] => {
  const scores = {
    interest: interestScore,
    'skill-gap': progressionScore,
    'next-step': prerequisiteScore,
    exploration: explorationScore,
  };

  // Find highest scoring category
  const maxEntry = Object.entries(scores).reduce((max, entry) =>
    entry[1] > max[1] ? entry : max
  );

  return maxEntry[0] as NodeRecommendation['matchType'];
};

/**
 * Calculate personalized difficulty for user
 * Adjusts node difficulty based on user's performance
 */
const calculatePersonalizedDifficulty = (
  node: LearningNode,
  userProfile: UserProfile
): number => {
  const difficultyMap: Record<string, number> = {
    beginner: 0.2,
    intermediate: 0.5,
    advanced: 0.8,
    expert: 1.0,
  };

  const baseDifficulty = difficultyMap[node.difficulty] || 0.5;

  // Adjust based on user's completion rate
  // If user completes fast, content feels easier
  const adjustmentFactor = userProfile.averageCompletionRate;

  // personalizedDifficulty = baseDifficulty * adjustmentFactor
  // If user is fast (rate < 1.0), difficulty decreases
  // If user is slow (rate > 1.0), difficulty increases
  return Math.min(1.0, baseDifficulty * adjustmentFactor);
};

/**
 * Calculate heat map visual properties based on score
 */
const calculateHeatMapProperties = (
  score: number
): { glowIntensity: number; heatColor: string } => {
  // Normalize score to 0-1
  const intensity = Math.min(1.0, score / 100);

  // Determine color based on score ranges
  let heatColor: string;

  if (score >= 90) {
    // 🔥 Red glow - "Perfect for you now!"
    heatColor = '#EF4444'; // red-500
  } else if (score >= 70) {
    // 🟡 Amber glow - "Good next step"
    heatColor = '#F59E0B'; // amber-500
  } else if (score >= 50) {
    // 🟢 Green glow - "Matches your interests"
    heatColor = '#10B981'; // green-500
  } else {
    // ⚪ Neutral - "Available anytime"
    heatColor = '#6B7280'; // gray-500
  }

  return { glowIntensity: intensity, heatColor };
};

/**
 * Predict completion time for a node based on user's pace
 */
export const predictCompletionTime = (
  node: LearningNode,
  userProfile: UserProfile
): number => {
  const baseEstimate = node.estimatedMinutes;

  // Adjust based on user's average completion rate
  const adjustedMinutes = baseEstimate * userProfile.averageCompletionRate;

  return Math.round(adjustedMinutes);
};

/**
 * Analyze user interests from completed nodes
 */
export const analyzeUserInterests = (
  completedNodes: LearningNode[]
): Record<string, number> => {
  const tagCounts: Record<string, number> = {};
  const tagScores: Record<string, number> = {};

  // Count tag occurrences
  completedNodes.forEach((node) => {
    node.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Normalize to 0-1 scores
  const maxCount = Math.max(...Object.values(tagCounts), 1);
  Object.keys(tagCounts).forEach((tag) => {
    tagScores[tag] = tagCounts[tag] / maxCount;
  });

  return tagScores;
};

/**
 * Generate personalized learning path to achieve target skill
 */
export const generateLearningPath = (
  targetSkill: string,
  allNodes: LearningNode[],
  completedNodeIds: Set<string>,
  userProfile: UserProfile
): LearningNode[] => {
  // Find nodes related to target skill
  const relevantNodes = allNodes.filter(
    (node) =>
      !completedNodeIds.has(node.id) &&
      (node.tags.includes(targetSkill.toLowerCase()) ||
        node.title.toLowerCase().includes(targetSkill.toLowerCase()))
  );

  // Get recommendations for relevant nodes
  const recommendations = relevantNodes.map((node) =>
    calculateNodeRecommendation(node, userProfile, allNodes, completedNodeIds)
  );

  // Sort by score
  const sortedRecommendations = recommendations.sort((a, b) => b.score - a.score);

  // Build path considering prerequisites
  const path: LearningNode[] = [];
  const includedIds = new Set<string>();

  sortedRecommendations.forEach((rec) => {
    const node = allNodes.find((n) => n.id === rec.nodeId);
    if (node && !includedIds.has(node.id)) {
      // Add prerequisites first
      node.prerequisites.forEach((prereqId) => {
        if (!completedNodeIds.has(prereqId) && !includedIds.has(prereqId)) {
          const prereqNode = allNodes.find((n) => n.id === prereqId);
          if (prereqNode) {
            path.push(prereqNode);
            includedIds.add(prereqId);
          }
        }
      });

      // Add node itself
      path.push(node);
      includedIds.add(node.id);
    }
  });

  return path;
};

/**
 * Calculate exploration score based on learning behavior
 */
export const calculateExplorationScore = (
  completedNodes: LearningNode[],
  _totalNodes: number
): number => {
  if (completedNodes.length === 0) return 0;

  // Count unique tags in completed nodes
  const uniqueTags = new Set<string>();
  completedNodes.forEach((node) => {
    node.tags.forEach((tag) => uniqueTags.add(tag));
  });

  // Exploration score = diversity of topics explored
  // Higher score = more diverse learning
  const tagDiversity = uniqueTags.size / Math.max(completedNodes.length, 1);

  // Normalize to 0-1
  return Math.min(1.0, tagDiversity);
};

/**
 * Calculate consistency score based on completion pattern
 */
export const calculateConsistencyScore = (
  completionDates: Date[]
): number => {
  if (completionDates.length < 2) return 0;

  // Sort dates
  const sorted = [...completionDates].sort((a, b) => a.getTime() - b.getTime());

  // Calculate gaps between completions (in days)
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const daysDiff = (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    gaps.push(daysDiff);
  }

  // Calculate standard deviation of gaps
  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);

  // Consistency score inversely proportional to standard deviation
  // Lower stdDev = more consistent
  const maxStdDev = 7; // 1 week variation
  const consistencyScore = Math.max(0, 1 - stdDev / maxStdDev);

  return consistencyScore;
};

/**
 * Generate personalized learning path based on recommendations
 * Returns ordered array of node IDs representing optimal path
 */
export const generatePersonalizedPath = (
  userProfile: UserProfile,
  allNodes: LearningNode[],
  completedNodeIds: Set<string>,
  pathLength: number = 10
): string[] => {
  // Get top recommendations (get more than needed to have flexibility)
  const recommendations = getTopRecommendations(
    userProfile,
    allNodes,
    completedNodeIds,
    pathLength * 2
  );

  // Build path considering prerequisites
  const path: string[] = [];
  const included = new Set<string>();

  for (const rec of recommendations) {
    const node = allNodes.find(n => n.id === rec.nodeId);
    if (!node || included.has(node.id)) continue;

    // Add prerequisites first (if not completed and not already included)
    for (const prereqId of node.prerequisites) {
      if (!completedNodeIds.has(prereqId) && !included.has(prereqId)) {
        path.push(prereqId);
        included.add(prereqId);
      }
    }

    // Add node itself
    path.push(node.id);
    included.add(node.id);

    if (path.length >= pathLength) break;
  }

  return path.slice(0, pathLength);
};
