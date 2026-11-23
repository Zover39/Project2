const { createHash } = require('node:crypto');
const { ApiError } = require('./http');

const hashKey = value => createHash('sha256').update(value).digest('hex');

async function checkRateLimit(pool, key, limit, windowSeconds) {
  const result = await pool.query(
    `INSERT INTO auth_rate_limits (key_hash, window_started_at, hits)
     VALUES ($1, now(), 1)
     ON CONFLICT (key_hash) DO UPDATE
       SET hits = CASE
             WHEN auth_rate_limits.window_started_at <= now() - ($2::double precision * interval '1 second') THEN 1
             ELSE auth_rate_limits.hits + 1
           END,
           window_started_at = CASE
             WHEN auth_rate_limits.window_started_at <= now() - ($2::double precision * interval '1 second') THEN now()
             ELSE auth_rate_limits.window_started_at
           END
     RETURNING hits`,
    [hashKey(key), windowSeconds]
  );
  if (result.rows[0].hits > limit) {
    throw new ApiError(429, 'Слишком много попыток. Попробуйте позже');
  }
}

module.exports = { checkRateLimit, hashKey };
