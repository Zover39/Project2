export const PROMO_CODES = {
  ASTANA10: { code: 'ASTANA10', discountPercent: 10, label: 'Скидка 10% по промокоду ASTANA10' },
  SUMMER2026: { code: 'SUMMER2026', discountPercent: 12, label: 'Летняя скидка 12%' },
  VIP15: { code: 'VIP15', discountPercent: 15, minTotal: 1500000, label: 'VIP-скидка 15% от 1 500 000 ₸' }
};

/**
 * Validate a promo code against an optional subtotal.
 * @param {string} rawCode
 * @param {number} subtotal
 */
export const validatePromoCode = (rawCode, subtotal = 0) => {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { valid: false, reason: 'Введите промокод' };
  const promo = PROMO_CODES[code];
  if (!promo) return { valid: false, reason: 'Промокод не найден' };
  if (promo.minTotal && subtotal < promo.minTotal) {
    return {
      valid: false,
      reason: `Промокод ${code} действует от ${promo.minTotal.toLocaleString('ru-RU')} ₸`
    };
  }
  return { valid: true, promo };
};

/**
 * Calculate itemized tour price with child discount, early-bird discount, and promo code.
 */
export const calculateSmartTourPrice = ({
  basePrice = 0,
  nights = 7,
  adults = 2,
  children = 0,
  flightClass = 1,
  departureDate = '',
  promoCode = ''
}) => {
  const safeNights = Math.max(1, Number(nights) || 7);
  const safeAdults = Math.max(1, Number(adults) || 1);
  const safeChildren = Math.max(0, Number(children) || 0);
  const safeClass = Math.max(1, Number(flightClass) || 1);

  const nightsFactor = safeNights / 7;
  const effectivePax = safeAdults + safeChildren * 0.65;
  const subtotal = Math.round(basePrice * nightsFactor * effectivePax * safeClass);

  // Early-bird discount: 7% if departure is >= 30 days from today
  let earlyBirdDiscount = 0;
  if (departureDate) {
    const dep = new Date(`${departureDate}T00:00:00`);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dep - now) / (1000 * 60 * 60 * 24));
    if (diffDays >= 30) {
      earlyBirdDiscount = Math.round(subtotal * 0.07);
    }
  }

  const afterEarlyBird = Math.max(0, subtotal - earlyBirdDiscount);
  const promoCheck = promoCode ? validatePromoCode(promoCode, afterEarlyBird) : { valid: false };
  const promoDiscount = promoCheck.valid
    ? Math.round(afterEarlyBird * (promoCheck.promo.discountPercent / 100))
    : 0;

  const total = Math.max(0, afterEarlyBird - promoDiscount);

  return {
    subtotal,
    earlyBirdDiscount,
    promoDiscount,
    promoApplied: promoCheck.valid ? promoCheck.promo : null,
    promoError: promoCode && !promoCheck.valid ? promoCheck.reason : '',
    total
  };
};

// Legacy helper kept for backward compatibility
export const calculatePrice = ({ hotel, room, nights, adults, childrenCount, flightClass }) => {
  if (!hotel || !room) return 0;
  const result = calculateSmartTourPrice({
    basePrice: hotel.price + room.priceExtra,
    nights,
    adults,
    children: childrenCount,
    flightClass
  });
  return result.total;
};
