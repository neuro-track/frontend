import { aiService } from '../services/aiService';
import { useUserProfileStore } from '../store/useUserProfileStore';
import { useLearningStore } from '../store/useLearningStore';
import { Roadmap } from '../types';

/**
 * Result of roadmap generation
 */
export interface RoadmapGenerationResult {
  success: boolean;
  roadmap?: Roadmap;
  error?: string;
}

/**
 * Generate roadmap from chat conversation
 */
export async function generateRoadmapFromChat(): Promise<RoadmapGenerationResult> {
  try {
    // 1. Get conversation history
    const { profile, updateProfileFromAI, markRoadmapGenerated } =
      useUserProfileStore.getState();

    const { conversationHistory } = profile;

    if (conversationHistory.length === 0) {
      return {
        success: false,
        error: 'Nenhuma conversa encontrada. Por favor, converse com o assistente primeiro.',
      };
    }

    // 2. Generate roadmap directly from conversation (optimized - single API call)
    console.log('Gerando roadmap personalizado a partir da conversa...');
    const roadmap = await aiService.generateRoadmapFromConversation(conversationHistory);
    console.log('Roadmap gerado:', roadmap);

    // 3. Extract profile from roadmap metadata (optional)
    const extractedProfile = {
      learningGoal: roadmap.description,
      targetRole: undefined,
      currentLevel: 'beginner' as const,
      interestTags: {},
      knowledgeGaps: [],
      desiredTechnologies: []
    };
    updateProfileFromAI(extractedProfile);

    // Validate roadmap structure
    if (!validateRoadmap(roadmap)) {
      return {
        success: false,
        error: 'Roadmap gerado possui estrutura inválida. Tente novamente.',
      };
    }

    // 5. Save roadmap to store
    useLearningStore.setState({ roadmap });

    // 6. Mark that roadmap was generated
    markRoadmapGenerated();

    return {
      success: true,
      roadmap,
    };
  } catch (error) {
    console.error('Erro ao gerar roadmap:', error);

    let errorMessage = 'Erro desconhecido ao gerar roadmap';

    if (error instanceof Error) {
      if (error.message.includes('API Error') || error.message.includes('fetch')) {
        errorMessage = 'Erro ao comunicar com a IA. Verifique sua API key no arquivo .env';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Erro ao processar resposta da IA. Tente novamente.';
      } else if (error.message.includes('Invalid roadmap')) {
        errorMessage = 'Roadmap gerado possui estrutura inválida. Tente novamente.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Validate roadmap structure before saving
 */
function validateRoadmap(roadmap: any): roadmap is Roadmap {
  // Check required fields
  if (!roadmap.id || !roadmap.title || !roadmap.categories || !roadmap.nodes) {
    console.error('Missing required fields in roadmap');
    return false;
  }

  // Check arrays are valid
  if (!Array.isArray(roadmap.categories) || !Array.isArray(roadmap.nodes)) {
    console.error('Categories or nodes are not arrays');
    return false;
  }

  // Check minimum content
  if (roadmap.categories.length === 0 || roadmap.nodes.length === 0) {
    console.error('Roadmap must have at least one category and one node');
    return false;
  }

  // Build ID sets for validation
  const nodeIds = new Set(roadmap.nodes.map((n: any) => n.id));
  const categoryIds = new Set(roadmap.categories.map((c: any) => c.id));

  // Verify all prerequisites exist
  for (const node of roadmap.nodes) {
    if (!node.prerequisites || !Array.isArray(node.prerequisites)) {
      console.warn(`Node ${node.id} has invalid prerequisites`);
      node.prerequisites = [];
    }

    for (const prereqId of node.prerequisites) {
      if (!nodeIds.has(prereqId)) {
        console.warn(`Prerequisite ${prereqId} not found for node ${node.id}, removing it`);
        node.prerequisites = node.prerequisites.filter((id: string) => id !== prereqId);
      }
    }
  }

  // Verify all categoryIds exist
  for (const node of roadmap.nodes) {
    if (!node.categoryIds || !Array.isArray(node.categoryIds)) {
      console.warn(`Node ${node.id} has invalid categoryIds`);
      node.categoryIds = [roadmap.categories[0].id]; // Fallback to first category
    }

    for (const catId of node.categoryIds) {
      if (!categoryIds.has(catId)) {
        console.warn(`Category ${catId} not found for node ${node.id}, removing it`);
        node.categoryIds = node.categoryIds.filter((id: string) => id !== catId);
      }
    }

    // Ensure at least one category
    if (node.categoryIds.length === 0) {
      node.categoryIds = [roadmap.categories[0].id];
    }
  }

  // Check for circular dependencies
  if (hasCircularDependencies(roadmap.nodes)) {
    console.error('Roadmap has circular dependencies');
    return false;
  }

  return true;
}

/**
 * Detect circular dependencies in prerequisites
 */
function hasCircularDependencies(nodes: any[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      return true; // Cycle detected
    }

    if (visited.has(nodeId)) {
      return false; // Already processed
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (node && node.prerequisites) {
      for (const prereqId of node.prerequisites) {
        if (dfs(prereqId)) {
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (dfs(node.id)) {
      return true;
    }
  }

  return false;
}
