// src/components/SvgCanvas.tsx
import React, { useRef } from 'react';
import { Node, Edge, EditorMode, Point } from '../types/graph';

interface SvgCanvasProps {
  nodes: Node[];
  edges: Edge[];
  editorMode: EditorMode;
  selectedNodeId: string | null;
  pendingEdgeSourceId: string | null;
  previewPoint: Point | null;
  onAddNode: (x: number, y: number) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onPreviewEdge: (point: Point | null) => void;
  onSelectNode: (id: string | null) => void;
  onStartEdge: (sourceNodeId: string) => void;
  onCompleteEdge: (targetNodeId: string) => void;
  onCancelEdgeDraft: () => void;
}

export default function SvgCanvas({
  nodes,
  edges,
  editorMode,
  selectedNodeId,
  pendingEdgeSourceId,
  previewPoint,
  onAddNode,
  onMoveNode,
  onPreviewEdge,
  onSelectNode,
  onStartEdge,
  onCompleteEdge,
  onCancelEdgeDraft,
}: SvgCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingNodeIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const getCanvasPoint = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;

    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getNodeCenter = (nodeId: string) => nodes.find((node) => node.id === nodeId) ?? null;

  // 【目標二：畫布座標轉換】
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (editorMode === 'ADD_EDGE') {
      onCancelEdgeDraft();
      if (e.target === svgRef.current) {
        onSelectNode(null);
      }
      hasDraggedRef.current = false;
      return;
    }

    if (e.target !== svgRef.current || hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    const point = getCanvasPoint(e);
    if (!point) return;

    // 呼叫外部傳進來的新增節點函式
    onAddNode(point.x, point.y);
    // 點擊空白處同時取消選取目前的節點
    onSelectNode(null); 
  };

  const handleNodeMouseDown = (
    e: React.MouseEvent<SVGGElement>,
    node: Node
  ) => {
    // 關鍵！切斷事件冒泡，防止底層的 handleCanvasClick 被觸發
    e.stopPropagation(); 

    const point = getCanvasPoint(e as React.MouseEvent<SVGSVGElement>);
    if (!point) return;

    draggingNodeIdRef.current = node.id;
    dragOffsetRef.current = {
      x: point.x - node.x,
      y: point.y - node.y,
    };
    hasDraggedRef.current = false;
    onSelectNode(node.id);
  };

  const handleNodeClick = (
    e: React.MouseEvent<SVGGElement>,
    node: Node
  ) => {
    e.stopPropagation();

    if (editorMode !== 'ADD_EDGE') {
      return;
    }

    if (!pendingEdgeSourceId) {
      onStartEdge(node.id);
      return;
    }

    onCompleteEdge(node.id);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getCanvasPoint(e);

    if (editorMode === 'ADD_EDGE') {
      if (pendingEdgeSourceId) {
        onPreviewEdge(point);
      }
      return;
    }

    const draggingNodeId = draggingNodeIdRef.current;
    if (!draggingNodeId) return;
    if (!point) return;

    hasDraggedRef.current = true;
    onMoveNode(
      draggingNodeId,
      point.x - dragOffsetRef.current.x,
      point.y - dragOffsetRef.current.y
    );
  };

  const handleMouseUp = () => {
    draggingNodeIdRef.current = null;
  };

  const pendingEdgeSource = pendingEdgeSourceId
    ? getNodeCenter(pendingEdgeSourceId)
    : null;

  return (
    <svg
      ref={svgRef}
      className={`w-full h-[600px] bg-white border-2 border-slate-200 rounded-xl shadow-sm ${
        editorMode === 'ADD_EDGE' ? 'cursor-alias' : 'cursor-crosshair'
      }`}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        <marker
          id="edge-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-400" />
        </marker>
      </defs>

      <g className="edges" data-edge-count={edges.length}>
        {edges.map((edge) => {
          const sourceNode = getNodeCenter(edge.source);
          const targetNode = getNodeCenter(edge.target);
          if (!sourceNode || !targetNode) return null;

          return (
            <line
              key={edge.id}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              className="stroke-slate-300 stroke-[3px]"
              markerEnd="url(#edge-arrow)"
            />
          );
        })}

        {pendingEdgeSource && previewPoint ? (
          <line
            x1={pendingEdgeSource.x}
            y1={pendingEdgeSource.y}
            x2={previewPoint.x}
            y2={previewPoint.y}
            className="stroke-blue-400 stroke-[3px] opacity-80"
            strokeDasharray="10 8"
            markerEnd="url(#edge-arrow)"
          />
        ) : null}
      </g>

      {/* 再畫 Node (確保節點疊在線的上方) */}
      <g className="nodes">
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isEdgeSource = pendingEdgeSourceId === node.id;
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className={editorMode === 'ADD_EDGE' ? 'cursor-alias' : 'cursor-pointer'}
              // 將事件綁在 g 群組上，點擊圓圈或文字都能觸發
              onMouseDown={(e) => {
                if (editorMode === 'SELECT') {
                  handleNodeMouseDown(e, node);
                }
              }}
              onClick={(e) => handleNodeClick(e, node)}
            >
              <circle
                r="24"
                className={`transition-colors duration-200 ${
                  isEdgeSource
                    ? 'fill-amber-100 stroke-amber-500 stroke-[4px]'
                    : isSelected
                      ? 'fill-blue-100 stroke-blue-500 stroke-[3px]'
                      : 'fill-white stroke-slate-600 stroke-2'
                }`}
              />
              <text
                textAnchor="middle"
                dy=".3em" // 微調文字垂直置中
                className="font-bold text-sm fill-slate-700 select-none pointer-events-none"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
