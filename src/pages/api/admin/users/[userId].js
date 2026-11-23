const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../../server/db');
const { requireAdmin } = require('../../../../server/auth');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../../server/http');

const requestSchema = z.object({ isBanned: z.boolean() });
const userIdSchema = z.string().uuid();

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = requestSchema.parse(requireJsonBody(req));
    const admin = await requireAdmin(req);
    const userId = userIdSchema.parse(req.query.userId);
    if (userId === admin.id) throw new ApiError(400, 'Нельзя ограничить собственный аккаунт');
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;
    const result = await client.query(
      `UPDATE users SET is_banned = $1, updated_at = now()
        WHERE id = $2
        RETURNING id, name, phone_e164, email, role, is_banned, created_at`,
      [body.isBanned, userId]
    );
    if (!result.rowCount) throw new ApiError(404, 'Пользователь не найден');
    await client.query(
      `INSERT INTO audit_events (id, actor_user_id, action, subject_type, subject_id, details)
       VALUES ($1, $2, $3, 'user', $4, $5::jsonb)`,
      [randomUUID(), admin.id, body.isBanned ? 'user_blocked' : 'user_unblocked', userId, JSON.stringify({ isBanned: body.isBanned })]
    );
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Ожидался статус блокировки' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/admin/users] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
