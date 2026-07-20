const emptyGraph = {
  nodes: [],
  edges: [],
};

export const graphResolvers = {
  Query: {
    graph: () => emptyGraph,
  },
};
