import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { LearningNode } from '../types';
import { CustomNodeData } from '../components/CustomLearningNode';
import { NodeRecommendation } from './recommendationEngine';

interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
  edgeSep?: number;
}

const defaultOptions: LayoutOptions = {
  direction: 'TB',
  nodeWidth: 200,
  nodeHeight: 100,
  rankSep: 150,
  nodeSep: 100,
  edgeSep: 50,
};

/**
 * Convert LearningNode array to ReactFlow nodes and edges
 */
export const convertToFlowElements = (
  learningNodes: LearningNode[],
  selectedNodeId?: string,
  recommendationMap?: Map<string, NodeRecommendation>,
  hasIncompletePrerequisites?: (node: LearningNode) => boolean,
  personalizedPath?: string[],
  focusMode?: boolean,
  focusedNodeIds?: Set<string>,
  contextNodeIds?: Set<string>
): { nodes: Node<CustomNodeData>[]; edges: Edge[] } => {
  // Create ReactFlow nodes
  const nodes: Node<CustomNodeData>[] = learningNodes.map((learningNode) => {
    const recommendation = recommendationMap?.get(learningNode.id);

    // Determine fade level for Focus Mode
    let fadeLevel: 'none' | 'context' | 'hidden' = 'none';
    if (focusMode) {
      if (focusedNodeIds?.has(learningNode.id)) {
        fadeLevel = 'none'; // In focus - full opacity
      } else if (contextNodeIds?.has(learningNode.id)) {
        fadeLevel = 'context'; // Context (prerequisites) - 70% opacity
      } else {
        fadeLevel = 'hidden'; // Out of focus - 15% opacity
      }
    }

    return {
      id: learningNode.id,
      type: 'customLearning',
      position: { x: 0, y: 0 }, // Will be set by layout algorithm
      data: {
        learningNode,
        isSelected: learningNode.id === selectedNodeId,
        // Add recommendation data for heat map
        recommendationScore: recommendation?.score,
        glowIntensity: recommendation?.glowIntensity,
        heatColor: recommendation?.heatColor,
        hasIncompletePrerequisites: hasIncompletePrerequisites?.(learningNode) ?? false,
        fadeLevel, // Focus Mode opacity
      },
      draggable: false,
      selectable: fadeLevel !== 'hidden', // Only allow selection of visible nodes
    };
  });

  // Create edges with path highlighting
  const edges: Edge[] = [];
  const pathEdges = new Set<string>();

  // Identify edges in personalized path
  if (personalizedPath && personalizedPath.length > 1) {
    for (let i = 0; i < personalizedPath.length - 1; i++) {
      const sourceId = personalizedPath[i];
      const targetId = personalizedPath[i + 1];

      // Check if there's actually an edge between these nodes
      const targetNode = learningNodes.find(n => n.id === targetId);
      if (targetNode?.prerequisites.includes(sourceId)) {
        pathEdges.add(`${sourceId}-${targetId}`);
      }
    }
  }

  learningNodes.forEach((node) => {
    node.prerequisites.forEach((prereqId) => {
      const edgeId = `${prereqId}-${node.id}`;
      const sourceNode = learningNodes.find((n) => n.id === prereqId);
      const isCompleted = sourceNode?.status === 'completed';
      const isInPath = pathEdges.has(edgeId);

      edges.push({
        id: edgeId,
        source: prereqId,
        target: node.id,
        type: 'smoothstep',
        animated: isInPath, // Animate path edges
        className: isInPath ? 'personalized-path-edge' : '',
        style: {
          stroke: isInPath
            ? 'url(#gradient-path)' // Use gradient for path
            : (isCompleted ? '#10B981' : '#E5E7EB'),
          strokeWidth: isInPath ? 4 : (isCompleted ? 3 : 2),
        },
        markerEnd: {
          type: 'arrowclosed',
          color: isInPath ? '#8B5CF6' : (isCompleted ? '#10B981' : '#E5E7EB'),
        },
      });
    });
  });

  return { nodes, edges };
};

