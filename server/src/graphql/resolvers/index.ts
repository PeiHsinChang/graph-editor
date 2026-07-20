import { graphResolvers } from './graph.js';

export const resolvers = {
  Query: {
    ...graphResolvers.Query,
  },
};
