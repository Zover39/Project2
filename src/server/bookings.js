const { z } = require('zod');

const hotelSnapshotSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(160),
  country: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  image: z.string().max(2000).optional().default(''),
  meal: z.string().max(120).optional().default(''),
  stars: z.number().int().min(0).max(5).optional().default(0),
  price: z.number().finite().min(0).max(1000000000)
});

const tripSchema = z.object({
  pax: z.number().int().min(1).max(5),
  adults: z.number().int().min(1).max(5),
  children: z.number().int().min(0).max(4),
  nights: z.number().int().min(1).max(60),
  class: z.union([z.literal(1), z.literal(1.5)]),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealPlan: z.string().max(120).optional().default(''),
  roomType: z.string().max(160).optional().default('')
}).refine(value => value.pax === value.adults + value.children, {
  message: 'Число пассажиров не совпадает с составом поездки',
  path: ['pax']
});

const travelerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: z.enum(['adult', 'child']),
  phone: z.union([z.literal(''), z.string().max(40)]).optional().default('')
});

const createBookingSchema = z.object({
  hotel: hotelSnapshotSchema,
  trip: tripSchema,
  price: z.number().finite().min(0).max(1000000000),
  travelers: z.array(travelerSchema).min(1).max(5)
}).refine(value => value.travelers.length === value.trip.pax, {
  message: 'Число участников не совпадает с количеством гостей',
  path: ['travelers']
});

const statusLabels = {
  pending_demo: 'Новая · демо',
  confirmed_demo: 'Подтверждена · демо',
  completed_demo: 'Завершена · демо',
  cancelled_demo: 'Отменена · демо',
  rejected_demo: 'Отклонена · демо'
};

const formatDate = value => value ? new Date(value).toLocaleDateString('ru-RU') : '';

function serializeInvite(row, canSeePhone) {
  return {
    id: row.id,
    ...(canSeePhone ? { phone: row.invited_phone_e164 } : {}),
    travelerIds: row.traveler_ids,
    status: row.status,
    ...(row.accepted_by_user_id ? { acceptedByUserId: row.accepted_by_user_id } : {}),
    createdAt: row.created_at
  };
}

function serializeBooking(row, user, related, { includeAll = false, pendingInviteId = '' } = {}) {
  const isOwner = user.role === 'admin' || row.owner_user_id === user.id;
  const userInvites = related.invites.filter(invite => (
    (includeAll || isOwner)
      ? true
      : invite.accepted_by_user_id === user.id
  ));
  const allowedTravelerIds = new Set(
    isOwner
      ? related.travelers.map(traveler => traveler.id)
      : userInvites.flatMap(invite => invite.traveler_ids)
  );
  const visibleTravelers = related.travelers
    .filter(traveler => allowedTravelerIds.has(traveler.id))
    .map(traveler => ({
      id: traveler.id,
      name: traveler.name,
      type: traveler.traveler_type,
      ...(isOwner ? { phone: traveler.phone_e164 || '' } : {})
    }));
  const booking = {
    id: row.id,
    hotel: row.hotel_snapshot,
    date: formatDate(row.created_at),
    createdAt: row.created_at,
    status: row.status,
    statusLabel: statusLabels[row.status] || row.status,
    paymentMode: row.payment_mode,
    trip: row.trip,
    user: isOwner
      ? {
          id: row.owner_user_id,
          name: row.owner_name,
          phone: row.owner_phone,
          email: row.owner_email || ''
        }
      : { name: row.owner_name },
    travelers: visibleTravelers,
    shareInvites: userInvites.map(invite => serializeInvite(invite, isOwner)),
    statusHistory: related.history.map(entry => ({
      status: entry.status,
      changedAt: entry.changed_at,
      changedBy: entry.changed_by_name || 'Система',
      note: entry.note
    })),
    cancellation: row.cancellation || null,
    cancellationHistory: row.cancellation ? [row.cancellation] : []
  };
  if (isOwner) booking.price = Number(row.price);
  if (pendingInviteId) booking.shareInvites = [];
  return booking;
}

