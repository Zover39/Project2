const { z } = require('zod');
const { getPool } = require('../../../server/db');
const { ApiError, ensureSameOrigin, handleApiError, methodNotAllowed, requireJsonBody } = require('../../../server/http');
const { normalizePhone } = require('../../../server/phone');
const { checkRateLimit } = require('../../../server/rate-limit');
const { getMode, startPhoneVerification } = require('../../../server/sms');

const requestSchema = z.object({
  phone: z.string().min(3).max(40),
  intent: z.enum(['login', 'register'])
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    ensureSameOrigin(req);
    const body = requestSchema.parse(requireJsonBody(req));
    if (!process.env.DATABASE_URL) throw new ApiError(503, 'Backend не настроен: добавьте DATABASE_URL и выполните миграции');
    const phone = normalizePhone(body.phone);
    const pool = getPool();
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim()
      || req.socket?.remoteAddress
      || 'unknown';
    await checkRateLimit(pool, `phone:${phone}`, 3, 60 * 60);
    await checkRateLimit(pool, `ip:${clientIp}`, 12, 60 * 60);
    const delivery = await startPhoneVerification(pool, phone);
    return res.status(200).json({
      ok: true,
      phone,
      delivery,
      message: delivery === 'console'
        ? 'Код разработчика выведен в консоль Next.js'
        : 'Код подтверждения отправлен'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Введите телефон и выберите вход или регистрацию' });
    }
    return handleApiError(res, error);
  }
}