/**
 * Get focused subgraph - top N recommendations + their prerequisites
 * Used for Focus Mode to filter which nodes to highlight
 */
export const getFocusedSubgraph = (
  allNodes: LearningNode[],
  topRecommendations: NodeRecommendation[],
  focusCount: number = 8
): {
  focusedNodeIds: Set<string>;
  contextNodeIds: Set<string>;
} => {
  const focusedNodeIds = new Set<string>();
  const contextNodeIds = new Set<string>();

  // Get top N recommendations (excluding completed)
  const recommendations = topRecommendations
    .filter(rec => {
      const node = allNodes.find(n => n.id === rec.nodeId);
      return node && node.status !== 'completed';
    })
    .slice(0, focusCount);

  // Add recommended nodes to focus set
  recommendations.forEach(rec => focusedNodeIds.add(rec.nodeId));

  // Recursively add ALL prerequisites to context (including completed ones)
  const addPrerequisitesToContext = (nodeId: string) => {
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      node.prerequisites.forEach(prereqId => {
        if (!focusedNodeIds.has(prereqId) && !contextNodeIds.has(prereqId)) {
          contextNodeIds.add(prereqId);
          // Recursively add prerequisites of prerequisites
          addPrerequisitesToContext(prereqId);
        }
      });
    }
  };

  // Add all prerequisites for focused nodes
  recommendations.forEach(rec => {
    addPrerequisitesToContext(rec.nodeId);
  });

  return { focusedNodeIds, contextNodeIds };
};


/**
 * Apply dagre layout algorithm to position nodes
 */
export const getLayoutedElements = (
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node<CustomNodeData>[]; edges: Edge[] } => {
  const opts = { ...defaultOptions, ...options };

  // Create dagre graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
    edgesep: opts.edgeSep,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply positions to nodes
  const layoutedNodes: Node<CustomNodeData>[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        // Dagre positions are center-based, ReactFlow positions are top-left
        x: nodeWithPosition.x - (opts.nodeWidth! / 2),
        y: nodeWithPosition.y - (opts.nodeHeight! / 2),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * Get nodes that are highlighted based on selection
 * Returns prerequisite and dependent paths
 */
export const getHighlightedPaths = (
  selectedNodeId: string | null,
  learningNodes: LearningNode[]
): { highlightedNodes: Set<string>; highlightedEdges: Set<string> } => {
  if (!selectedNodeId) {
    return { highlightedNodes: new Set(), highlightedEdges: new Set() };
  }

  const highlightedNodes = new Set<string>([selectedNodeId]);
  const highlightedEdges = new Set<string>();

  // Find all prerequisites (backwards)
  const findPrerequisites = (nodeId: string) => {
    const node = learningNodes.find((n) => n.id === nodeId);
    if (!node) return;

    node.prerequisites.forEach((prereqId) => {
      if (!highlightedNodes.has(prereqId)) {
        highlightedNodes.add(prereqId);
        highlightedEdges.add(`${prereqId}-${nodeId}`);
        findPrerequisites(prereqId);
      }
    });
  };

  // Find all dependents (forwards)
  const findDependents = (nodeId: string) => {
    learningNodes.forEach((node) => {
      if (node.prerequisites.includes(nodeId) && !highlightedNodes.has(node.id)) {
        highlightedNodes.add(node.id);
        highlightedEdges.add(`${nodeId}-${node.id}`);
        findDependents(node.id);
      }
    });
  };

  findPrerequisites(selectedNodeId);
  findDependents(selectedNodeId);

  return { highlightedNodes, highlightedEdges };
};

/**
 * Calculate graph bounds for fit view
 */
export const calculateGraphBounds = (
  nodes: Node[]
): { x: number; y: number; width: number; height: number } => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + 200); // node width
    maxY = Math.max(maxY, node.position.y + 100); // node height
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
