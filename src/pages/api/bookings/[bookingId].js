const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../server/db');
const { requireUser } = require('../../../server/auth');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../server/http');
const { getVisibleBookings } = require('../../../server/bookings');

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel'), reason: z.string().trim().min(1).max(200), note: z.string().trim().max(500).optional().default('') }),
  z.object({ action: z.literal('restore') }),
  z.object({ action: z.literal('set_status'), status: z.enum(['pending_demo', 'confirmed_demo', 'completed_demo', 'rejected_demo']) })
]);

const transitions = {
  pending_demo: ['confirmed_demo', 'rejected_demo'],
  confirmed_demo: ['pending_demo', 'completed_demo', 'rejected_demo'],
  rejected_demo: ['pending_demo'],
  completed_demo: []
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
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
      'SELECT id, owner_user_id, status, trip, cancellation FROM bookings WHERE id = $1 FOR UPDATE',
      [req.query.bookingId]
    );
    if (!result.rowCount) throw new ApiError(404, 'Заявка не найдена');
    const booking = result.rows[0];
    const isOwner = booking.owner_user_id === user.id;
    const isAdmin = user.role === 'admin';
    const now = new Date().toISOString();
    let nextStatus;
    let note = '';

    if (body.action === 'cancel') {
      if (!isOwner && !isAdmin) throw new ApiError(403, 'Отменить заявку может только её владелец');
      if (!['pending_demo', 'confirmed_demo'].includes(booking.status)) {
        throw new ApiError(409, 'Заявку в этом статусе отменить нельзя');
      }
      nextStatus = 'cancelled_demo';
      note = body.reason;
      const cancellation = {
        cancelledAt: now,
        cancelledBy: isAdmin ? 'Администратор' : user.name,
        reason: body.reason,
        note: body.note,
        statusBeforeCancellation: booking.status
      };
      await client.query(
        `UPDATE bookings SET status = $1, cancellation = $2::jsonb, updated_at = now() WHERE id = $3`,
        [nextStatus, JSON.stringify(cancellation), booking.id]
      );
      const revoked = await client.query(
        `UPDATE booking_invites SET status = 'revoked', updated_at = now()
          WHERE booking_id = $1 AND status = 'pending'
          RETURNING id`,
        [booking.id]
      );
      for (const invite of revoked.rows) {
        await client.query(
          `INSERT INTO booking_invite_history (id, invite_id, action, changed_by_user_id)
           VALUES ($1, $2, 'revoked', $3)`,
          [randomUUID(), invite.id, user.id]
        );
      }
    } else {
      if (!isAdmin) throw new ApiError(403, 'Это действие доступно администратору');
      if (body.action === 'restore') {
        if (booking.status !== 'cancelled_demo') throw new ApiError(409, 'Восстановить можно только отменённую заявку');
        nextStatus = booking.cancellation?.statusBeforeCancellation || 'pending_demo';
        if (!['pending_demo', 'confirmed_demo'].includes(nextStatus)) nextStatus = 'pending_demo';
        note = 'Заявка восстановлена администратором.';
        await client.query(
          `UPDATE bookings SET status = $1, cancellation = NULL, updated_at = now() WHERE id = $2`,
          [nextStatus, booking.id]
        );
      } else {
        nextStatus = body.status;
        if (!transitions[booking.status]?.includes(nextStatus)) {
          throw new ApiError(409, 'Нельзя изменить заявку в выбранный статус');
        }
        if (nextStatus === 'completed_demo'
          && (!booking.trip?.checkOutDate || booking.trip.checkOutDate >= new Date().toISOString().slice(0, 10))) {
          throw new ApiError(409, 'Завершить поездку можно только после даты выезда');
        }
        note = 'Статус изменён в административной панели.';
        await client.query('UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2', [nextStatus, booking.id]);
      }
    }

    await client.query(
      `INSERT INTO booking_status_history (id, booking_id, status, changed_by_user_id, note, changed_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), booking.id, nextStatus, user.id, note, now]
    );
    await client.query(
      `INSERT INTO audit_events (id, actor_user_id, action, subject_type, subject_id)
       VALUES ($1, $2, $3, 'booking', $4)`,
      [randomUUID(), user.id, `booking_${body.action}`, booking.id]
    );
    await client.query('COMMIT');
    transactionOpen = false;

    const updated = await getVisibleBookings(pool, user);
    return res.status(200).json({ booking: updated.bookings.find(item => item.id === booking.id) || null });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Недопустимое действие или статус заявки' });
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
