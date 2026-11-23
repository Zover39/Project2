const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../../../server/db');
const { requireUser } = require('../../../../../server/auth');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../../../server/http');

const requestSchema = z.object({
  action: z.enum(['accept', 'decline', 'revoke', 'resend'])
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = requestSchema.parse(requireJsonBody(req));
    const user = await requireUser(req);
    const pool = getPool();
    client = await pool.connect();
    await client.query('BEGIN');
    transactionOpen = true;
    const result = await client.query(
      `SELECT i.id, i.booking_id, i.invited_phone_e164, i.status, i.accepted_by_user_id,
              b.owner_user_id, b.status AS booking_status
         FROM booking_invites i
         JOIN bookings b ON b.id = i.booking_id
        WHERE i.id = $1 AND b.id = $2
        FOR UPDATE OF i, b`,
      [req.query.inviteId, req.query.bookingId]
    );
    if (!result.rowCount) throw new ApiError(404, 'Приглашение не найдено');
    const invite = result.rows[0];
    let status;
    let acceptedByUserId = null;
    let action = body.action;

    if (body.action === 'accept' || body.action === 'decline') {
      if (user.role !== 'user') throw new ApiError(403, 'Ответить на приглашение может только турист');
      if (invite.invited_phone_e164 !== user.phone) throw new ApiError(403, 'Приглашение предназначено для другого подтверждённого телефона');
      if (invite.owner_user_id === user.id) throw new ApiError(403, 'Нельзя принять собственное приглашение');
      if (invite.status !== 'pending') throw new ApiError(409, 'Приглашение больше недоступно');
      if (['cancelled_demo', 'rejected_demo'].includes(invite.booking_status)) {
        throw new ApiError(409, 'Поездка отменена или отклонена');
      }
      status = body.action === 'accept' ? 'accepted' : 'declined';
      acceptedByUserId = body.action === 'accept' ? user.id : null;
    } else {
      if (invite.owner_user_id !== user.id) throw new ApiError(403, 'Управлять приглашением может только владелец заявки');
      if (['cancelled_demo', 'rejected_demo'].includes(invite.booking_status)) {
        throw new ApiError(409, 'Для отменённой или отклонённой заявки нельзя менять приглашения');
      }
      if (body.action === 'revoke' && !['pending', 'accepted'].includes(invite.status)) {
        throw new ApiError(409, 'Это приглашение уже недоступно');
      }
      if (body.action === 'resend' && !['declined', 'revoked'].includes(invite.status)) {
        throw new ApiError(409, 'Повторно отправить можно только отклонённое или отозванное приглашение');
      }
      status = body.action === 'resend' ? 'pending' : 'revoked';
    }

    await client.query(
      `UPDATE booking_invites
          SET status = $1, accepted_by_user_id = $2,
              accepted_at = CASE WHEN $1 = 'accepted' THEN now() ELSE NULL END,
              updated_at = now()
        WHERE id = $3`,
      [status, acceptedByUserId, invite.id]
    );
    await client.query(
      `INSERT INTO booking_invite_history (id, invite_id, action, changed_by_user_id)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), invite.id, action === 'resend' ? 'resent' : action === 'revoke' ? 'revoked' : action, user.id]
    );
    await client.query(
      `INSERT INTO audit_events (id, actor_user_id, action, subject_type, subject_id)
       VALUES ($1, $2, $3, 'booking_invite', $4)`,
      [randomUUID(), user.id, `invite_${action}`, invite.id]
    );
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(200).json({ ok: true, status });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Недопустимое действие с приглашением' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/bookings] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
