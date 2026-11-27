const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../../server/db');
const { requireAdmin } = require('../../../../server/auth');
const { recordAudit } = require('../../../../server/audit');
const { hotelSchema } = require('../../../../server/catalog-schema');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../../server/http');

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('bulk_price'), country: z.string().min(1).max(100), percent: z.number().finite().min(-90).max(500).refine(value => value !== 0) }),
  z.object({ action: z.literal('undo_bulk_price'), batchId: z.string().uuid() })
]);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return methodNotAllowed(res, ['GET', 'POST']);
  if (req.method === 'GET') {
    try {
      const admin = await requireAdmin(req);
      const result = await getPool().query(
        `SELECT id, country, percent, changes
           FROM catalog_price_batches
          WHERE admin_user_id = $1 AND undone_at IS NULL
          ORDER BY created_at DESC LIMIT 1`,
        [admin.id]
      );
      const batch = result.rows[0]
        ? {
            id: result.rows[0].id,
            country: result.rows[0].country,
            percent: Number(result.rows[0].percent),
            priceChanges: result.rows[0].changes
          }
        : null;
      return res.status(200).json({ batch });
    } catch (error) {
      return handleApiError(res, error);
    }
  }
  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = requestSchema.parse(requireJsonBody(req));
    const admin = await requireAdmin(req);
    client = await getPool().connect();
    await client.query('BEGIN');
    transactionOpen = true;

    if (body.action === 'bulk_price') {
      const selected = await client.query(
        `SELECT id, data->>'price' AS price, data->>'country' AS country
           FROM hotels WHERE $1 = 'ALL' OR data->>'country' = $1 FOR UPDATE`,
        [body.country]
      );
      if (!selected.rowCount) throw new ApiError(404, 'Для выбранного направления нет отелей');
      const changes = selected.rows.map(row => {
        const oldPrice = Number(row.price);
        const newPrice = Math.round(oldPrice * (1 + body.percent / 100));
        if (!Number.isFinite(newPrice) || newPrice <= 0) {
          throw new ApiError(400, `Изменение создало недопустимую цену у отеля ${row.id}`);
        }
        return { id: row.id, oldPrice, newPrice };
      });
      const batchId = randomUUID();
      await client.query(
        `INSERT INTO catalog_price_batches (id, admin_user_id, country, percent, changes)
         VALUES ($1, $2, $3, $4, $5::jsonb)`,
        [batchId, admin.id, body.country, body.percent, JSON.stringify(changes)]
      );
      for (const change of changes) {
        await client.query(
          `UPDATE hotels
              SET data = jsonb_set(data, '{price}', to_jsonb($1::numeric), true),
                  updated_at = now(), updated_by_user_id = $2
            WHERE id = $3`,
          [change.newPrice, admin.id, change.id]
        );
      }
      await recordAudit(client, {
        actorId: admin.id, action: 'catalog_bulk_price', subjectType: 'catalog_price_batch',
        subjectId: batchId, details: { country: body.country, percent: body.percent, count: changes.length }
      });
      await client.query('COMMIT');
      transactionOpen = false;
      return res.status(200).json({ batch: { id: batchId, country: body.country, percent: body.percent, priceChanges: changes } });
    }

    const batchResult = await client.query(
      'SELECT id, admin_user_id, changes, undone_at FROM catalog_price_batches WHERE id = $1 FOR UPDATE',
      [body.batchId]
    );
    if (!batchResult.rowCount || batchResult.rows[0].admin_user_id !== admin.id) {
      throw new ApiError(404, 'Изменение цен не найдено');
    }
    const batch = batchResult.rows[0];
    if (batch.undone_at) throw new ApiError(409, 'Это изменение цен уже отменено');
    const changes = batch.changes;
    const currentPrices = await client.query(
      `SELECT id, data->>'price' AS price FROM hotels
        WHERE id = ANY($1::varchar[]) FOR UPDATE`,
      [changes.map(change => change.id)]
    );
    const priceById = new Map(currentPrices.rows.map(row => [row.id, Number(row.price)]));
    if (changes.some(change => priceById.get(change.id) !== Number(change.newPrice))) {
      throw new ApiError(409, 'Отмена невозможна: часть цен после этого изменения уже меняли');
    }
    for (const change of changes) {
      await client.query(
        `UPDATE hotels
            SET data = jsonb_set(data, '{price}', to_jsonb($1::numeric), true),
                updated_at = now(), updated_by_user_id = $2
          WHERE id = $3`,
        [change.oldPrice, admin.id, change.id]
      );
    }
    await client.query('UPDATE catalog_price_batches SET undone_at = now() WHERE id = $1', [batch.id]);
    await recordAudit(client, {
      actorId: admin.id, action: 'catalog_bulk_price_undone', subjectType: 'catalog_price_batch',
      subjectId: batch.id, details: { count: changes.length }
    });
    await client.query('COMMIT');
    transactionOpen = false;
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Проверьте страну и величину изменения цены' });
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/admin/catalog] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
