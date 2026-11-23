const { createHash, randomBytes } = require('node:crypto');
const { getPool } = require('./db');
const { ApiError } = require('./http');

const COOKIE_NAME = 'astana_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function getSessionToken(req) {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const cookieHeader = req.headers.cookie || '';
  const pair = cookieHeader.split(';').map(value => value.trim()).find(value => value.startsWith(`${COOKIE_NAME}=`));
  return pair ? decodeURIComponent(pair.slice(COOKIE_NAME.length + 1)) : '';
}

function writeSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`);
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

function serializeUser(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone_e164,
    phoneVerified: true,
    email: row.email || '',
    role: row.role,
    isBanned: row.is_banned,
    createdAt: row.created_at
  };
}

async function getCurrentUser(req) {
  const token = getSessionToken(req);
  if (!token) return null;

  const pool = getPool();
  const result = await pool.query(
    `SELECT u.id, u.name, u.phone_e164, u.email, u.role, u.is_banned, u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)]
  );
  if (result.rowCount === 0) return null;

  await pool.query(
    'UPDATE sessions SET last_seen_at = now() WHERE token_hash = $1',
    [hashToken(token)]
  );
  return serializeUser(result.rows[0]);
}

async function requireUser(req, { allowBanned = false } = {}) {
  const user = await getCurrentUser(req);
  if (!user) throw new ApiError(401, 'Войдите в аккаунт');
  if (!allowBanned && user.isBanned) throw new ApiError(403, 'Аккаунт ограничен');
  return user;
}

async function requireAdmin(req) {
  const user = await requireUser(req);
  if (user.role !== 'admin') throw new ApiError(403, 'Недостаточно прав');
  return user;
}

async function createSession(client, userId) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  await client.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + ($3 * interval '1 second'))`,
    [tokenHash, userId, SESSION_TTL_SECONDS]
  );
  return token;
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
  clearSessionCookie,
  createSession,
  getCurrentUser,
  getSessionToken,
  hashToken,
  requireAdmin,
  requireUser,
  serializeUser,
  writeSessionCookie
};
