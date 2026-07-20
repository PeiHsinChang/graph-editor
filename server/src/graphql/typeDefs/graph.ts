export const graphTypeDefs = `#graphql
  type Node {
    id: ID!
    x: Float!
    y: Float!
    label: String!
  }

  type Edge {
    id: ID!
    source: ID!
    target: ID!
  }

  type Graph {
    nodes: [Node!]!
    edges: [Edge!]!
  }

  type Query {
    graph: Graph!
  }
`;
