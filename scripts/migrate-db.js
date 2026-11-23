require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Set DATABASE_URL before running database migrations');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client = await pool.connect();
  let migrationLockHeld = false;
  try {
    await client.query('SELECT pg_advisory_lock($1)', [728194203]);
    migrationLockHeld = true;
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version varchar(100) PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const version = '001_core';
    const applied = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [version]);
    if (applied.rowCount) {
      console.info(`Migration ${version} already applied`);
      return;
    }
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', `${version}.sql`), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
      await client.query('COMMIT');
      console.info(`Applied migration ${version}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    try {
      if (migrationLockHeld) await client.query('SELECT pg_advisory_unlock($1)', [728194203]);
    } finally {
      client.release();
      await pool.end();
    }
  }
}

main().catch(error => {
  console.error('[migration] failed', error.code || error.message);
  process.exitCode = 1;
});
