const { parsePhoneNumberFromString } = require('libphonenumber-js/max');
const { ApiError } = require('./http');

function normalizePhone(value) {
  if (typeof value !== 'string' || value.length > 40) {
    throw new ApiError(400, 'Введите корректный номер телефона');
  }
  const phone = parsePhoneNumberFromString(value.trim(), 'KZ');
  if (!phone?.isValid()) {
    throw new ApiError(400, 'Введите корректный номер телефона');
  }
  return phone.number;
}

module.exports = { normalizePhone };
