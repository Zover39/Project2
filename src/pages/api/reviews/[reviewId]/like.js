const { z } = require('zod');
const { getPool } = require('../../../../server/db');
const { requireUser } = require('../../../../server/auth');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed } = require('../../../../server/http');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    ensureSameOrigin(req);
    const user = await requireUser(req);
    const reviewId = z.string().uuid().parse(req.query.reviewId);
    const pool = getPool();
    const inserted = await pool.query(
      `INSERT INTO hotel_review_likes (review_id, user_id)
       SELECT id, $2 FROM hotel_reviews WHERE id = $1 AND status = 'published'
       ON CONFLICT (review_id, user_id) DO NOTHING
       RETURNING review_id`,
      [reviewId, user.id]
    );
    if (!inserted.rowCount) {
      const review = await pool.query('SELECT status FROM hotel_reviews WHERE id = $1', [reviewId]);
      if (!review.rowCount) throw new ApiError(404, 'Отзыв не найден');
      if (review.rows[0].status !== 'published') throw new ApiError(409, 'Отметить можно только опубликованный отзыв');
      return res.status(200).json({ liked: false, message: 'Вы уже отметили этот отзыв' });
    }
    const count = await pool.query('SELECT count(*)::int AS likes FROM hotel_review_likes WHERE review_id = $1', [reviewId]);
    return res.status(200).json({ liked: true, likes: count.rows[0].likes });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Некорректный отзыв' });
    return handleApiError(res, error);
  }
}
