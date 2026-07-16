import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  appendEdgeIfValid,
  createNode,
  moveNode,
  removeNodeAndConnectedEdges,
} from './graph';

describe('graph utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a node with the expected id and label', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123456789);

    expect(createNode(120, 240, 5)).toEqual({
      id: 'node_123456789',
      x: 120,
      y: 240,
      label: 'V5',
    });
  });

  it('moves only the target node', () => {
    const nodes = [
      { id: 'node_1', x: 10, y: 20, label: 'V1' },
      { id: 'node_2', x: 30, y: 40, label: 'V2' },
    ];

    expect(moveNode(nodes, 'node_1', 100, 120)).toEqual([
      { id: 'node_1', x: 100, y: 120, label: 'V1' },
      { id: 'node_2', x: 30, y: 40, label: 'V2' },
    ]);
  });

  it('removes a node and all connected edges', () => {
    const nodes = [
      { id: 'node_1', x: 0, y: 0, label: 'V1' },
      { id: 'node_2', x: 50, y: 50, label: 'V2' },
      { id: 'node_3', x: 80, y: 80, label: 'V3' },
    ];
    const edges = [
      { id: 'edge_1', source: 'node_1', target: 'node_2' },
      { id: 'edge_2', source: 'node_3', target: 'node_1' },
      { id: 'edge_3', source: 'node_2', target: 'node_3' },
    ];

    const result = removeNodeAndConnectedEdges(nodes, edges, 'node_1');

    expect(result.nodes).toEqual([
      { id: 'node_2', x: 50, y: 50, label: 'V2' },
      { id: 'node_3', x: 80, y: 80, label: 'V3' },
    ]);
    expect(result.edges).toEqual([
      { id: 'edge_3', source: 'node_2', target: 'node_3' },
    ]);
  });

  it('adds a valid edge and increments the next edge number', () => {
    expect(appendEdgeIfValid([], 'node_1', 'node_2', 3)).toEqual({
      created: true,
      edges: [{ id: 'edge_3', source: 'node_1', target: 'node_2' }],
      nextEdgeNumber: 4,
    });
  });

  it('blocks duplicate and self-referencing edges', () => {
    const existingEdges = [{ id: 'edge_1', source: 'node_1', target: 'node_2' }];

    expect(appendEdgeIfValid(existingEdges, 'node_1', 'node_2', 2)).toEqual({
      created: false,
      edges: existingEdges,
      nextEdgeNumber: 2,
    });

    expect(appendEdgeIfValid(existingEdges, 'node_1', 'node_1', 2)).toEqual({
      created: false,
      edges: existingEdges,
      nextEdgeNumber: 2,
    });
  });
});
