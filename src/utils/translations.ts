/**
 * Centralized translations for all enum values
 * Keep enum values in English (for code), display in Portuguese (for UI)
 */

export const translations = {
  // Node types
  nodeType: {
    concept: 'Conceito',
    practice: 'Prática',
    project: 'Projeto',
    assessment: 'Avaliação',
    milestone: 'Marco'
  },

  // Difficulty levels
  difficulty: {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    expert: 'Especialista'
  },

  // Status
  status: {
    available: 'Disponível',
    'in-progress': 'Em Progresso',
    completed: 'Concluído',
    locked: 'Bloqueado'
  },

  // Resource types
  resourceType: {
    video: 'Vídeo',
    quiz: 'Quiz',
    exercise: 'Exercício',
    article: 'Artigo',
    project: 'Projeto'
  },

  // Match types (for recommendation explanations)
  matchType: {
    interest: 'Correspondência de Interesse',
    'skill-gap': 'Lacuna de Habilidade',
    'next-step': 'Próximo Passo',
    exploration: 'Exploração'
  },

  // Categories (for new architecture)
  category: {
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Banco de Dados',
    devops: 'DevOps',
    security: 'Segurança',
    testing: 'Testes',
    architecture: 'Arquitetura'
  }
} as const;

// Helper type for type safety
export type TranslationKey = keyof typeof translations;
export type NodeTypeKey = keyof typeof translations.nodeType;
export type DifficultyKey = keyof typeof translations.difficulty;
export type StatusKey = keyof typeof translations.status;
export type ResourceTypeKey = keyof typeof translations.resourceType;
export type MatchTypeKey = keyof typeof translations.matchType;
export type CategoryKey = keyof typeof translations.category;

// Helper function to get translation
export function translate<K extends TranslationKey>(
  category: K,
  key: string
): string {
  const categoryTranslations = translations[category] as Record<string, string>;
  return categoryTranslations[key] || key;
}

// Convenience functions for common translations
export const translateNodeType = (type: string) => translate('nodeType', type);
export const translateDifficulty = (difficulty: string) => translate('difficulty', difficulty);
export const translateStatus = (status: string) => translate('status', status);
export const translateResourceType = (resourceType: string) => translate('resourceType', resourceType);
export const translateMatchType = (matchType: string) => translate('matchType', matchType);
export const translateCategory = (category: string) => translate('category', category);
