import './env.js';
import { buildApp } from './app.js';
import { startScheduler } from './jobs/scheduler.js';

const app = await buildApp({ logger: true });
const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: '0.0.0.0' });
if (process.env.DISABLE_SCHEDULER !== '1') startScheduler(app.log);
