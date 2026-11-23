const { z } = require('zod');
const { randomUUID } = require('node:crypto');
const { getPool } = require('../../../server/db');
const { requireUser, serializeUser } = require('../../../server/auth');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../server/http');

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.union([z.literal(''), z.string().trim().email().max(254)])
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = profileSchema.parse(requireJsonBody(req));
    const user = await requireUser(req);
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;
    const result = await client.query(
      `UPDATE users SET name = $1, email = $2, updated_at = now()
        WHERE id = $3
        RETURNING id, name, phone_e164, email, role, is_banned, created_at`,
      [body.name, body.email || null, user.id]
    );
    if (!result.rowCount) throw new ApiError(404, 'Аккаунт не найден');
    await client.query(
      `INSERT INTO audit_events (id, actor_user_id, action, subject_type, subject_id)
       VALUES ($1, $2, 'profile_updated', 'user', $3)`,
      [randomUUID(), user.id, user.id]
    );
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(200).json({ user: serializeUser(result.rows[0]) });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Проверьте имя и email' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/account/profile] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
