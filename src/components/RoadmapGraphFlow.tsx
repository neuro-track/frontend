import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LearningNode } from '../types';
import { CustomLearningNode, CustomNodeData } from './CustomLearningNode';
import { convertToFlowElements, getLayoutedElements, getFocusedSubgraph } from '../utils/graphLayout';
import { useRecommendations } from '../hooks/useRecommendations';

interface RoadmapGraphFlowProps {
  nodes: LearningNode[];
  onNodeClick: (node: LearningNode) => void;
  selectedNodeId?: string;
  enableRecommendations?: boolean;
}

const nodeTypes: NodeTypes = {
  customLearning: CustomLearningNode,
};

const RoadmapGraphFlowInner = ({
  nodes: learningNodes,
  onNodeClick,
  selectedNodeId,
  enableRecommendations = true,
}: RoadmapGraphFlowProps) => {
  // State for personalized path toggle
  const [showPersonalizedPath, setShowPersonalizedPath] = useState(true);

  // State for focus mode
  const [focusMode, setFocusMode] = useState(false);
  const [focusCount, setFocusCount] = useState(8);

  // Get AI recommendations
  const { topRecommendations, recommendationMap, hasIncompletePrerequisites, personalizedPath } = useRecommendations(
    learningNodes,
    {
      enableRecommendations,
      limit: focusMode ? focusCount * 2 : 10 // Get more if in focus mode
    }
  );

  // Calculate focused subgraph for focus mode
  const { focusedNodeIds, contextNodeIds } = useMemo(() => {
    if (!focusMode || !enableRecommendations) {
      return { focusedNodeIds: new Set<string>(), contextNodeIds: new Set<string>() };
    }
    return getFocusedSubgraph(learningNodes, topRecommendations, focusCount);
  }, [focusMode, learningNodes, topRecommendations, focusCount, enableRecommendations]);

  // Convert and layout nodes with recommendation data
  const { nodes, edges } = useMemo(() => {
    const { nodes: flowNodes, edges: flowEdges } = convertToFlowElements(
      learningNodes,
      selectedNodeId,
      recommendationMap,
      hasIncompletePrerequisites,
      showPersonalizedPath ? personalizedPath : undefined,
      focusMode,
      focusedNodeIds,
      contextNodeIds
    );

    // Always use Dagre graph layout
    return getLayoutedElements(flowNodes, flowEdges, {
      direction: 'TB',
      rankSep: 150,
      nodeSep: 100,
    });
  }, [learningNodes, selectedNodeId, recommendationMap, hasIncompletePrerequisites, personalizedPath, showPersonalizedPath, focusMode, focusedNodeIds, contextNodeIds]);

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<CustomNodeData>) => {
      if (node.data.learningNode) {
        onNodeClick(node.data.learningNode);
      }
    },
    [onNodeClick]
  );

  // Get node color for minimap
  const getNodeColor = (node: Node): string => {
    const nodeData = node.data as CustomNodeData;
    const status = nodeData.learningNode.status;
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

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        attributionPosition="bottom-left"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        {/* SVG gradient definition for personalized path */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <linearGradient id="gradient-path" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dot pattern background */}
        <Background
          color="#94a3b8"
          gap={16}
          size={1}
          className="bg-gray-50 dark:bg-gray-950"
        />

        {/* Minimap in bottom-right */}
        <MiniMap
          nodeColor={getNodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-gray-100 dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        />

        {/* Zoom and fit controls */}
        <Controls
          showInteractive={false}
          className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-700 !shadow-lg"
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-lg max-w-[200px]">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Status
          </h4>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Em Progresso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-900 dark:bg-gray-100"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Disponível</span>
            </div>
          </div>

          {enableRecommendations && (
            <>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                Recomendações IA
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" style={{ boxShadow: '0 0 8px #EF4444' }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Combinação perfeita</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" style={{ boxShadow: '0 0 6px #F59E0B' }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Bom próximo passo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" style={{ boxShadow: '0 0 4px #10B981' }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Corresponde interesses</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-2 shadow-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Dica:</span> Arraste para mover • Role para zoom • Clique
            nos nós para ver detalhes
          </p>
        </div>

        {/* Personalized path toggle */}
        {enableRecommendations && personalizedPath.length > 0 && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg p-2 z-[1000] pointer-events-auto">
            <button
              onClick={() => setShowPersonalizedPath(!showPersonalizedPath)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showPersonalizedPath
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>🎯</span>
              <span>{showPersonalizedPath ? 'Ocultar Caminho' : 'Mostrar Caminho'}</span>
            </button>
          </div>
        )}

        {/* Focus mode controls */}
        {enableRecommendations && topRecommendations.length > 0 && (
          <div className="absolute top-20 right-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg p-3 space-y-2 z-[1000] pointer-events-auto">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                focusMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🔍</span>
                <span>Modo Foco</span>
              </span>
              {focusMode && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                  {focusedNodeIds.size} nós
                </span>
              )}
            </button>

            {focusMode && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Quantidade de nós:
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={focusCount}
                  onChange={(e) => setFocusCount(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span className="font-medium text-purple-600">{focusCount}</span>
                  <span>15</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

// Wrap with ReactFlowProvider
export const RoadmapGraphFlow = (props: RoadmapGraphFlowProps) => {
  return (
    <ReactFlowProvider>
      <RoadmapGraphFlowInner {...props} />
    </ReactFlowProvider>
  );
};
