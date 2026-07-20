import { createServer } from 'node:http';

import { createApp } from './app.js';

const DEFAULT_PORT = 4000;

async function startServer() {
  const app = await createApp();
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const server = createServer(app);

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`GraphQL endpoint ready at http://localhost:${port}/graphql`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start server', error);
  process.exitCode = 1;
});
