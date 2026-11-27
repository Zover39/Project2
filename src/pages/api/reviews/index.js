const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../server/db');
const { requireUser } = require('../../../server/auth');
const { recordAudit } = require('../../../server/audit');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../server/http');

const reviewSchema = z.object({
  hotelId: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(2000)
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = reviewSchema.parse(requireJsonBody(req));
    const user = await requireUser(req);
    if (user.role !== 'user') throw new ApiError(403, 'Оставить отзыв может только турист');
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;
    const hotel = await client.query(
      `SELECT data FROM hotels WHERE id = $1 AND COALESCE(data->>'status', 'published') <> 'archived'`,
      [body.hotelId]
    );
    if (!hotel.rowCount) throw new ApiError(404, 'Отель не найден или снят с публикации');
    const verification = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM bookings
          WHERE owner_user_id = $1
            AND hotel_snapshot->>'id' = $2
            AND status = 'completed_demo'
       ) AS verified`,
      [user.id, body.hotelId]
    );
    const reviewId = randomUUID();
    await client.query(
      `INSERT INTO hotel_reviews (id, hotel_id, user_id, rating, review_text)
       VALUES ($1, $2, $3, $4, $5)`,
      [reviewId, body.hotelId, user.id, body.rating, body.text]
    );
    await recordAudit(client, {
      actorId: user.id, action: 'review_submitted', subjectType: 'hotel_review', subjectId: reviewId,
      details: { hotelId: body.hotelId, verifiedStay: verification.rows[0].verified }
    });
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(201).json({
      review: {
        id: reviewId, userId: user.id, author: user.name, rating: body.rating, text: body.text,
        status: 'pending_review', adminReply: '', likes: 0, likedBy: [], verifiedStay: verification.rows[0].verified,
        date: new Date().toLocaleDateString('ru-RU')
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Проверьте оценку и текст отзыва' });
    if (error?.code === '23505') return res.status(409).json({ error: 'Вы уже оставили отзыв об этом отеле' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/reviews] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
