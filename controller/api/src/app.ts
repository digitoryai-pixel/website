import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { Prisma } from '@prisma/client';
import { AppError } from './lib/errors.js';
import authRoutes from './routes/auth.js';
import referenceRoutes from './routes/reference.js';
import dashboardRoutes from './routes/dashboard.js';
import exceptionRoutes from './routes/exceptions.js';
import countRoutes from './routes/counts.js';
import controlAreaRoutes from './routes/control-areas.js';
import purchasingRoutes from './routes/purchasing.js';
import cashRoutes from './routes/cash.js';
import wastageRoutes from './routes/wastage.js';
import monthEndRoutes from './routes/monthend.js';
import askRoutes from './routes/ask.js';
import controlsRoutes from './routes/controls.js';
import attachmentRoutes from './routes/attachments.js';
import integrationRoutes from './routes/integrations.js';
import whatsappRoutes from './routes/whatsapp.js';
import jobRoutes from './routes/jobs.js';
import mobileRoutes from './routes/mobile.js';

// Routes that don't need a user token.
const PUBLIC = [/^\/api\/auth\/(login|mobile-login)$/, /^\/api\/integrations\//, /^\/api\/webhooks\//, /^\/api\/health$/, /^\/docs/];

export async function buildApp(opts: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false, bodyLimit: 5 * 1024 * 1024 });
  await app.register(cors, { origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3100').split(','), credentials: true });
  await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret-change-me', sign: { expiresIn: '12h' } });
  await app.register(multipart, { limits: { fileSize: 15 * 1024 * 1024, files: 1 } });
  await app.register(swagger, {
    openapi: {
      info: { title: 'Digitory Controller API', version: '1.0.0', description: 'Phase 1: controls, counts, reconciliation and exceptions' },
      components: { securitySchemes: { bearer: { type: 'http', scheme: 'bearer' } } },
      security: [{ bearer: [] }],
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.addHook('onRequest', async (req) => {
    const path = req.url.split('?')[0];
    if (req.method === 'OPTIONS' || PUBLIC.some((r) => r.test(path))) return;
    // <img src> can't send a bearer header, so evidence files also accept ?token=.
    const qToken = (req.query as { token?: string } | undefined)?.token;
    if (!req.headers.authorization && qToken && path.startsWith('/api/attachments/')) req.headers.authorization = `Bearer ${qToken}`;
    try {
      await req.jwtVerify();
    } catch {
      throw new AppError(401, 'UNAUTHENTICATED', 'Sign in again');
    }
  });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof AppError) {
      return reply.status(err.status).send({ error: { code: err.code, message: err.message, details: err.details } });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return reply.status(409).send({ error: { code: 'DUPLICATE', message: 'That record already exists' } });
      if (err.code === 'P2025') return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Record not found' } });
    }
    if ((err as { validation?: unknown }).validation) {
      return reply.status(400).send({ error: { code: 'VALIDATION', message: err.message } });
    }
    req.log.error(err);
    return reply.status(500).send({ error: { code: 'INTERNAL', message: 'Something went wrong' } });
  });

  app.get('/api/health', async () => ({ ok: true }));
  await app.register(
    async (api) => {
      await api.register(authRoutes);
      await api.register(referenceRoutes);
      await api.register(dashboardRoutes);
      await api.register(exceptionRoutes);
      await api.register(countRoutes);
      await api.register(controlAreaRoutes);
      await api.register(purchasingRoutes);
      await api.register(cashRoutes);
      await api.register(wastageRoutes);
      await api.register(monthEndRoutes);
      await api.register(askRoutes);
      await api.register(controlsRoutes);
      await api.register(attachmentRoutes);
      await api.register(integrationRoutes);
      await api.register(whatsappRoutes);
      await api.register(jobRoutes);
      await api.register(mobileRoutes);
    },
    { prefix: '/api' },
  );
  return app;
}
