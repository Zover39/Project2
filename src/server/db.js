const { Pool } = require('pg');

const globalForPool = globalThis;

function getPool() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('Backend database is not configured');
    error.statusCode = 503;
    throw error;
  }

  if (!globalForPool.__astanaTravelPool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on('error', error => {
      console.error('[database] idle connection error', error.code || error.name);
    });
    globalForPool.__astanaTravelPool = pool;
  }

  return globalForPool.__astanaTravelPool;
}

module.exports = { getPool };
