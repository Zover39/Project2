const { randomUUID } = require('node:crypto');
const { getPool } = require('../../../server/db');
const { clearSessionCookie, requireUser } = require('../../../server/auth');
const { ensureSameOrigin, handleApiError, methodNotAllowed } = require('../../../server/http');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const user = await requireUser(req);
    if (user.role !== 'user') {
      return res.status(403).json({ error: 'Удалить можно только туристический аккаунт' });
    }
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;
    const affectedInvites = await client.query(
      `UPDATE booking_invites
          SET status = 'revoked', accepted_by_user_id = NULL, accepted_at = NULL, updated_at = now()
        WHERE invited_phone_e164 = $1 AND status IN ('pending', 'accepted')
        RETURNING id`,
      [user.phone]
    );
    for (const invite of affectedInvites.rows) {
      await client.query(
        `INSERT INTO booking_invite_history (id, invite_id, action, changed_by_user_id)
         VALUES ($1, $2, 'profile_deleted', NULL)`,
        [randomUUID(), invite.id]
      );
    }
    await client.query(
      `INSERT INTO audit_events (id, actor_user_id, action, subject_type, subject_id)
       VALUES ($1, NULL, 'account_deleted', 'user', $2)`,
      [randomUUID(), user.id]
    );
    await client.query('DELETE FROM users WHERE id = $1', [user.id]);
    await client.query('COMMIT');
    transactionOpen = false;
    clearSessionCookie(res);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/account] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
