import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Check, Play, AlertCircle } from 'lucide-react';
import { LearningNode } from '../types';
import { translateNodeType, translateDifficulty } from '../utils/translations';

export interface CustomNodeData extends Record<string, unknown> {
  learningNode: LearningNode;
  isSelected: boolean;
  recommendationScore?: number; // 0-100 for heat map
  glowIntensity?: number; // 0-1 for heat map glow
  heatColor?: string; // CSS color for heat map
  hasIncompletePrerequisites?: boolean; // For soft prerequisite warnings
  fadeLevel?: 'none' | 'context' | 'hidden'; // Focus mode fade state
}

export const CustomLearningNode = memo(({ data, selected }: any) => {
  const { learningNode, isSelected } = data as CustomNodeData;
  const node = learningNode;

  const { recommendationScore, glowIntensity, heatColor, hasIncompletePrerequisites, fadeLevel = 'none' } = data as CustomNodeData;

  const getNodeColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#10B981'; // Green
      case 'in-progress':
        return '#3B82F6'; // Blue
      case 'available':
        return '#1F2937'; // Dark gray
      default:
        return '#6B7280'; // Gray
    }
  };

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check size={20} className="text-white" />;
      case 'in-progress':
        return <Play size={20} className="text-white" />;
      default:
        return <Play size={20} className="text-white" />;
    }
  };

  const nodeColor = getNodeColor(node.status);
  const isCurrentlySelected = selected || isSelected;

  // Heat map glow effect
  const glowStyle = glowIntensity && heatColor && glowIntensity > 0.3
    ? {
        boxShadow: `0 0 ${20 + glowIntensity * 30}px ${heatColor}${Math.round(glowIntensity * 0.6 * 255).toString(16).padStart(2, '0')}`,
      }
    : {};

  // Pulse animation for high recommendations
  const shouldPulse = recommendationScore && recommendationScore >= 85;

  // Calculate opacity based on fade level (Focus Mode)
  const opacity = fadeLevel === 'hidden' ? 0.15 : fadeLevel === 'context' ? 0.7 : 1.0;

  // Multi-category indicator
  const isMultiCategory = node.categoryIds && node.categoryIds.length > 1;
  const categoryCount = node.categoryIds ? node.categoryIds.length : 0;

  return (
    <div className="relative group" style={{ opacity }}>
      {/* Multi-category badge */}
      {isMultiCategory && (
        <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg border-2 border-white dark:border-gray-950">
          +{categoryCount}
        </div>
      )}

      {/* Invisible handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-gray-400 !border-2 !border-white"
      />

      {/* Node container - 200x100px */}
      <div
        className={`relative w-[200px] h-[100px] rounded-xl transition-all duration-200 ${
          shouldPulse ? 'animate-pulse-glow' : ''
        }`}
        style={{
          transform: 'translate(0, 0)', // Prevent default transform
          ...glowStyle,
        }}
      >
        {/* Shadow */}
        <div
          className="absolute inset-0 rounded-xl bg-black opacity-10 translate-x-[3px] translate-y-[3px]"
          style={{ zIndex: -1 }}
        />

        {/* Main card */}
        <div
          className={`w-full h-full rounded-xl bg-white dark:bg-gray-900 border-2 transition-all duration-200 ${
            isCurrentlySelected
              ? 'ring-2 ring-offset-2 dark:ring-offset-gray-950'
              : ''
          }`}
          style={{
            borderColor: isCurrentlySelected ? nodeColor : (heatColor && glowIntensity && glowIntensity > 0.5 ? heatColor : '#E5E7EB'),
          }}
        >
          {/* Status indicator bar */}
          <div
            className="w-full h-2 rounded-t-xl"
            style={{ backgroundColor: nodeColor, opacity: 0.2 }}
          />

          {/* Content */}
          <div className="px-3 py-2">
            {/* Icon and title row */}
            <div className="flex items-start gap-2 mb-2">
              {/* Status icon */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: nodeColor }}
              >
                {getNodeIcon(node.status)}
              </div>

              {/* Title and metadata */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-0.5 truncate">
                  {node.title.length > 25
                    ? node.title.substring(0, 25) + '...'
                    : node.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {translateNodeType(node.type)} • {translateDifficulty(node.difficulty)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {node.progress > 0 && (
              <div className="mb-2">
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${node.progress}%`,
                      backgroundColor: nodeColor,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Time estimate and warnings */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {node.estimatedMinutes} min
              </span>

              {/* Soft prerequisite warning */}
              {hasIncompletePrerequisites && node.status !== 'completed' && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1" title="Some prerequisites not completed">
                  <AlertCircle size={12} />
                </span>
              )}

              {/* High recommendation badge */}
              {recommendationScore && recommendationScore >= 80 && node.status !== 'completed' && (
                <span className="text-xs font-medium text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: heatColor }}>
                  ⭐
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  );
});

CustomLearningNode.displayName = 'CustomLearningNode';
