const { z } = require('zod');
const { getPool } = require('../../../server/db');
const { requireAdmin } = require('../../../server/auth');
const { recordAudit } = require('../../../server/audit');
const { ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../server/http');

const aliasList = z.array(z.string().trim().min(1).max(100)).max(30);
const directorySchema = z.object({
  directory: z.array(z.object({
    name: z.string().trim().min(1).max(80),
    aliases: aliasList,
    cities: z.array(z.object({
      name: z.string().trim().min(1).max(80),
      aliases: aliasList
    })).max(300)
  })).max(200)
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = directorySchema.parse(requireJsonBody(req));
    const admin = await requireAdmin(req);
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;
    await client.query(
      `INSERT INTO app_destinations (id, data, updated_at, updated_by_user_id)
       VALUES ('main', $1::jsonb, now(), $2)
       ON CONFLICT (id) DO UPDATE SET
         data = EXCLUDED.data, updated_at = now(), updated_by_user_id = EXCLUDED.updated_by_user_id`,
      [JSON.stringify(body.directory), admin.id]
    );
    await recordAudit(client, {
      actorId: admin.id, action: 'destination_directory_updated', subjectType: 'destination_directory',
      subjectId: 'main', details: { countryCount: body.directory.length }
    });
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(200).json({ destinationDirectory: body.directory });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Проверьте справочник направлений' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/admin/destinations] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
