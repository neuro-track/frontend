import { useRef, useState } from 'react';
import { LearningNode } from '../types';
import { Check, Lock, Play, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface RoadmapGraphProps {
  nodes: LearningNode[];
  onNodeClick: (node: LearningNode) => void;
  selectedNodeId?: string;
}

interface Position {
  x: number;
  y: number;
}

export const RoadmapGraph = ({ nodes, onNodeClick, selectedNodeId }: RoadmapGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate better layout positions
  const layoutNodes = (): Map<string, Position> => {
    const positions = new Map<string, Position>();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const levels = new Map<string, number>();

    // Calculate level for each node (topological sort)
    const calculateLevel = (nodeId: string): number => {
      if (levels.has(nodeId)) return levels.get(nodeId)!;

      const node = nodeMap.get(nodeId);
      if (!node) return 0;

      if (node.prerequisites.length === 0) {
        levels.set(nodeId, 0);
        return 0;
      }

      const maxPrereqLevel = Math.max(
        ...node.prerequisites.map(prereqId => calculateLevel(prereqId))
      );
      const level = maxPrereqLevel + 1;
      levels.set(nodeId, level);
      return level;
    };

    // Calculate levels for all nodes
    nodes.forEach(node => calculateLevel(node.id));

    // Group nodes by level
    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, nodeId) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(nodeId);
    });

    // Position nodes
    const horizontalSpacing = 280;
    const verticalSpacing = 180;
    const nodeWidth = 200;
    const startX = 100;
    const startY = 100;

    levelGroups.forEach((nodeIds, level) => {
      const levelWidth = nodeIds.length * horizontalSpacing;
      const levelStartX = startX + (horizontalSpacing - levelWidth) / 2;

      nodeIds.forEach((nodeId, index) => {
        const x = levelStartX + index * horizontalSpacing + nodeWidth / 2;
        const y = startY + level * verticalSpacing;
        positions.set(nodeId, { x, y });
      });
    });

    return positions;
  };

  const positions = layoutNodes();
  const viewBox = `0 0 1200 800`;

  const getNodeColor = (node: LearningNode): string => {
    switch (node.status) {
      case 'completed':
        return '#10B981';
      case 'in-progress':
        return '#3B82F6';
      case 'available':
        return '#1F2937';
        return '#D1D5DB';
      default:
        return '#E5E7EB';
    }
  };

  const getNodeIcon = (node: LearningNode) => {
    switch (node.status) {
      case 'completed':
        return <Check size={20} className="text-white" />;
      case 'in-progress':
        return <Play size={20} className="text-white" />;
        return <Lock size={20} className="text-white" />;
      default:
        return <Play size={20} className="text-white" />;
    }
  };

  // Create bezier curve paths
  const connections = nodes.flatMap(node => {
    const toPos = positions.get(node.id);
    if (!toPos) return [];

    return node.prerequisites.map(prereqId => {
      const fromPos = positions.get(prereqId);
      if (!fromPos) return null;

      const fromNode = nodes.find(n => n.id === prereqId);
      const isCompleted = fromNode?.status === 'completed';

      // Bezier curve control points
      const midY = (fromPos.y + toPos.y) / 2;
      const path = `M ${fromPos.x} ${fromPos.y + 50}
                    C ${fromPos.x} ${midY},
                      ${toPos.x} ${midY},
                      ${toPos.x} ${toPos.y - 50}`;

      return {
        path,
        isCompleted,
        from: prereqId,
        to: node.id,
      };
    }).filter(Boolean);
  }).filter((conn): conn is NonNullable<typeof conn> => conn !== null);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale + delta))
    }));
  };

  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={viewBox}
        style={{ minHeight: '600px' }}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Connection paths */}
          <g className="connections">
            {connections.map((conn, idx) => (
              <g key={idx}>
                <path
                  d={conn.path}
                  stroke={conn.isCompleted ? '#10B981' : '#E5E7EB'}
                  strokeWidth={conn.isCompleted ? 3 : 2}
                  fill="none"
                  opacity={0.6}
                  className="transition-all duration-300"
                />
                {/* Arrow marker */}
                <circle
                  cx={positions.get(conn.to)?.x || 0}
                  cy={(positions.get(conn.to)?.y || 0) - 50}
                  r={4}
                  fill={conn.isCompleted ? '#10B981' : '#E5E7EB'}
                />
              </g>
            ))}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodes.map(node => {
              const pos = positions.get(node.id);
              if (!pos) return null;

              const isSelected = node.id === selectedNodeId;
              const isHovered = node.id === hoveredNodeId;
              const nodeColor = getNodeColor(node);
              const scale = isHovered ? 1.05 : 1;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x - 100}, ${pos.y - 50})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeClick(node);
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {/* Node shadow */}
                  <rect
                    x="3"
                    y="3"
                    width="200"
                    height="100"
                    rx="12"
                    fill="black"
                    opacity="0.1"
                  />

                  {/* Node background */}
                  <rect
                    width="200"
                    height="100"
                    rx="12"
                    fill="white"
                    stroke={isSelected ? nodeColor : '#E5E7EB'}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Status indicator bar */}
                  <rect
                    width="200"
                    height="8"
                    rx="12"
                    fill={nodeColor}
                    opacity={0.2}
                  />

                  {/* Status icon */}
                  <foreignObject x="12" y="20" width="32" height="32">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{ backgroundColor: nodeColor }}
                    >
                      {getNodeIcon(node)}
                    </div>
                  </foreignObject>

                  {/* Node title */}
                  <foreignObject x="52" y="20" width="140" height="60">
                    <div className="px-2">
                      <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                        {node.title.length > 25
                          ? node.title.substring(0, 25) + '...'
                          : node.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {node.type} • {node.difficulty}
                      </p>
                    </div>
                  </foreignObject>

                  {/* Progress bar */}
                  {node.progress > 0 && (
                    <>
                      <rect
                        x="12"
                        y="75"
                        width="176"
                        height="4"
                        rx="2"
                        fill="#E5E7EB"
                      />
                      <rect
                        x="12"
                        y="75"
                        width={176 * (node.progress / 100)}
                        height="4"
                        rx="2"
                        fill={nodeColor}
                      />
                    </>
                  )}

                  {/* Time estimate */}
                  <text
                    x="12"
                    y="92"
                    fontSize="11"
                    fill="#9CA3AF"
                    className="pointer-events-none"
                  >
                    {node.estimatedMinutes} min
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(0.2)}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          title="Zoom In"
        >
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          title="Zoom Out"
        >
          <ZoomOut size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          title="Reset View"
        >
          <Maximize2 size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Status</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="text-xs text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-xs text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-900"></div>
            <span className="text-xs text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-xs text-gray-700">Locked</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Tip:</span> Drag to pan • Scroll to zoom
        </p>
      </div>
    </div>
  );
};
