const { getPool } = require('../../../server/db');
const { clearSessionCookie, getSessionToken, hashToken } = require('../../../server/auth');
const { ensureSameOrigin, handleApiError, methodNotAllowed } = require('../../../server/http');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    ensureSameOrigin(req);
    const token = getSessionToken(req);
    if (token && process.env.DATABASE_URL) {
      await getPool().query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
    }
    clearSessionCookie(res);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return handleApiError(res, error);
  }
}
