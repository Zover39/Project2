const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../../server/db');
const { requireAdmin } = require('../../../../server/auth');
const { recordAudit } = require('../../../../server/audit');
const { ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../../server/http');
const { hotelSchema } = require('../../../../server/catalog-schema');

const requestSchema = z.object({ hotel: hotelSchema });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = requestSchema.parse(requireJsonBody(req));
    const admin = await requireAdmin(req);
    const hotel = body.hotel;
    const hotelId = `h-custom-${randomUUID()}`;
    const data = {
      ...hotel,
      status: 'published',
      photos: [hotel.image, ...hotel.gallery].map(url => ({ url, alt: hotel.name })),
      rating: null,
      roomsLeft: null,
      viewers: null
    };
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;
    await client.query(
      'INSERT INTO hotels (id, data, updated_by_user_id) VALUES ($1, $2::jsonb, $3)',
      [hotelId, JSON.stringify(data), admin.id]
    );
    await recordAudit(client, {
      actorId: admin.id, action: 'hotel_created', subjectType: 'hotel', subjectId: hotelId, details: { name: hotel.name }
    });
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(201).json({ hotel: { ...data, id: hotelId, reviews: [] } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Проверьте данные нового отеля' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/admin/catalog/create] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
