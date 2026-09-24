// Photos, scale readings and documents attached as evidence.
import type { FastifyPluginAsync } from 'fastify';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { prisma } from '../db.js';
import { badRequest, notFound } from '../lib/errors.js';

const DIR = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/json']);

const routes: FastifyPluginAsync = async (app) => {
  app.post('/attachments', async (req) => {
    const file = await req.file();
    if (!file) throw badRequest('FILE_REQUIRED', 'Attach a file');
    if (!ALLOWED.has(file.mimetype)) throw badRequest('FILE_TYPE', 'Only photos, PDFs and scale readings are accepted');
    const kind = (file.fields.kind as { value?: string } | undefined)?.value ?? (file.mimetype.startsWith('image/') ? 'PHOTO' : 'DOCUMENT');
    const buf = await file.toBuffer();
    await mkdir(DIR, { recursive: true });
    const name = `${randomUUID()}${path.extname(file.filename) || ''}`;
    await writeFile(path.join(DIR, name), buf);
    const a = await prisma.attachment.create({
      data: { orgId: req.user.orgId, kind, path: name, mime: file.mimetype, sizeBytes: buf.length, uploadedById: req.user.sub, meta: { filename: file.filename, deviceId: req.user.deviceId ?? null } },
    });
    return { id: a.id, kind: a.kind, mime: a.mime };
  });

  app.get<{ Params: { id: string } }>('/attachments/:id', async (req, reply) => {
    const a = await prisma.attachment.findFirst({ where: { id: req.params.id, orgId: req.user.orgId } });
    if (!a) throw notFound('Attachment');
    return reply.type(a.mime).send(createReadStream(path.join(DIR, path.basename(a.path))));
  });
};
export default routes;
