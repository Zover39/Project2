require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const crypto = require('node:crypto');
const fs = require('node:fs');
const { Client } = require('pg');

async function main() {
  const currentAdminPassword = process.env.POSTGRES_ADMIN_PASSWORD;
  if (!currentAdminPassword) {
    throw new Error('Set POSTGRES_ADMIN_PASSWORD to the current local PostgreSQL superuser password');
  }
  if (fs.existsSync('.env.local')) {
    throw new Error('.env.local already exists; refusing to overwrite local configuration');
  }

  const appPassword = crypto.randomBytes(32).toString('hex');
  const newAdminPassword = crypto.randomBytes(32).toString('hex');
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(currentAdminPassword)}@127.0.0.1:5432/postgres`
  });

  await client.connect();
  try {
    const role = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'astana_app'");
    await client.query(
      `${role.rowCount ? 'ALTER ROLE' : 'CREATE ROLE'} astana_app WITH LOGIN PASSWORD '${appPassword}'`
    );
    const database = await client.query("SELECT 1 FROM pg_database WHERE datname = 'astana_travel'");
    if (database.rowCount) {
      await client.query('ALTER DATABASE astana_travel OWNER TO astana_app');
    } else {
      await client.query('CREATE DATABASE astana_travel OWNER astana_app');
    }
    await client.query(`ALTER ROLE postgres PASSWORD '${newAdminPassword}'`);
  } finally {
    await client.end();
  }

  const environment = [
    `DATABASE_URL=postgresql://astana_app:${appPassword}@127.0.0.1:5432/astana_travel`,
    'AUTH_SMS_MODE=console',
    `PGADMIN_PASSWORD=${newAdminPassword}`,
    ''
  ].join('\n');
  fs.writeFileSync('.env.local', environment, { encoding: 'ascii', flag: 'wx' });
  console.info('Configured the local Astana Travel database in ignored .env.local.');
}

main().catch(error => {
  console.error('[db:setup-local] failed', error.code || error.message);
  process.exitCode = 1;
});
