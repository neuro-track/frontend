import { translations, translate } from '../utils/translations';

/**
 * Hook for convenient access to translation functions
 * Makes it easier to use translations throughout the app
 */
export const useTranslations = () => {
  return {
    translateNodeType: (type: string) => translate('nodeType', type),
    translateDifficulty: (difficulty: string) => translate('difficulty', difficulty),
    translateStatus: (status: string) => translate('status', status),
    translateResourceType: (resourceType: string) => translate('resourceType', resourceType),
    translateMatchType: (matchType: string) => translate('matchType', matchType),
    translateCategory: (category: string) => translate('category', category),
    translations // Export raw translations for direct access if needed
  };
};
