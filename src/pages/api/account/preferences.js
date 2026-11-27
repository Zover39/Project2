const { z } = require('zod');
const { getPool } = require('../../../server/db');
const { requireUser } = require('../../../server/auth');
const { ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../server/http');

const preferencesSchema = z.object({
  favorites: z.array(z.string().min(1).max(100)).max(500),
  favoriteNotes: z.record(z.string().max(100), z.string().max(500)),
  recentlyViewedIds: z.array(z.string().min(1).max(100)).max(50),
  compareIds: z.array(z.string().min(1).max(100)).max(3),
  theme: z.enum(['light', 'dark'])
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'PUT'].includes(req.method)) return methodNotAllowed(res, ['GET', 'PUT']);
  try {
    const user = await requireUser(req);
    if (req.method === 'GET') {
      const result = await getPool().query(
        `SELECT favorites, favorite_notes, recently_viewed_ids, compare_ids, theme
           FROM app_user_preferences WHERE user_id = $1`,
        [user.id]
      );
      const row = result.rows[0];
      return res.status(200).json({
        preferences: row ? {
          favorites: row.favorites,
          favoriteNotes: row.favorite_notes,
          recentlyViewedIds: row.recently_viewed_ids,
          compareIds: row.compare_ids,
          theme: row.theme
        } : { favorites: [], favoriteNotes: {}, recentlyViewedIds: [], compareIds: [], theme: 'light' }
      });
    }

    ensureSameOrigin(req);
    const body = preferencesSchema.parse(requireJsonBody(req));
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const hotelIds = await client.query('SELECT id FROM hotels');
      const validIds = new Set(hotelIds.rows.map(row => row.id));
      const favorites = [...new Set(body.favorites)].filter(id => validIds.has(id));
      const recentlyViewedIds = [...new Set(body.recentlyViewedIds)]
        .filter(id => validIds.has(id)).slice(0, 50);
      const compareIds = [...new Set(body.compareIds)].filter(id => validIds.has(id)).slice(0, 3);
      const favoriteNotes = Object.fromEntries(
        Object.entries(body.favoriteNotes).filter(([id]) => validIds.has(id))
      );
      await client.query(
        `INSERT INTO app_user_preferences
           (user_id, favorites, favorite_notes, recently_viewed_ids, compare_ids, theme, updated_at)
         VALUES ($1, $2, $3::jsonb, $4, $5, $6, now())
         ON CONFLICT (user_id) DO UPDATE SET
           favorites = EXCLUDED.favorites,
           favorite_notes = EXCLUDED.favorite_notes,
           recently_viewed_ids = EXCLUDED.recently_viewed_ids,
           compare_ids = EXCLUDED.compare_ids,
           theme = EXCLUDED.theme,
           updated_at = now()`,
        [user.id, favorites, JSON.stringify(favoriteNotes), recentlyViewedIds, compareIds, body.theme]
      );
      await client.query('COMMIT');
      return res.status(200).json({ preferences: { favorites, favoriteNotes, recentlyViewedIds, compareIds, theme: body.theme } });
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('[api/account/preferences] rollback failed', rollbackError.code || rollbackError.name);
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Некорректные данные избранного или списка поездок' });
    return handleApiError(res, error);
  }
}
