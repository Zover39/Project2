const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../../server/db');
const { requireAdmin } = require('../../../../server/auth');
const { recordAudit } = require('../../../../server/audit');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../../server/http');
const { hotelSchema } = require('../../../../server/catalog-schema');

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('archive'), archived: z.boolean() }),
  z.object({ action: z.literal('save'), hotel: hotelSchema })
]);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['PATCH', 'PUT'].includes(req.method)) return methodNotAllowed(res, ['PATCH', 'PUT']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = requestSchema.parse(requireJsonBody(req));
    const admin = await requireAdmin(req);
    const hotelId = z.string().min(1).max(100).parse(req.query.hotelId);
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;
    const result = await client.query('SELECT data FROM hotels WHERE id = $1 FOR UPDATE', [hotelId]);
    if (!result.rowCount) throw new ApiError(404, 'Отель не найден');
    const oldHotel = result.rows[0].data;

    if (body.action === 'archive') {
      const data = { ...oldHotel, status: body.archived ? 'archived' : 'published' };
      await client.query(
        'UPDATE hotels SET data = $1::jsonb, updated_at = now(), updated_by_user_id = $2 WHERE id = $3',
        [JSON.stringify(data), admin.id, hotelId]
      );
      await recordAudit(client, {
        actorId: admin.id, action: body.archived ? 'hotel_archived' : 'hotel_published',
        subjectType: 'hotel', subjectId: hotelId, details: { name: data.name }
      });
      await client.query('COMMIT');
      transactionOpen = false;
      return res.status(200).json({ hotel: { ...data, id: hotelId, reviews: [] } });
    }

    const hotel = body.hotel;
    const photos = [hotel.image, ...hotel.gallery].map(url => (
      oldHotel.photos?.find(photo => photo.url === url) || { url, alt: hotel.name }
    ));
    const data = {
      ...oldHotel,
      ...hotel,
      gallery: hotel.gallery,
      photos,
      status: oldHotel.status || 'published'
    };
    await client.query(
      'UPDATE hotels SET data = $1::jsonb, updated_at = now(), updated_by_user_id = $2 WHERE id = $3',
      [JSON.stringify(data), admin.id, hotelId]
    );
    await recordAudit(client, {
      actorId: admin.id, action: 'hotel_updated', subjectType: 'hotel', subjectId: hotelId, details: { name: hotel.name }
    });
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(200).json({ hotel: { ...data, id: hotelId } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Проверьте данные отеля' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/admin/catalog/hotel] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
