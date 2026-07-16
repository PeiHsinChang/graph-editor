// src/components/SvgCanvas.tsx
import React, { useRef } from 'react';
import { Node, Edge } from '../types/graph';

interface SvgCanvasProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onAddNode: (x: number, y: number) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onSelectNode: (id: string | null) => void;
}

export default function SvgCanvas({
  nodes,
  edges,
  selectedNodeId,
  onAddNode,
  onMoveNode,
  onSelectNode,
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

  // 【目標二：畫布座標轉換】
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
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

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const draggingNodeId = draggingNodeIdRef.current;
    if (!draggingNodeId) return;

    const point = getCanvasPoint(e);
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

  return (
    <svg
      ref={svgRef}
      className="w-full h-[600px] bg-white border-2 border-slate-200 rounded-xl shadow-sm cursor-crosshair"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 先畫 Edge (留空，準備 Day 3 實作) */}
      <g className="edges" data-edge-count={edges.length}></g>

      {/* 再畫 Node (確保節點疊在線的上方) */}
      <g className="nodes">
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer"
              // 將事件綁在 g 群組上，點擊圓圈或文字都能觸發
              onMouseDown={(e) => handleNodeMouseDown(e, node)} 
            >
              <circle
                r="24"
                className={`transition-colors duration-200 ${
                  isSelected ? 'fill-blue-100 stroke-blue-500 stroke-[3px]' : 'fill-white stroke-slate-600 stroke-2'
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
