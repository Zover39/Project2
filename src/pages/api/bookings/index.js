const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../server/db');
const { requireUser } = require('../../../server/auth');
const { ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody, ApiError } = require('../../../server/http');
const { normalizePhone } = require('../../../server/phone');
const { createBookingSchema, getVisibleBookings } = require('../../../server/bookings');

function assertValidTrip(trip) {
  const start = new Date(`${trip.departureDate}T00:00:00Z`);
  const end = new Date(`${trip.checkOutDate}T00:00:00Z`);
  const nights = Math.round((end - start) / 86400000);
  const today = new Date().toISOString().slice(0, 10);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())
    || trip.departureDate < today || nights !== trip.nights || nights < 1) {
    throw new ApiError(400, 'Проверьте даты поездки и количество ночей');
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return methodNotAllowed(res, ['GET', 'POST']);

  let client;
  let transactionOpen = false;
  try {
    const user = await requireUser(req);
    const pool = getPool();
    if (req.method === 'GET') {
      const result = await getVisibleBookings(pool, user);
      return res.status(200).json(result);
    }

    ensureSameOrigin(req);
    const body = createBookingSchema.parse(requireJsonBody(req));
    if (user.isBanned) throw new ApiError(403, 'Аккаунт ограничен');
    assertValidTrip(body.trip);

    const travelers = body.travelers.map(traveler => ({
      id: randomUUID(),
      name: traveler.name,
      type: traveler.type,
      phone: traveler.phone ? normalizePhone(traveler.phone) : ''
    }));
    const inviteGroups = new Map();
    for (const traveler of travelers) {
      if (!traveler.phone || traveler.phone === user.phone) continue;
      const group = inviteGroups.get(traveler.phone) || [];
      group.push(traveler.id);
      inviteGroups.set(traveler.phone, group);
    }

    const bookingId = randomUUID();
    client = await pool.connect();
    await client.query('BEGIN');
    transactionOpen = true;
    await client.query(
      `INSERT INTO bookings (id, owner_user_id, hotel_snapshot, trip, price, status)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, 'pending_demo')`,
      [
        bookingId,
        user.id,
        JSON.stringify(body.hotel),
        JSON.stringify(body.trip),
        body.price
      ]
    );
    await client.query(
      `INSERT INTO booking_status_history (id, booking_id, status, changed_by_user_id, note)
       VALUES ($1, $2, 'pending_demo', $3, 'Демо-заявка создана. Подтверждение и оплата не выполнялись.')`,
      [randomUUID(), bookingId, user.id]
    );
    for (const traveler of travelers) {
      await client.query(
        `INSERT INTO booking_travelers (id, booking_id, name, traveler_type, phone_e164)
         VALUES ($1, $2, $3, $4, $5)`,
        [traveler.id, bookingId, traveler.name, traveler.type, traveler.phone || null]
      );
    }
    for (const [phone, travelerIds] of inviteGroups) {
      const inviteId = randomUUID();
      await client.query(
        `INSERT INTO booking_invites (id, booking_id, invited_phone_e164, traveler_ids, invited_by_user_id)
         VALUES ($1, $2, $3, $4::uuid[], $5)`,
        [inviteId, bookingId, phone, travelerIds, user.id]
      );
      await client.query(
        `INSERT INTO booking_invite_history (id, invite_id, action, changed_by_user_id)
         VALUES ($1, $2, 'created', $3)`,
        [randomUUID(), inviteId, user.id]
      );
    }
    await client.query(
      `INSERT INTO audit_events (id, actor_user_id, action, subject_type, subject_id, details)
       VALUES ($1, $2, 'booking_created', 'booking', $3, $4::jsonb)`,
      [randomUUID(), user.id, bookingId, JSON.stringify({ travelerCount: travelers.length, inviteCount: inviteGroups.size })]
    );
    await client.query('COMMIT');
    transactionOpen = false;

    const result = await getVisibleBookings(pool, user);
    const booking = result.bookings.find(item => item.id === bookingId);
    return res.status(201).json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Проверьте отель, даты, цену и состав участников' });
    }
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
