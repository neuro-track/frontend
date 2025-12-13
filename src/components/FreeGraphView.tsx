import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LearningNode, LearningCategory } from '../types';
import { calculateFreeGraphLayout } from '../utils/graphLayout';
import { Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface FreeGraphViewProps {
  nodes: LearningNode[];
  categories?: LearningCategory[];
  onNodeClick: (node: LearningNode) => void;
}

interface CategoryBounds {
  categoryId: string;
  category: LearningCategory;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * FreeGraphView - Grafo de Aprendizagem Não-Linear
 *
 * Visualiza um roadmap de aprendizagem como um grafo direcionado onde:
 * - Cada nó representa uma unidade de aprendizagem (conceito/habilidade)
 * - Arestas mostram pré-requisitos sugeridos (não bloqueantes)
 * - Layout posiciona nós automaticamente baseado em dependências usando Dagre
 * - Categorias agrupam nós por área de conhecimento
 *
 * O usuário tem total liberdade para escolher qualquer nó, mesmo sem completar
 * pré-requisitos. O grafo serve como guia visual do caminho recomendado.
 *
 * Conceito: "Roadmap quebrado em nós atômicos com aprendizagem não-linear"
 *
 * @param nodes - Array de LearningNodes com pré-requisitos definidos
 * @param onNodeClick - Callback ao clicar em um nó
 */

// Custom node component for learning nodes - Minimalist Design
function CustomNode({ data }: { data: any }) {
  const { node, onNodeClick, categories } = data;

  const getStatusColor = (status: string) => {
    if (status === 'completed') return '#10b981';
    if (status === 'in-progress') return '#3b82f6';
    return '#e5e7eb';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return '✓';
    if (status === 'in-progress') return '●';
    return '';
  };

  // Get primary category (first one) for visual indicator
  const primaryCategory = categories?.find((cat: any) =>
    node.categoryIds?.includes(cat.id)
  );

  const statusColor = getStatusColor(node.status);
  const isAvailable = node.status === 'available';

  return (
    <div
      onClick={() => onNodeClick(node)}
      className="relative cursor-pointer group"
      style={{ width: 120, height: 90 }}
    >
      {/* Clean card design */}
      <div
        className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg transition-all duration-200 group-hover:shadow-lg border-2"
        style={{
          borderColor: statusColor,
          boxShadow: isAvailable ? 'none' : `0 2px 4px ${statusColor}20`,
        }}
      >
        {/* Status indicator bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
          style={{ backgroundColor: statusColor }}
        />

        {/* Category indicator - small colored dot on top-right */}
        {primaryCategory && (
          <div
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
            style={{ backgroundColor: primaryCategory.color }}
            title={primaryCategory.name}
          />
        )}

        {/* Content */}
        <div className="p-2 pt-3 h-full flex flex-col">
          {/* Title */}
          <div className="flex-1 flex items-center justify-center text-center">
            <span className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
              {node.title}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
            {/* Status icon */}
            <span
              className="text-xs font-semibold"
              style={{ color: statusColor }}
            >
              {getStatusIcon(node.status)}
            </span>

            {/* Difficulty dots */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-1 h-1 rounded-full"
                  style={{
                    backgroundColor:
                      level <=
                        (node.difficulty === 'beginner' ? 1 :
                         node.difficulty === 'intermediate' ? 2 :
                         node.difficulty === 'advanced' ? 3 : 4)
                        ? '#6b7280'
                        : '#e5e7eb',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {node.progress > 0 && node.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${node.progress}%`,
                backgroundColor: statusColor,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Minimalist category cluster design
function CategoryClusterNode({ data }: { data: any }) {
  const { category, width, height } = data;

  return (
    <div
      className="pointer-events-none"
      style={{
        width,
        height,
        position: 'relative',
      }}
    >
      {/* Subtle background */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          backgroundColor: `${category.color}08`,
          border: `1px solid ${category.color}20`,
        }}
      />

      {/* Simple category label */}
      <div className="absolute top-4 left-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border"
          style={{
            borderColor: `${category.color}30`,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <span className="text-sm">{category.icon}</span>
          <span
            className="text-xs font-medium"
            style={{ color: category.color }}
          >
            {category.name}
          </span>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
  categoryCluster: CategoryClusterNode,
};

export function FreeGraphView({ nodes, categories, onNodeClick }: FreeGraphViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCategoryGroups, setShowCategoryGroups] = useState(true);

  // Apply intelligent layout using Dagre algorithm
  // This positions nodes hierarchically based on prerequisite relationships
  const nodesWithLayout = useMemo(() => calculateFreeGraphLayout(nodes), [nodes]);

  // BUG FIX 4: Calculate bounding boxes for each category (não depende de showCategoryGroups)
  const categoryBounds = useMemo((): CategoryBounds[] => {
    if (!categories) return [];

    return categories
      .map((category) => {
        // Find all nodes belonging to this category
        const categoryNodes = nodesWithLayout.filter(
          (node) => node.categoryIds?.includes(category.id)
        );

        // BUG FIX 5: Validar que há nós antes de calcular min/max
        if (categoryNodes.length === 0) return null;

        // Calculate bounding box with padding
        const padding = 60;
        const positions = categoryNodes.map((n) => n.position);
        const minX = Math.min(...positions.map((p) => p.x)) - padding;
        const maxX = Math.max(...positions.map((p) => p.x)) + 120 + padding;
        const minY = Math.min(...positions.map((p) => p.y)) - padding;
        const maxY = Math.max(...positions.map((p) => p.y)) + 90 + padding;

        return {
          categoryId: category.id,
          category,
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
        };
      })
      .filter((bounds): bounds is CategoryBounds => bounds !== null);
  }, [categories, nodesWithLayout]);

  // Convert LearningNodes to ReactFlow nodes with calculated positions
  const flowNodes: Node[] = useMemo(() => {
    const learningNodes: Node[] = nodesWithLayout.map((node) => ({
      id: node.id,
      type: 'custom',
      position: { x: node.position.x, y: node.position.y },
      data: { node, onNodeClick, categories }, // Pass categories to node
      zIndex: 10, // Learning nodes on top
    }));

    // BUG FIX 2: Add category cluster nodes (aparecem atrás dos learning nodes)
    const clusterNodes: Node[] = showCategoryGroups
      ? categoryBounds.map((bounds) => ({
          id: `category-${bounds.categoryId}`,
          type: 'categoryCluster',
          position: { x: bounds.x, y: bounds.y },
          data: {
            category: bounds.category,
            width: bounds.width,
            height: bounds.height,
          },
          draggable: false,
          selectable: false,
          zIndex: 0, // Category clusters in background
        }))
      : [];

    return [...clusterNodes, ...learningNodes];
  }, [nodesWithLayout, onNodeClick, showCategoryGroups, categoryBounds, categories]);

  // Convert prerequisites to edges - Minimalist design
  const flowEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    nodes.forEach((node) => {
      if (node.prerequisites) {
        node.prerequisites.forEach((prereqId) => {
          if (nodes.find((n) => n.id === prereqId)) {
            const sourceNode = nodes.find((n) => n.id === prereqId);
            const targetNode = node;

            let edgeColor = '#d1d5db'; // gray-300 - subtle default
            let strokeWidth = 1.5;

            // Minimal color feedback
            if (sourceNode?.status === 'completed' && targetNode.status === 'completed') {
              edgeColor = '#10b981'; // green - completed path
              strokeWidth = 2;
            } else if (targetNode.status === 'in-progress') {
              edgeColor = '#3b82f6'; // blue - active
              strokeWidth = 2;
            } else if (sourceNode?.status === 'completed') {
              edgeColor = '#9ca3af'; // gray-400 - available
              strokeWidth = 1.5;
            }

            edges.push({
              id: `${prereqId}-${node.id}`,
              source: prereqId,
              target: node.id,
              type: 'smoothstep',
              animated: false, // No animations for clean look
              style: {
                stroke: edgeColor,
                strokeWidth,
              },
              markerEnd: {
                type: 'arrowclosed',
                color: edgeColor,
                width: 16,
                height: 16,
              },
            });
          }
        });
      }
    });
    return edges;
  }, [nodes]);

  const [flowNodesState, setFlowNodesState, onNodesChange] = useNodesState(flowNodes);
  const [flowEdgesState, setFlowEdgesState, onEdgesChange] = useEdgesState(flowEdges);

  // BUG FIX 1: Sincronizar estados quando flowNodes/flowEdges mudam
  useEffect(() => {
    setFlowNodesState(flowNodes);
  }, [flowNodes, setFlowNodesState]);

  useEffect(() => {
    setFlowEdgesState(flowEdges);
  }, [flowEdges, setFlowEdgesState]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div
      className={`relative bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-none border-0' : 'h-[600px]'
      }`}
    >
      <ReactFlow
        nodes={flowNodesState}
        edges={flowEdgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2}
        elevateNodesOnSelect={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={0.5}
          color="#e5e7eb"
          className="dark:opacity-20"
        />
        <Controls
          showInteractive={false}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
        />
        <MiniMap
          nodeColor={(node: any) => {
            const status = node.data?.node?.status;
            if (status === 'completed') return '#10b981';
            if (status === 'in-progress') return '#3b82f6';
            return '#e5e7eb';
          }}
          maskColor="rgba(0, 0, 0, 0.05)"
          position="bottom-right"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
        />
      </ReactFlow>

      {/* Minimalist Action buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* Category groups toggle */}
        {categories && categories.length > 0 && (
          <button
            onClick={() => setShowCategoryGroups(!showCategoryGroups)}
            className="p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            title={showCategoryGroups ? 'Ocultar Categorias' : 'Mostrar Categorias'}
          >
            {showCategoryGroups ? (
              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          title={isFullscreen ? 'Sair' : 'Tela Cheia'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Minimalist Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm max-w-md">
        <div className="flex flex-col gap-3">
          {/* Status indicators */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Completo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Ativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Disponível</span>
            </div>
          </div>

          {/* Category indicators (if categories exist) */}
          {categories && categories.length > 0 && (
            <div className="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Categorias:</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.slice(0, 4).map((category) => (
                  <div key={category.id} className="flex items-center gap-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{category.name}</span>
                  </div>
                ))}
                {categories.length > 4 && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">+{categories.length - 4}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
