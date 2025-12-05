import { useMemo } from 'react';
import { LearningNode } from '../types';
import { useUserProfileStore } from '../store/useUserProfileStore';
import {
  getTopRecommendations,
  calculateNodeRecommendation,
  NodeRecommendation,
  generatePersonalizedPath,
} from '../utils/recommendationEngine';

/**
 * Custom hook to compute AI recommendations for learning nodes
 */
export const useRecommendations = (
  allNodes: LearningNode[],
  options: {
    limit?: number;
    enableRecommendations?: boolean;
  } = {}
) => {
  const { limit = 10, enableRecommendations = true } = options;
  const { profile } = useUserProfileStore();

  // Memoize recommendations to avoid recalculation on every render
  const recommendations = useMemo(() => {
    if (!enableRecommendations || !profile.hasCompletedOnboarding) {
      return {
        topRecommendations: [],
        recommendationMap: new Map<string, NodeRecommendation>(),
      };
    }

    // Get completed node IDs
    const completedNodeIds = new Set(
      allNodes.filter((node) => node.status === 'completed').map((node) => node.id)
    );

    // Get top recommendations
    const topRecs = getTopRecommendations(profile, allNodes, completedNodeIds, limit);

    // Create a map of all node recommendations for quick lookup
    const recMap = new Map<string, NodeRecommendation>();

    allNodes.forEach((node) => {
      if (node.status !== 'completed') {
        const rec = calculateNodeRecommendation(node, profile, allNodes, completedNodeIds);
        recMap.set(node.id, rec);
      }
    });

    return {
      topRecommendations: topRecs,
      recommendationMap: recMap,
    };
  }, [allNodes, profile, limit, enableRecommendations]);

  /**
   * Get recommendation for a specific node
   */
  const getRecommendation = (nodeId: string): NodeRecommendation | undefined => {
    return recommendations.recommendationMap.get(nodeId);
  };

  /**
   * Check if a node has incomplete prerequisites
   */
  const hasIncompletePrerequisites = (node: LearningNode): boolean => {
    if (node.prerequisites.length === 0) return false;

    const completedIds = new Set(
      allNodes.filter((n) => n.status === 'completed').map((n) => n.id)
    );

    return node.prerequisites.some((prereqId) => !completedIds.has(prereqId));
  };

  /**
   * Generate personalized learning path
   */
  const personalizedPath = useMemo(() => {
    if (!enableRecommendations || !profile.hasCompletedOnboarding) {
      return [];
    }

    const completedNodeIds = new Set(
      allNodes.filter((node) => node.status === 'completed').map((node) => node.id)
    );

    return generatePersonalizedPath(profile, allNodes, completedNodeIds, 8);
  }, [allNodes, profile, enableRecommendations]);

  return {
    topRecommendations: recommendations.topRecommendations,
    recommendationMap: recommendations.recommendationMap,
    getRecommendation,
    hasIncompletePrerequisites,
    personalizedPath,
    isReady: profile.hasCompletedOnboarding,
  };
};
