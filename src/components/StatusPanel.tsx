import { EditorMode } from '../types/graph';

interface StatusPanelProps {
  nodeCount: number;
  edgeCount: number;
  editorMode: EditorMode;
  selectedNodeId: string | null;
  pendingEdgeSourceId: string | null;
}

export default function StatusPanel({
  nodeCount,
  edgeCount,
  editorMode,
  selectedNodeId,
  pendingEdgeSourceId,
}: StatusPanelProps) {
  return (
    <div className="col-span-1 bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-lg border-b pb-2 mb-4">當前狀態</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-400 font-medium">總節點數</p>
          <p data-testid="node-count" className="text-2xl font-bold">{nodeCount}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">總連線數</p>
          <p data-testid="edge-count" className="text-2xl font-bold">{edgeCount}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">目前模式</p>
          <p data-testid="current-mode" className="text-sm font-mono bg-slate-100 p-2 rounded mt-1">
            {editorMode}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">選取的節點 ID</p>
          <p data-testid="selected-node-id" className="text-sm font-mono bg-slate-100 p-2 rounded break-all mt-1">
            {selectedNodeId || '無'}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">連線起點</p>
          <p data-testid="pending-edge-source" className="text-sm font-mono bg-slate-100 p-2 rounded break-all mt-1">
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
  );
}
