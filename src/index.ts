import { createServer } from './api';

const server = createServer(Number(process.env.PORT) || 3000);

console.log(`Listening on localhost:${server.port}`);