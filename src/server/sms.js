const { randomInt, randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const { ApiError } = require('./http');

function getMode() {
  const mode = process.env.AUTH_SMS_MODE || (process.env.NODE_ENV === 'development' ? 'console' : 'twilio');
  if (mode === 'console' && process.env.NODE_ENV !== 'development') {
    throw new ApiError(503, 'Локальная отправка кодов отключена вне режима разработки');
  }
  if (!['console', 'twilio'].includes(mode)) {
    throw new ApiError(503, 'Некорректный режим отправки SMS');
  }
  return mode;
}

function getTwilioConfig() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    throw new ApiError(503, 'Для отправки SMS настройте Twilio Verify в переменных окружения');
  }
  return { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID };
}

async function twilioRequest(path, fields) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = getTwilioConfig();
  const authorization = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  let response;
  try {
    response = await fetch(
      `https://verify.twilio.com/v2/Services/${encodeURIComponent(TWILIO_VERIFY_SERVICE_SID)}/${path}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authorization}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(fields)
      }
    );
  } catch (error) {
    console.error('[sms] Twilio Verify request failed', error.code || error.name);
    throw new ApiError(502, 'Сервис отправки SMS временно недоступен');
  }
  if (!response.ok) {
    console.error('[sms] Twilio Verify returned an error', response.status);
    if (response.status === 400 || response.status === 404) {
      throw new ApiError(400, 'Не удалось проверить код. Запросите новый код и попробуйте снова');
    }
    throw new ApiError(502, 'Сервис отправки SMS временно недоступен');
  }
  return response.json();
}

async function startPhoneVerification(pool, phone) {
  const mode = getMode();
  if (mode === 'twilio') {
    await twilioRequest('Verifications', { To: phone, Channel: 'sms' });
    return 'sms';
  }

  const code = String(randomInt(100000, 1000000));
  const salt = randomBytes(16).toString('hex');
  const codeHash = scryptSync(code, salt, 64).toString('hex');
  await pool.query(
    `INSERT INTO phone_verification_challenges (phone_e164, code_salt, code_hash, expires_at, attempts, last_sent_at)
     VALUES ($1, $2, $3, now() + interval '5 minutes', 0, now())
     ON CONFLICT (phone_e164) DO UPDATE
       SET code_salt = EXCLUDED.code_salt,
           code_hash = EXCLUDED.code_hash,
           expires_at = EXCLUDED.expires_at,
           attempts = 0,
           last_sent_at = now()`,
    [phone, salt, codeHash]
  );
  console.info(`[auth] Development OTP for ${phone}: ${code}`);
  return 'console';
}

async function verifyPhoneCode(client, phone, code) {
  const mode = getMode();
  if (mode === 'twilio') {
    const result = await twilioRequest('VerificationCheck', { To: phone, Code: code });
    return result.status === 'approved';
  }

  const result = await client.query(
    `SELECT code_salt, code_hash, attempts
       FROM phone_verification_challenges
      WHERE phone_e164 = $1 AND expires_at > now()
      FOR UPDATE`,
    [phone]
  );
  if (result.rowCount === 0 || result.rows[0].attempts >= 5) return false;
  const challenge = result.rows[0];
  const actualHash = scryptSync(code, challenge.code_salt, 64);
  const expectedHash = Buffer.from(challenge.code_hash, 'hex');
  if (actualHash.length !== expectedHash.length || !timingSafeEqual(actualHash, expectedHash)) {
    await client.query(
      'UPDATE phone_verification_challenges SET attempts = attempts + 1 WHERE phone_e164 = $1',
      [phone]
    );
    return false;
  }
  await client.query('DELETE FROM phone_verification_challenges WHERE phone_e164 = $1', [phone]);
  return true;
}

module.exports = { getMode, startPhoneVerification, verifyPhoneCode };
