const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const { getPool } = require('../../../server/db');
const { recordAudit } = require('../../../server/audit');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../server/http');
const { createSession, serializeUser, writeSessionCookie } = require('../../../server/auth');
const { normalizePhone } = require('../../../server/phone');
const { checkRateLimit } = require('../../../server/rate-limit');
const { getMode, verifyPhoneCode } = require('../../../server/sms');

const requestSchema = z.object({
  phone: z.string().min(3).max(40),
  code: z.string().regex(/^\d{6}$/),
  intent: z.enum(['login', 'register']),
  name: z.string().trim().min(2).max(100).optional(),
  email: z.union([z.literal(''), z.string().trim().email().max(254)]).optional()
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  let client;
  let transactionOpen = false;
  try {
    ensureSameOrigin(req);
    const body = requestSchema.parse(requireJsonBody(req));
    if (body.intent === 'register' && !body.name) {
      throw new ApiError(400, 'Укажите имя для нового профиля');
    }
    if (!process.env.DATABASE_URL) throw new ApiError(503, 'Backend не настроен: добавьте DATABASE_URL и выполните миграции');
    const phone = normalizePhone(body.phone);
    const pool = getPool();
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim()
      || req.socket?.remoteAddress
      || 'unknown';
    await checkRateLimit(pool, `verify-phone:${phone}`, 8, 60 * 60);
    await checkRateLimit(pool, `verify-ip:${clientIp}`, 20, 60 * 60);

    if (getMode() === 'twilio') {
      if (!await verifyPhoneCode(null, phone, body.code)) {
        throw new ApiError(401, 'Неверный или просроченный код');
      }
    }

    client = await pool.connect();
    await client.query('BEGIN');
    transactionOpen = true;
    if (getMode() === 'console') {
      const verified = await verifyPhoneCode(client, phone, body.code);
      if (!verified) {
        await client.query('COMMIT');
        transactionOpen = false;
        throw new ApiError(401, 'Код неверный, истёк или превышено число попыток');
      }
    }

    let userResult = await client.query(
      `SELECT id, name, phone_e164, email, role, is_banned, created_at
         FROM users WHERE phone_e164 = $1 FOR UPDATE`,
      [phone]
    );
    if (body.intent === 'register') {
      if (userResult.rowCount) throw new ApiError(409, 'Профиль с этим подтверждённым телефоном уже существует');
      const userId = randomUUID();
      userResult = await client.query(
        `INSERT INTO users (id, name, phone_e164, email)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, phone_e164, email, role, is_banned, created_at`,
        [userId, body.name.trim(), phone, body.email || null]
      );
      await recordAudit(client, {
        actorId: userId, action: 'account_registered', subjectType: 'user', subjectId: userId
      });
    } else if (!userResult.rowCount) {
      throw new ApiError(404, 'Аккаунт не найден. Зарегистрируйтесь, чтобы продолжить');
    }

    const user = serializeUser(userResult.rows[0]);
    if (user.isBanned) throw new ApiError(403, 'Аккаунт ограничен');
    const sessionToken = await createSession(client, user.id);
    await client.query('DELETE FROM sessions WHERE expires_at <= now()');
    await client.query('COMMIT');
    transactionOpen = false;
    writeSessionCookie(res, sessionToken);
    return res.status(200).json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Проверьте телефон, шестизначный код и данные профиля' });
    }
    return handleApiError(res, error);
  } finally {
    if (client) {
      if (transactionOpen) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('[api/auth/verify] rollback failed', rollbackError.code || rollbackError.name);
        }
      }
      client.release();
    }
  }
}
