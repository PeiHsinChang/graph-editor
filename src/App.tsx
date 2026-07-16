import SvgCanvas from './components/SvgCanvas';
import StatusPanel from './components/StatusPanel';
import { useGraphEditor } from './hooks/useGraphEditor';

export default function App() {
  const {
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
  } = useGraphEditor();

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
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
                data-testid="mode-select"
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
                data-testid="mode-add-edge"
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
              onClick={clearCanvas}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-medium"
            >
              清空畫布
            </button>
          </div>
        </div>

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

          <StatusPanel
            nodeCount={nodes.length}
            edgeCount={edges.length}
            editorMode={editorMode}
            selectedNodeId={selectedNodeId}
            pendingEdgeSourceId={pendingEdgeSourceId}
          />
        </div>
      </div>
    </div>
  );
}
