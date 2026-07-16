// src/types/graph.ts

// 明確區分 Node 與 Edge 的型別，這就是正規化 (Normalized) 的基礎
export interface Node {
  id: string;
  x: number;
  y: number;
  label: string; // 例如：V1, V2
}

export interface Edge {
  id: string;
  source: string; // 記錄起點 Node 的 ID
  target: string; // 記錄終點 Node 的 ID
}