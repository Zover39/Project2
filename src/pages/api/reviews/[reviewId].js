const { z } = require('zod');
const { getPool } = require('../../../server/db');
const { requireAdmin } = require('../../../server/auth');
const { recordAudit } = require('../../../server/audit');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../server/http');

const updateSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('moderate'), status: z.enum(['published', 'rejected']) }),
  z.object({ action: z.literal('reply'), text: z.string().trim().min(1).max(1000) })
]);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['PATCH', 'DELETE'].includes(req.method)) return methodNotAllowed(res, ['PATCH', 'DELETE']);
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const admin = await requireAdmin(req);
    const reviewId = z.string().uuid().parse(req.query.reviewId);
    const body = req.method === 'PATCH' ? updateSchema.parse(requireJsonBody(req)) : null;
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;
    let result;
    let action;
    if (req.method === 'DELETE') {
      result = await client.query('DELETE FROM hotel_reviews WHERE id = $1 RETURNING hotel_id', [reviewId]);
      action = 'review_deleted';
    } else if (body.action === 'moderate') {
      result = await client.query(
        `UPDATE hotel_reviews SET status = $1, updated_at = now()
          WHERE id = $2 RETURNING hotel_id, status, admin_reply`,
        [body.status, reviewId]
      );
      action = body.status === 'published' ? 'review_published' : 'review_rejected';
    } else {
      result = await client.query(
        `UPDATE hotel_reviews SET admin_reply = $1, updated_at = now()
          WHERE id = $2 RETURNING hotel_id, status, admin_reply`,
        [body.text, reviewId]
      );
      action = 'review_replied';
    }
    if (!result.rowCount) throw new ApiError(404, 'Отзыв не найден');
    await recordAudit(client, {
      actorId: admin.id, action, subjectType: 'hotel_review', subjectId: reviewId,
      details: { hotelId: result.rows[0].hotel_id, ...(body?.action === 'moderate' ? { status: body.status } : {}) }
    });
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(200).json({
      ok: true,
      review: result.rows[0] ? { id: reviewId, ...result.rows[0] } : null
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Некорректное действие с отзывом' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/reviews/review] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
