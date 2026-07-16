import { Edge, Node } from '../types/graph';

export function createNode(x: number, y: number, nextNodeNumber: number): Node {
  return {
    id: `node_${Date.now()}`,
    x,
    y,
    label: `V${nextNodeNumber}`,
  };
}

export function moveNode(
  nodes: Node[],
  nodeId: string,
  x: number,
  y: number
): Node[] {
  return nodes.map((node) => (node.id === nodeId ? { ...node, x, y } : node));
}

export function removeNodeAndConnectedEdges(
  nodes: Node[],
  edges: Edge[],
  nodeId: string
) {
  return {
    nodes: nodes.filter((node) => node.id !== nodeId),
    edges: edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ),
  };
}

export function appendEdgeIfValid(
  edges: Edge[],
  source: string,
  target: string,
  nextEdgeNumber: number
) {
  if (source === target) {
    return {
      created: false,
      edges,
      nextEdgeNumber,
    };
  }

  const hasDuplicate = edges.some(
    (edge) => edge.source === source && edge.target === target
  );

  if (hasDuplicate) {
    return {
      created: false,
      edges,
      nextEdgeNumber,
    };
  }

  return {
    created: true,
    edges: [
      ...edges,
      {
        id: `edge_${nextEdgeNumber}`,
        source,
        target,
      },
    ],
    nextEdgeNumber: nextEdgeNumber + 1,
  };
}
