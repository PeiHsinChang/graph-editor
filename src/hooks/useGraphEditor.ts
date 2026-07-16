import { useEffect, useState } from 'react';
import { Edge, EditorMode, Node, Point } from '../types/graph';
import {
  appendEdgeIfValid,
  createNode,
  moveNode,
  removeNodeAndConnectedEdges,
} from '../lib/graph';

export function useGraphEditor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nextNodeNumber, setNextNodeNumber] = useState(1);
  const [nextEdgeNumber, setNextEdgeNumber] = useState(1);
  const [editorMode, setEditorMode] = useState<EditorMode>('SELECT');
  const [pendingEdgeSourceId, setPendingEdgeSourceId] = useState<string | null>(null);
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

  const resetEdgeDraft = () => {
    setPendingEdgeSourceId(null);
    setPreviewPoint(null);
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setNextNodeNumber(1);
    setNextEdgeNumber(1);
    resetEdgeDraft();
  };

  const handleAddNode = (x: number, y: number) => {
    const newNode = createNode(x, y, nextNodeNumber);
    setNodes((prev) => [...prev, newNode]);
    setNextNodeNumber((prev) => prev + 1);
  };

  const handleMoveNode = (nodeId: string, x: number, y: number) => {
    setNodes((prev) => moveNode(prev, nodeId, x, y));
  };

  const handleModeChange = (mode: EditorMode) => {
    setEditorMode(mode);
    resetEdgeDraft();
  };

  const handleStartEdge = (sourceNodeId: string) => {
    setSelectedNodeId(sourceNodeId);
    setPendingEdgeSourceId(sourceNodeId);
    setPreviewPoint(null);
  };

  const handlePreviewEdge = (point: Point | null) => {
    if (editorMode !== 'ADD_EDGE' || !pendingEdgeSourceId) return;
    setPreviewPoint(point);
  };

  const handleCompleteEdge = (targetNodeId: string) => {
    if (!pendingEdgeSourceId || pendingEdgeSourceId === targetNodeId) {
      resetEdgeDraft();
      return;
    }

    const result = appendEdgeIfValid(
      edges,
      pendingEdgeSourceId,
      targetNodeId,
      nextEdgeNumber
    );

    if (result.created) {
      setEdges(result.edges);
      setNextEdgeNumber(result.nextEdgeNumber);
    }

    setSelectedNodeId(targetNodeId);
    resetEdgeDraft();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedNodeId) return;
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;

      event.preventDefault();
      const result = removeNodeAndConnectedEdges(nodes, edges, selectedNodeId);
      setNodes(result.nodes);
      setEdges(result.edges);

      if (pendingEdgeSourceId === selectedNodeId) {
        resetEdgeDraft();
      }

      setSelectedNodeId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [edges, nodes, pendingEdgeSourceId, selectedNodeId]);

  return {
    nodes,
    edges,
    editorMode,
    selectedNodeId,
    pendingEdgeSourceId,
    previewPoint,
    clearCanvas,
    handleAddNode,
    handleMoveNode,
    handleModeChange,
    handlePreviewEdge,
    handleStartEdge,
    handleCompleteEdge,
    resetEdgeDraft,
    setSelectedNodeId,
  };
}
