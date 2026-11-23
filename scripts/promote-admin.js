require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { parsePhoneNumberFromString } = require('libphonenumber-js/max');
const { Pool } = require('pg');

async function main() {
  const input = process.argv[2];
  const phone = input && parsePhoneNumberFromString(input, 'KZ');
  if (!phone?.isValid()) {
    throw new Error('Usage: npm run admin:promote -- +77001234567');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('Set DATABASE_URL before promoting an administrator');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    const result = await pool.query(
      `UPDATE users SET role = 'admin', updated_at = now()
        WHERE phone_e164 = $1
        RETURNING id, name, phone_e164`,
      [phone.number]
    );
    if (result.rowCount === 0) {
      throw new Error('No registered user found for that verified phone number');
    }
    console.info(`Administrator role granted to ${result.rows[0].name} (${result.rows[0].phone_e164})`);
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error('[admin:promote] failed', error.message);
  process.exitCode = 1;
});