async function getVisibleBookings(pool, user) {
  const result = await pool.query(
    `SELECT b.id, b.owner_user_id, b.hotel_snapshot, b.trip, b.price, b.status,
            b.payment_mode, b.cancellation, b.created_at,
            owner.name AS owner_name, owner.phone_e164 AS owner_phone, owner.email AS owner_email
       FROM bookings b
       JOIN users owner ON owner.id = b.owner_user_id
      WHERE $2 = 'admin'
         OR b.owner_user_id = $1
         OR EXISTS (
              SELECT 1 FROM booking_invites accepted
               WHERE accepted.booking_id = b.id
                 AND accepted.accepted_by_user_id = $1
                 AND accepted.status = 'accepted'
         )
      ORDER BY b.created_at DESC`,
    [user.id, user.role]
  );
  const bookingIds = result.rows.map(row => row.id);
  const [travelersResult, invitesResult, historyResult] = await Promise.all([
    pool.query('SELECT id, booking_id, name, traveler_type, phone_e164 FROM booking_travelers WHERE booking_id = ANY($1::uuid[])', [bookingIds]),
    pool.query('SELECT id, booking_id, invited_phone_e164, traveler_ids, status, accepted_by_user_id, created_at FROM booking_invites WHERE booking_id = ANY($1::uuid[])', [bookingIds]),
    pool.query(
      `SELECT h.booking_id, h.status, h.changed_at, h.note, u.name AS changed_by_name
         FROM booking_status_history h
         LEFT JOIN users u ON u.id = h.changed_by_user_id
        WHERE h.booking_id = ANY($1::uuid[])
        ORDER BY h.changed_at`,
      [bookingIds]
    )
  ]);
  const relatedByBooking = new Map(result.rows.map(row => [row.id, { travelers: [], invites: [], history: [] }]));
  travelersResult.rows.forEach(item => relatedByBooking.get(item.booking_id).travelers.push(item));
  invitesResult.rows.forEach(item => relatedByBooking.get(item.booking_id).invites.push(item));
  historyResult.rows.forEach(item => relatedByBooking.get(item.booking_id).history.push(item));

  const bookings = result.rows.map(row => serializeBooking(row, user, relatedByBooking.get(row.id)));
  const pendingResult = user.role === 'admin'
    ? { rows: [] }
    : await pool.query(
        `SELECT i.id AS invite_id, i.traveler_ids, i.status AS invite_status, i.created_at AS invite_created_at,
                b.id, b.owner_user_id, b.hotel_snapshot, b.trip, b.price, b.status,
                b.payment_mode, b.cancellation, b.created_at,
                owner.name AS owner_name
           FROM booking_invites i
           JOIN bookings b ON b.id = i.booking_id
           JOIN users owner ON owner.id = b.owner_user_id
          WHERE i.invited_phone_e164 = $1
            AND i.status = 'pending'
            AND b.status NOT IN ('cancelled_demo', 'rejected_demo')
          ORDER BY i.created_at DESC`,
        [user.phone]
      );
  const pendingInvitations = [];
  if (pendingResult.rows.length) {
    const pendingIds = pendingResult.rows.map(row => row.id);
    const pendingTravelersResult = await pool.query(
      'SELECT id, booking_id, name, traveler_type FROM booking_travelers WHERE booking_id = ANY($1::uuid[])',
      [pendingIds]
    );
    const pendingTravelers = new Map();
    pendingTravelersResult.rows.forEach(item => {
      if (!pendingTravelers.has(item.booking_id)) pendingTravelers.set(item.booking_id, []);
      pendingTravelers.get(item.booking_id).push(item);
    });
    for (const row of pendingResult.rows) {
      const booking = {
        id: row.id,
        hotel: row.hotel_snapshot,
        date: formatDate(row.created_at),
        createdAt: row.created_at,
        status: row.status,
        trip: row.trip,
        user: { name: row.owner_name },
        travelers: (pendingTravelers.get(row.id) || [])
          .filter(traveler => row.traveler_ids.includes(traveler.id))
          .map(traveler => ({ id: traveler.id, name: traveler.name, type: traveler.traveler_type })),
        shareInvites: []
      };
      pendingInvitations.push({
        booking,
        invite: {
          id: row.invite_id,
          travelerIds: row.traveler_ids,
          status: row.invite_status,
          createdAt: row.invite_created_at
        }
      });
    }
  }
  return { bookings, pendingInvitations };
}

module.exports = {
  createBookingSchema,
  statusLabels,
  getVisibleBookings
};
