import { useQuery } from '@tanstack/react-query';
import { useLearningStore } from '../store/useLearningStore';

export const useRoadmap = () => {
  const { roadmap, loadRoadmap } = useLearningStore();

  return useQuery({
    queryKey: ['roadmap'],
    queryFn: async () => {
      await loadRoadmap();
      return useLearningStore.getState().roadmap;
    },
    initialData: roadmap,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
