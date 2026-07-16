// src/App.tsx
import { useEffect, useState } from 'react';
import SvgCanvas from './components/SvgCanvas';
import { Node, Edge, EditorMode, Point } from './types/graph';

export default function App() {
  // 集中管理拓撲圖的核心狀態
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nextNodeNumber, setNextNodeNumber] = useState(1);
  const [nextEdgeNumber, setNextEdgeNumber] = useState(1);
  const [editorMode, setEditorMode] = useState<EditorMode>('SELECT');
  const [pendingEdgeSourceId, setPendingEdgeSourceId] = useState<string | null>(null);
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

  // 新增節點的業務邏輯
  const handleAddNode = (x: number, y: number) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      x,
      y,
      label: `V${nextNodeNumber}`, // 使用獨立流水號，避免刪除後重複
    };
    setNodes((prev) => [...prev, newNode]);
    setNextNodeNumber((prev) => prev + 1);
  };

  const handleMoveNode = (nodeId: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, x, y } : node))
    );
  };

  const resetEdgeDraft = () => {
    setPendingEdgeSourceId(null);
    setPreviewPoint(null);
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

    const hasDuplicate = edges.some(
      (edge) =>
        edge.source === pendingEdgeSourceId && edge.target === targetNodeId
    );

    if (!hasDuplicate) {
      setEdges((prev) => [
        ...prev,
        {
          id: `edge_${nextEdgeNumber}`,
          source: pendingEdgeSourceId,
          target: targetNodeId,
        },
      ]);
      setNextEdgeNumber((prev) => prev + 1);
    }

    setSelectedNodeId(targetNodeId);
    resetEdgeDraft();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedNodeId) return;
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;

      event.preventDefault();
      setNodes((prev) => prev.filter((node) => node.id !== selectedNodeId));
      setEdges((prev) =>
        prev.filter(
          (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
        )
      );
      if (pendingEdgeSourceId === selectedNodeId) {
        resetEdgeDraft();
      }
      setSelectedNodeId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingEdgeSourceId, selectedNodeId]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 頂部控制列 */}   
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Interactive Graph Editor</h1>
            <p className="text-slate-500 mt-1">
              `SELECT` 模式可拖曳節點，`ADD_EDGE` 模式可建立節點連線。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => handleModeChange('SELECT')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  editorMode === 'SELECT'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                SELECT
              </button>
              <button
                onClick={() => handleModeChange('ADD_EDGE')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  editorMode === 'ADD_EDGE'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                ADD_EDGE
              </button>
            </div>

            <button 
              onClick={() => {
                setNodes([]);
                setEdges([]);
                setSelectedNodeId(null);
                setNextNodeNumber(1);
                setNextEdgeNumber(1);
                resetEdgeDraft();
              }}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-medium"
            >
              清空畫布
            </button>
          </div>
        </div>

        {/* 畫布與狀態檢視區 */}
        <div className="grid grid-cols-4 gap-6 border-1 border-slate-200 rounded-xl p-4 bg-white shadow-sm">
          <div className="col-span-3">
            <SvgCanvas 
              nodes={nodes} 
              edges={edges} 
              editorMode={editorMode}
              selectedNodeId={selectedNodeId}
              pendingEdgeSourceId={pendingEdgeSourceId}
              previewPoint={previewPoint}
              onAddNode={handleAddNode}
              onMoveNode={handleMoveNode}
              onPreviewEdge={handlePreviewEdge}
              onSelectNode={setSelectedNodeId}
              onStartEdge={handleStartEdge}
              onCompleteEdge={handleCompleteEdge}
              onCancelEdgeDraft={resetEdgeDraft}
            />
          </div>
          
          {/* Debug 面板：即時檢視狀態，符合資料驅動的開發習慣 */}
          <div className="col-span-1 bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">當前狀態</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 font-medium">總節點數</p>
                <p className="text-2xl font-bold">{nodes.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">總連線數</p>
                <p className="text-2xl font-bold">{edges.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">目前模式</p>
                <p className="text-sm font-mono bg-slate-100 p-2 rounded mt-1">
                  {editorMode}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">選取的節點 ID</p>
                <p className="text-sm font-mono bg-slate-100 p-2 rounded break-all mt-1">
                  {selectedNodeId || '無'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">連線起點</p>
                <p className="text-sm font-mono bg-slate-100 p-2 rounded break-all mt-1">
                  {pendingEdgeSourceId || '無'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">快捷鍵</p>
                <p className="text-sm bg-slate-100 p-2 rounded mt-1">
                  `Delete` / `Backspace` 可刪除選取節點
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
