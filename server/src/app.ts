import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';

import type { GraphQLContext } from './graphql/context.js';
import { resolvers, typeDefs } from './graphql/schema.js';

export async function createApp() {
  const app = express();

  const apolloServer = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.get('/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async () => ({
        requestId: crypto.randomUUID(),
      }),
    }),
  );

  return app;
}
